import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Directory } from '../../../shared/models/directory';
import { ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { DashboardService } from '../../dashboard.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PsatService } from '../../../psat/psat.service';
import { ExecutiveSummaryService } from '../../../phast/phast-report/executive-summary.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FsatService } from '../../../fsat/fsat.service';
import { SsmtService } from '../../../ssmt/ssmt.service';
import { SettingsService } from '../../../settings/settings.service';
import { WasteWaterService } from '../../../waste-water/waste-water.service';
import { CompressedAirCalculationService } from '../../../compressed-air-assessment/compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { ContactDbService } from '../../../indexedDb/contact-db.service';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { DirectorySummaryComponent } from './directory-summary.component';
import { buildRebuiltAssessment } from '../../../process-heating-assessment/services/rebuilt-assessment.fixture';

describe('DirectorySummaryComponent', () => {
  let component: DirectorySummaryComponent;
  let executiveSummaryService: jasmine.SpyObj<ExecutiveSummaryService>;

  beforeEach(() => {
    executiveSummaryService = jasmine.createSpyObj<ExecutiveSummaryService>('ExecutiveSummaryService', ['getSummary']);
    executiveSummaryService.getSummary.and.returnValue({ annualEnergyUsed: 100, annualCost: 50 } as ExecutiveSummary);
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['getByAssessmentId']);
    settingsDbService.getByAssessmentId.and.returnValue({ energySourceType: 'Fuel', energyResultUnit: 'MMBtu' } as Settings);
    const convertUnitsService = jasmine.createSpyObj<ConvertUnitsService>('ConvertUnitsService', ['value']);
    convertUnitsService.value.and.callFake((value: number) => ({ from: () => ({ to: () => value }) }) as unknown as ConvertUnitsService);
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [DirectorySummaryComponent],
      providers: [
        { provide: ExecutiveSummaryService, useValue: executiveSummaryService },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: ConvertUnitsService, useValue: convertUnitsService },
        { provide: DirectoryDashboardService, useValue: {} },
        { provide: DirectoryDbService, useValue: {} },
        { provide: DashboardService, useValue: {} },
        { provide: PsatService, useValue: {} },
        { provide: FsatService, useValue: {} },
        { provide: SsmtService, useValue: {} },
        { provide: SettingsService, useValue: {} },
        { provide: WasteWaterService, useValue: {} },
        { provide: CompressedAirCalculationService, useValue: {} },
        { provide: AssessmentCo2SavingsService, useValue: {} },
        { provide: ContactDbService, useValue: {} },
        { provide: ModalDialogService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    component = TestBed.createComponent(DirectorySummaryComponent).componentInstance;
    // ngOnInit is never run here, so give ngOnDestroy the subscriptions it would have created.
    component.directoryIdSub = new Subscription();
    component.updateDashboardDataSub = new Subscription();
  });

  describe('calculatePhastSummary', () => {
    it('totals the legacy-shaped baseline, without Auxiliary Power, and leaves the saved assessment unchanged', () => {
      const assessment = buildRebuiltAssessment();
      component.directory = { assessments: [assessment] } as Directory;
      component.directorySettings = { energyResultUnit: 'MMBtu' } as Settings;

      component.calculatePhastSummary();

      const [baselinePhast] = executiveSummaryService.getSummary.calls.mostRecent().args;
      expect(baselinePhast.losses.auxiliaryPowerLosses).toBeUndefined();
      expect(component.phastSummary).toEqual({ totalAssessments: 1, totalCost: 50, totalEnergyUsed: 100 });
      expect(assessment.phast.losses.auxiliaryPowerLosses).toBeDefined();
    });

    it('leaves out a set-up assessment without a heat balance', () => {
      const assessment = buildRebuiltAssessment();
      delete assessment.phast.losses;
      component.directory = { assessments: [assessment] } as Directory;
      component.directorySettings = { energyResultUnit: 'MMBtu' } as Settings;

      component.calculatePhastSummary();

      expect(executiveSummaryService.getSummary).not.toHaveBeenCalled();
      expect(component.phastSummary).toEqual({ totalAssessments: 1, totalCost: 0, totalEnergyUsed: 0 });
    });
  });
});
