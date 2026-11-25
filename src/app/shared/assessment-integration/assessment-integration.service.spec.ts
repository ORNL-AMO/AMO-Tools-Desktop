import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentService } from '../../dashboard/assessment.service';
import { PsatService } from '../../psat/psat.service';
import { FsatService } from '../../fsat/fsat.service';
import { PhastIntegrationService } from '../../phast/phast-integration.service';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment/compressed-air-assessment-results.service';
import { Assessment } from '../models/assessment';
import { Settings } from '../models/settings';
import { AssessmentIntegrationService, IntegratedAssessment } from './assessment-integration.service';
import { buildRebuiltAssessment } from '../../process-heating-assessment/services/rebuilt-assessment.fixture';

describe('AssessmentIntegrationService', () => {
  const assessment = buildRebuiltAssessment();

  let service: AssessmentIntegrationService;
  let phastIntegrationService: jasmine.SpyObj<PhastIntegrationService>;
  let assessmentDbService: jasmine.SpyObj<AssessmentDbService>;

  beforeEach(() => {
    assessmentDbService = jasmine.createSpyObj<AssessmentDbService>('AssessmentDbService', ['getAllAssessments', 'setAll']);
    assessmentDbService.getAllAssessments.and.returnValue(of([assessment]));
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['getByAssessmentId']);
    settingsDbService.getByAssessmentId.and.returnValue({ energySourceType: 'Fuel' } as Settings);
    phastIntegrationService = jasmine.createSpyObj<PhastIntegrationService>('PhastIntegrationService', ['setIntegratedAssessmentData']);
    phastIntegrationService.setIntegratedAssessmentData.and.callFake(async (integratedAssessment: IntegratedAssessment) => {
      integratedAssessment.navigation = { queryParams: undefined, url: '/phast/1' };
    });
    service = new AssessmentIntegrationService(
      assessmentDbService,
      {} as AssessmentService,
      {} as Router,
      settingsDbService,
      {} as PsatService,
      {} as FsatService,
      phastIntegrationService,
      {} as CompressedAirAssessmentResultsService,
    );
  });

  it('returns a PHAST integrated assessment only after its energy options are set', async () => {
    phastIntegrationService.setIntegratedAssessmentData.and.callFake(async (integratedAssessment: IntegratedAssessment) => {
      await Promise.resolve();
      integratedAssessment.navigation = { queryParams: undefined, url: '/phast/1' };
      integratedAssessment.hasModifications = true;
      integratedAssessment.energyOptions = { baseline: undefined, modifications: [] };
      await Promise.resolve();
      integratedAssessment.energyOptions.modifications.push({ name: 'Mod 1', modificationId: 'mod-1', annualEnergy: 0, co2EmissionsOutput: 0, annualCost: 0 });
    });

    const integratedAssessment = await service.setIntegratedAssessment(1, 'PHAST', {} as Settings);

    expect(integratedAssessment.energyOptions.modifications[0].modificationId).toBe('mod-1');
  });

  it('integrates a PHAST assessment in the legacy shape, without Auxiliary Power, leaving the saved one unchanged', async () => {
    const integratedAssessment = await service.setIntegratedAssessment(1, 'PHAST', {} as Settings);

    expect(integratedAssessment.assessment.phast.losses.auxiliaryPowerLosses).toBeUndefined();
    expect(integratedAssessment.assessment.phast.modifications[0].phast.name).toBe('Mod 1');
    expect(assessment.phast.modifications[0].phast).toBeUndefined();
  });

  it('links back to Process Heating when the legacy module cannot open the assessment', async () => {
    const integratedAssessment = await service.setIntegratedAssessment(1, 'PHAST', {} as Settings);

    expect(integratedAssessment.navigation.url).toBe('/process-heating/1');
  });

  it('links back to Process Heating once it has saved a legacy assessment', async () => {
    const savedByProcessHeating = { ...assessment, phast: { ...assessment.phast, modifications: [{ id: 'm1', phast: { name: 'Stale' }, scenarioOverrides: { name: 'Mod 1' } }] } } as unknown as Assessment;
    assessmentDbService.getAllAssessments.and.returnValue(of([savedByProcessHeating]));

    const integratedAssessment = await service.setIntegratedAssessment(1, 'PHAST', {} as Settings);

    expect(integratedAssessment.navigation.url).toBe('/process-heating/1');
  });

  it('keeps the legacy link for a legacy assessment Process Heating has not saved', async () => {
    const legacyOnly = { ...assessment, phast: { ...assessment.phast, modifications: [{ id: 'm1', phast: { name: 'Mod 1' } }] } } as unknown as Assessment;
    assessmentDbService.getAllAssessments.and.returnValue(of([legacyOnly]));

    const integratedAssessment = await service.setIntegratedAssessment(1, 'PHAST', {} as Settings);

    expect(integratedAssessment.navigation.url).toBe('/phast/1');
  });

  describe('an assessment with no heat balance', () => {
    let withoutHeatBalance: Assessment;

    beforeEach(() => {
      withoutHeatBalance = buildRebuiltAssessment();
      delete withoutHeatBalance.phast.losses;
      assessmentDbService.getAllAssessments.and.returnValue(of([assessment, { ...withoutHeatBalance, id: 2 }]));
    });

    it('is left out of the Process Heating assessments offered for linking', async () => {
      const options = await service.getAssessmentOptionsByType('PHAST');

      expect(options.map(option => option.id)).toEqual([1]);
    });

    it('integrates without energy options and still links back', async () => {
      const integratedAssessment = await service.setIntegratedAssessment(2, 'PHAST', {} as Settings);

      expect(phastIntegrationService.setIntegratedAssessmentData).not.toHaveBeenCalled();
      expect(integratedAssessment.energyOptions).toBeUndefined();
      expect(integratedAssessment.navigation.url).toBe('/process-heating/2');
    });
  });

  describe('checkHasUpdatedEnergyData', () => {
    const option = (modificationId: string | undefined, annualCost: number) => ({ name: 'Option', modificationId, annualEnergy: 10, co2EmissionsOutput: 1, annualCost });

    it('flags a linked modification that no longer exists', () => {
      const existing = { baseline: option(undefined, 100), modifications: [option('m1', 80)] };
      const updated = { baseline: option(undefined, 100), modifications: [option('m2', 70)] };

      expect(service.checkHasUpdatedEnergyData(existing, updated)).toBeTrue();
    });

    it('compares only the baseline when no modification is linked', () => {
      const existing = { baseline: option(undefined, 100), modifications: [] };

      expect(service.checkHasUpdatedEnergyData(existing, { baseline: option(undefined, 100), modifications: [option('m1', 80)] })).toBeFalse();
      expect(service.checkHasUpdatedEnergyData(existing, { baseline: option(undefined, 90), modifications: [] })).toBeTrue();
    });

    it('leaves an unchanged linked modification unflagged', () => {
      const existing = { baseline: option(undefined, 100), modifications: [option('m1', 80)] };

      expect(service.checkHasUpdatedEnergyData(existing, { baseline: option(undefined, 100), modifications: [option('m1', 80)] })).toBeFalse();
    });
  });
});
