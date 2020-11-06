import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportItem } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';
import { Calculator } from '../../shared/models/calculators';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { Settings } from '../../shared/models/settings';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';

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
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  psatAssessmentSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  treasureHuntAssesmentsSub: Subscription;
  printView: boolean;
  printViewSub: Subscription;
  rollupPrintOptions: PrintOptions;
  rollupPrintOptionsSub: Subscription;

  selectedCalcsSub: Subscription;
  selectedPsatCalcs: Array<Calculator>;
  selectedFsatCalcs: Array<Calculator>;
  selectedPhastCalcs: Array<Calculator>;
  settings: Settings;

  constructor(private reportRollupService: ReportRollupService, private printOptionsMenuService: PrintOptionsMenuService, private settingsDbService: SettingsDbService,
    private directoryDashboardService: DirectoryDashboardService, private psatReportRollupService: PsatReportRollupService, private phastReportRollupService: PhastReportRollupService,
    private fsatReportRollupService: FsatReportRollupService, private ssmtReportRollupService: SsmtReportRollupService) { }

  ngOnInit(): void {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.settings = this.settingsDbService.getByDirectoryId(directoryId);
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

    this.treasureHuntAssesmentsSub = this.reportRollupService.treasureHuntAssessments.subscribe(items => {
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
  }

  ngOnDestroy() {
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.psatAssessmentSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
    this.treasureHuntAssesmentsSub.unsubscribe();
    this.printViewSub.unsubscribe();
    this.selectedCalcsSub.unsubscribe();
  }

  setSelectedCalcsArrays(selectedCalcs: Array<Calculator>) {
    this.selectedPsatCalcs = selectedCalcs.filter(item => { return item.type == 'pump' });
    this.selectedPhastCalcs = selectedCalcs.filter(item => { return item.type == 'furnace' });
    this.selectedFsatCalcs = selectedCalcs.filter(item => { return item.type == 'fan' });
  }
}
