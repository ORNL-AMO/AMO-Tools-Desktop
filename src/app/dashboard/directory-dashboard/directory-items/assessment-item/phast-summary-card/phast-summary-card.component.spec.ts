import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExecutiveSummary, PHAST } from '../../../../../shared/models/phast/phast';
import { Settings } from '../../../../../shared/models/settings';
import { ExecutiveSummaryService } from '../../../../../phast/phast-report/executive-summary.service';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { AssessmentService } from '../../../../assessment.service';
import { PhastSummaryCardComponent } from './phast-summary-card.component';
import { buildRebuiltAssessment } from '../../../../../process-heating-assessment/services/rebuilt-assessment.fixture';

describe('PhastSummaryCardComponent', () => {
  let component: PhastSummaryCardComponent;
  let executiveSummaryService: jasmine.SpyObj<ExecutiveSummaryService>;

  beforeEach(() => {
    executiveSummaryService = jasmine.createSpyObj<ExecutiveSummaryService>('ExecutiveSummaryService', ['getSummary']);
    executiveSummaryService.getSummary.and.returnValue({ annualCostSavings: 10 } as ExecutiveSummary);
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['getByAssessmentId']);
    settingsDbService.getByAssessmentId.and.returnValue({ energySourceType: 'Fuel' } as Settings);
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [PhastSummaryCardComponent],
      providers: [
        { provide: ExecutiveSummaryService, useValue: executiveSummaryService },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: AssessmentService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    component = TestBed.createComponent(PhastSummaryCardComponent).componentInstance;
  });

  describe('initialization', () => {
    it('summarizes the legacy-shaped copy, without Auxiliary Power, and leaves the saved assessment unchanged', () => {
      const assessment = buildRebuiltAssessment();
      component.assessment = assessment;

      component.ngOnInit();

      const [baselinePhast] = executiveSummaryService.getSummary.calls.argsFor(0);
      const [modificationPhast] = executiveSummaryService.getSummary.calls.argsFor(1);
      expect(baselinePhast.losses.auxiliaryPowerLosses).toBeUndefined();
      expect(modificationPhast.name).toBe('Mod 1');
      expect(component.legacyAssessment.phast).toBe(baselinePhast as PHAST);
      expect(component.numMods).toBe(1);
      expect(assessment.phast.modifications[0].phast).toBeUndefined();
    });

    it('does not summarize an assessment that is not set up', () => {
      const assessment = buildRebuiltAssessment();
      assessment.phast.setupDone = false;
      component.assessment = assessment;

      component.ngOnInit();

      expect(executiveSummaryService.getSummary).not.toHaveBeenCalled();
    });

    it('does not summarize a set-up assessment without a heat balance', () => {
      const assessment = buildRebuiltAssessment();
      delete assessment.phast.losses;
      component.assessment = assessment;

      component.ngOnInit();

      expect(component.setupDone).toBeFalse();
      expect(executiveSummaryService.getSummary).not.toHaveBeenCalled();
    });
  });
});
