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

describe('AssessmentIntegrationService', () => {
  const assessment = { id: 1, type: 'PHAST' } as Assessment;

  let service: AssessmentIntegrationService;
  let phastIntegrationService: jasmine.SpyObj<PhastIntegrationService>;

  beforeEach(() => {
    const assessmentDbService = jasmine.createSpyObj<AssessmentDbService>('AssessmentDbService', ['getAllAssessments', 'setAll']);
    assessmentDbService.getAllAssessments.and.returnValue(of([assessment]));
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['getByAssessmentId']);
    settingsDbService.getByAssessmentId.and.returnValue({} as Settings);
    phastIntegrationService = jasmine.createSpyObj<PhastIntegrationService>('PhastIntegrationService', ['setIntegratedAssessmentData']);
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
      integratedAssessment.hasModifications = true;
      integratedAssessment.energyOptions = { baseline: undefined, modifications: [] };
      await Promise.resolve();
      integratedAssessment.energyOptions.modifications.push({ name: 'Mod 1', modificationId: 'mod-1', annualEnergy: 0, co2EmissionsOutput: 0, annualCost: 0 });
    });

    const integratedAssessment = await service.setIntegratedAssessment(1, 'PHAST', {} as Settings);

    expect(integratedAssessment.energyOptions.modifications[0].modificationId).toBe('mod-1');
  });
});
