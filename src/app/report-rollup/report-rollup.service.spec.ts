import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { SettingsService } from '../settings/settings.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { PsatReportRollupService } from './psat-report-rollup.service';
import { PhastReportRollupService } from './phast-report-rollup.service';
import { FsatReportRollupService } from './fsat-report-rollup.service';
import { SsmtReportRollupService } from './ssmt-report-rollup.service';
import { TreasureHuntReportRollupService } from './treasure-hunt-report-rollup.service';
import { WasteWaterReportRollupService } from './waste-water-report-rollup.service';
import { CompressedAirReportRollupService } from './compressed-air-report-rollup.service';
import { ReportRollupService } from './report-rollup.service';
import { buildRebuiltAssessment } from '../process-heating-assessment/services/rebuilt-assessment.fixture';

describe('ReportRollupService.pushAssessment', () => {
  let service: ReportRollupService;

  beforeEach(() => {
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['getByAssessmentId']);
    settingsDbService.getByAssessmentId.and.returnValue({ energySourceType: 'Fuel', energyResultUnit: 'MMBtu', phastRollupUnit: 'MMBtu', temperatureMeasurement: 'F' } as Settings);
    const rollupService = () => jasmine.createSpyObj('RollupService', ['initSummary']);
    service = new ReportRollupService(
      {} as SettingsService,
      {} as DirectoryDbService,
      {} as AssessmentDbService,
      settingsDbService,
      {} as CalculatorDbService,
      rollupService() as PsatReportRollupService,
      rollupService() as PhastReportRollupService,
      rollupService() as FsatReportRollupService,
      rollupService() as SsmtReportRollupService,
      rollupService() as TreasureHuntReportRollupService,
      rollupService() as WasteWaterReportRollupService,
      rollupService() as CompressedAirReportRollupService,
    );
    service.assessmentsArray = [];
  });

  it('adds a PHAST assessment in the legacy shape, without Auxiliary Power, leaving the saved one unchanged', () => {
    const assessment = buildRebuiltAssessment();

    service.pushAssessment(assessment);

    const pushed = service.assessmentsArray[0].assessment;
    expect(pushed).not.toBe(assessment);
    expect(pushed.phast.losses.auxiliaryPowerLosses).toBeUndefined();
    expect(pushed.phast.modifications[0].phast.name).toBe('Mod 1');
    expect(pushed.phast.setupDone).toBeTrue();
    expect(assessment.phast.modifications[0].phast).toBeUndefined();
  });

  it('adds other assessment types as saved', () => {
    const assessment = { id: 2, type: 'PSAT' } as Assessment;

    service.pushAssessment(assessment);

    expect(service.assessmentsArray[0].assessment).toBe(assessment);
  });
});
