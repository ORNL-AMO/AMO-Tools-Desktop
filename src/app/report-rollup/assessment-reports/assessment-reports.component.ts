import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportItem } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';
import { RollupPrintService, RollupPrintOptions } from '../rollup-print.service';

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
  rollupPrintOptions: RollupPrintOptions;
  rollupPrintOptionsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService, private rollupPrintService: RollupPrintService) { }

  ngOnInit(): void {
    this.psatAssessmentSub = this.reportRollupService.psatAssessments.subscribe(items => {
      if (items) {
        this._psatAssessments = items;
      }
    });
    this.phastAssessmentsSub = this.reportRollupService.phastAssessments.subscribe(items => {
      if (items) {
        this._phastAssessments = items;
      }
    });

    this.fsatAssessmentsSub = this.reportRollupService.fsatAssessments.subscribe(items => {
      if (items) {
        this._fsatAssessments = items;
      }
    });

    this.ssmtAssessmentsSub = this.reportRollupService.ssmtAssessments.subscribe(items => {
      if (items) {
        this._ssmtAssessments = items;
      }
    });

    this.treasureHuntAssesmentsSub = this.reportRollupService.treasureHuntAssessments.subscribe(items => {
      if (items) {
        this._treasureHuntAssessments = items;
      }
    });

    this.printViewSub = this.rollupPrintService.showPrintView.subscribe(val => {
      this.printView = val;
    });

    this.rollupPrintOptionsSub = this.rollupPrintService.rollupPrintOptions.subscribe(val => {
      this.rollupPrintOptions = val;
    });
  }

  ngOnDestroy() {
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.psatAssessmentSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
    this.treasureHuntAssesmentsSub.unsubscribe();
    this.printViewSub.unsubscribe();
  }
}
