import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
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
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
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
