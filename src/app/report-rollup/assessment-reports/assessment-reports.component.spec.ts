import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { DashboardService } from '../../dashboard/dashboard.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { ReportRollupService } from '../report-rollup.service';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { TreasureHuntReportRollupService } from '../treasure-hunt-report-rollup.service';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';
import { CompressedAirReportRollupService } from '../compressed-air-report-rollup.service';
import { ReportSummaryGraphsService } from '../report-summary-graphs/report-summary-graphs.service';
import { AssessmentReportsComponent } from './assessment-reports.component';

function buildPhastAssessment(modifications: object[]): Assessment {
  return { id: 1, type: 'PHAST', phast: { name: 'Baseline', modifications } } as unknown as Assessment;
}

describe('AssessmentReportsComponent', () => {
  let component: AssessmentReportsComponent;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let assessmentDbService: jasmine.SpyObj<AssessmentDbService>;

  beforeEach(() => {
    dashboardService = jasmine.createSpyObj<DashboardService>('DashboardService', ['navigateWithSidebarOptions']);
    assessmentDbService = jasmine.createSpyObj<AssessmentDbService>('AssessmentDbService', ['findById']);
    TestBed.configureTestingModule({
      declarations: [AssessmentReportsComponent],
      providers: [
        { provide: ReportRollupService, useValue: {} },
        { provide: PrintOptionsMenuService, useValue: {} },
        { provide: PsatReportRollupService, useValue: {} },
        { provide: PhastReportRollupService, useValue: {} },
        { provide: FsatReportRollupService, useValue: {} },
        { provide: SsmtReportRollupService, useValue: {} },
        { provide: TreasureHuntReportRollupService, useValue: {} },
        { provide: WasteWaterReportRollupService, useValue: {} },
        { provide: CompressedAirReportRollupService, useValue: {} },
        { provide: ReportSummaryGraphsService, useValue: {} },
        { provide: DashboardService, useValue: dashboardService },
        { provide: AssessmentDbService, useValue: assessmentDbService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    component = TestBed.createComponent(AssessmentReportsComponent).componentInstance;
    // ngOnInit is never run here, so give ngOnDestroy the subscriptions it would have created.
    component.phastAssessmentsSub = new Subscription();
    component.fsatAssessmentsSub = new Subscription();
    component.psatAssessmentSub = new Subscription();
    component.ssmtAssessmentsSub = new Subscription();
    component.treasureHuntAssesmentsSub = new Subscription();
    component.rollupPrintOptionsSub = new Subscription();
    component.printViewSub = new Subscription();
    component.selectedCalcsSub = new Subscription();
    component.wasteWaterAssessmentsSub = new Subscription();
    component.compressedAirAssessmentsSub = new Subscription();
  });

  describe('goToAssessment', () => {
    it('opens Process Heating from the saved assessment, not the converted copy the rollup holds', () => {
      const convertedCopy = buildPhastAssessment([{ id: 'm1', phast: { name: 'Mod 1' } }]);
      assessmentDbService.findById.and.returnValue(buildPhastAssessment([{ id: 'm1', scenarioOverrides: {} }]));

      component.goToAssessment(convertedCopy);

      expect(assessmentDbService.findById).toHaveBeenCalledWith(1);
      expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/process-heating/1', { shouldCollapse: true });
    });

    it('opens the legacy module for a legacy assessment Process Heating has not saved', () => {
      const legacyAssessment = buildPhastAssessment([{ id: 'm1', phast: { name: 'Mod 1' } }]);
      assessmentDbService.findById.and.returnValue(legacyAssessment);

      component.goToAssessment(legacyAssessment);

      expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/phast/1', { shouldCollapse: true });
    });
  });
});
