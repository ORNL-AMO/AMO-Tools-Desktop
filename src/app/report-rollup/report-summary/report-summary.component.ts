import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { ReportRollupService } from '../report-rollup.service';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('hideSummary')
  hideSummary = new EventEmitter<boolean>();
  showSummary: string = 'open';

  showPsatSummary: boolean;
  showPhastSummary: boolean;
  showFsatSummary: boolean;
  showSsmtSummary: boolean;
  psatAssessmentsSub: Subscription;
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  constructor(public reportRollupService: ReportRollupService, private psatReportRollupService: PsatReportRollupService,
    private phastReportRollupService: PhastReportRollupService, private fsatReportRollupService: FsatReportRollupService,
    private ssmtReportRollupService: SsmtReportRollupService) { }

  ngOnInit() {
    this.psatAssessmentsSub = this.psatReportRollupService.psatAssessments.subscribe(val => {
      this.showPsatSummary = val.length != 0;
    });

    this.phastAssessmentsSub = this.phastReportRollupService.phastAssessments.subscribe(val => {
      this.showPhastSummary = val.length != 0;
    });

    this.fsatAssessmentsSub = this.fsatReportRollupService.fsatAssessments.subscribe(val => {
      this.showFsatSummary = val.length != 0;
    });

    this.ssmtAssessmentsSub = this.ssmtReportRollupService.ssmtAssessments.subscribe(val => {
      this.showSsmtSummary = val.length != 0;
    })
  }

  ngOnDestroy() {
    this.psatAssessmentsSub.unsubscribe();
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
  }

  showAssessmentModal(assessmentModalType: string) {
    this.reportRollupService.showSummaryModal.next(assessmentModalType);
  }

  collapseSummary(str: string) {
    this.showSummary = str;
    setTimeout(() => {
      this.hideSummary.emit(true);
    }, 250);
  }
}
