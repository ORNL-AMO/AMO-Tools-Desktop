import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportItem } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';
import { Calculator } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { TreasureHuntReportRollupService } from '../treasure-hunt-report-rollup.service';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';
import { CompressedAirReportRollupService } from '../compressed-air-report-rollup.service';
import { ReportSummaryGraphsService } from '../report-summary-graphs/report-summary-graphs.service';
import { Assessment } from '../../shared/models/assessment';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Directory } from '../../shared/models/directory';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';

@Component({
  selector: 'app-assessment-reports',
  templateUrl: './assessment-reports.component.html',
  styleUrls: ['./assessment-reports.component.css']
})
export class AssessmentReportsComponent implements OnInit {

  _phastAssessments: Array<ReportItem>;
  _psatAssessments: Array<ReportItem>;
  _fsatAssessments: Array<ReportItem>;
  _ssmtAssessments: Array<ReportItem>;
  _treasureHuntAssessments: Array<ReportItem>;
  _wasteWaterAssessments: Array<ReportItem>;
  _compressedAirAssessments: Array<ReportItem>;
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  psatAssessmentSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  treasureHuntAssesmentsSub: Subscription;
  wasteWaterAssessmentsSub: Subscription;
  compressedAirAssessmentsSub: Subscription;
  printView: boolean;
  printViewSub: Subscription;
  rollupPrintOptions: PrintOptions;
  rollupPrintOptionsSub: Subscription;

  selectedCalcsSub: Subscription;
  selectedPsatCalcs: Array<Calculator>;
  selectedFsatCalcs: Array<Calculator>;
  selectedPhastCalcs: Array<Calculator>;
  settings: Settings;

  constructor(private reportRollupService: ReportRollupService, private printOptionsMenuService: PrintOptionsMenuService, private psatReportRollupService: PsatReportRollupService, private phastReportRollupService: PhastReportRollupService,
    private fsatReportRollupService: FsatReportRollupService, private ssmtReportRollupService: SsmtReportRollupService, private treasureHuntReportRollupService: TreasureHuntReportRollupService,
    private wasteWaterReportRollupService: WasteWaterReportRollupService, private compressedAirReportRollupService: CompressedAirReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService, private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.settings = this.reportRollupService.settings.getValue();
    this.psatAssessmentSub = this.psatReportRollupService.psatAssessments.subscribe(items => {
      if (items) {
        this._psatAssessments = items;
      }
    });
    this.phastAssessmentsSub = this.phastReportRollupService.phastAssessments.subscribe(items => {
      if (items) {
        this._phastAssessments = items;
      }
    });

    this.fsatAssessmentsSub = this.fsatReportRollupService.fsatAssessments.subscribe(items => {
      if (items) {
        this._fsatAssessments = items;
      }
    });

    this.ssmtAssessmentsSub = this.ssmtReportRollupService.ssmtAssessments.subscribe(items => {
      if (items) {
        this._ssmtAssessments = items;
      }
    });

    this.treasureHuntAssesmentsSub = this.treasureHuntReportRollupService.treasureHuntAssessments.subscribe(items => {
      if (items) {
        this._treasureHuntAssessments = items;
      }
    });

    this.printViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printView = val;
    });

    this.rollupPrintOptionsSub = this.printOptionsMenuService.printOptions.subscribe(val => {
      this.rollupPrintOptions = val;
    });

    this.selectedCalcsSub = this.reportRollupService.selectedCalcs.subscribe(selectedCalcs => {
      this.setSelectedCalcsArrays(selectedCalcs);
    });

    this.wasteWaterAssessmentsSub = this.wasteWaterReportRollupService.wasteWaterAssessments.subscribe(val => {
      if (val) {
        this._wasteWaterAssessments = val;
      }
    });
    this.compressedAirAssessmentsSub = this.compressedAirReportRollupService.compressedAirAssessments.subscribe(val => {
      if(val){
        this._compressedAirAssessments = val;
      }
    })
  }

  ngOnDestroy() {
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.psatAssessmentSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
    this.treasureHuntAssesmentsSub.unsubscribe();
    this.rollupPrintOptionsSub.unsubscribe();
    this.printViewSub.unsubscribe();
    this.selectedCalcsSub.unsubscribe();
    this.wasteWaterAssessmentsSub.unsubscribe();
    this.compressedAirAssessmentsSub.unsubscribe();
  }

  setSelectedCalcsArrays(selectedCalcs: Array<Calculator>) {
    this.selectedPsatCalcs = selectedCalcs.filter(item => { return item.type == 'pump' });
    this.selectedPhastCalcs = selectedCalcs.filter(item => { return item.type == 'furnace' });
    this.selectedFsatCalcs = selectedCalcs.filter(item => { return item.type == 'fan' });
  }

  goToAssessment(assessment: Assessment, mainTab?: string, subTab?: string) {
    let tab: string;
    let itemSegment: string;
    if (assessment.type === 'PSAT') {
      if (assessment.psat.setupDone && !mainTab && (!assessment.isExample)) {
        tab = 'assessment';
      }
      itemSegment = '/psat/';
    } else if (assessment.type === 'PHAST') {
      if (assessment.phast.setupDone && !mainTab && (!assessment.isExample)) {
        tab = 'assessment';
      }
      itemSegment = '/phast/';
    } else if (assessment.type === 'FSAT') {
      if (assessment.fsat.setupDone && !mainTab && !assessment.isExample) {
        tab = 'assessment';
      }
      itemSegment = '/fsat/';
    } else if (assessment.type === 'SSMT') {
      if (assessment.ssmt.setupDone && !mainTab && !assessment.isExample) {
        tab = 'assessment';
      }
      itemSegment = '/ssmt/';
    } else if (assessment.type == 'TreasureHunt') {
      if (assessment.treasureHunt.setupDone && !mainTab && !assessment.isExample) {
        tab = 'treasure-chest';
      }
      itemSegment = '/treasure-hunt/';
    } else if (assessment.type == 'WasteWater') {
      if (assessment.wasteWater.setupDone && !mainTab && !assessment.isExample) {
        tab = 'assessment';
      }
      itemSegment = '/waste-water/';
    } else if (assessment.type == 'CompressedAir') {
      if (assessment.compressedAirAssessment.setupDone && !mainTab && !assessment.isExample) {
        tab = 'assessment';
      }
      itemSegment = '/compressed-air/';
    }

    this.dashboardService.navigateWithSidebarOptions(itemSegment + assessment.id, {shouldCollapse: true})
  }


}
