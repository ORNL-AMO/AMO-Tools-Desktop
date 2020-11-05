import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { PhastResultsData } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';

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
  psatAssessmentsSub: Subscription;
  constructor(public reportRollupService: ReportRollupService, private psatReportRollupService: PsatReportRollupService) { }

  ngOnInit() {
    this.psatAssessmentsSub = this.psatReportRollupService.psatAssessments.subscribe(val => {
      this.showPsatSummary = val.length != 0;
    });
  }

  ngOnDestroy(){
    this.psatAssessmentsSub.unsubscribe();
  }

  showAssessmentModal(assessmentModalType: string){
    this.reportRollupService.showSummaryModal.next(assessmentModalType);
  }

  collapseSummary(str: string) {
    this.showSummary = str;
    setTimeout(() => {
      this.hideSummary.emit(true);
    }, 250);
  }
}
