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
    private wasteWaterReportRollupService: WasteWaterReportRollupService, private compressedAirReportRollupService: CompressedAirReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService) { }

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

    this.reportSummaryGraphService.getEnergyGraphData(this.settings);
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
}
