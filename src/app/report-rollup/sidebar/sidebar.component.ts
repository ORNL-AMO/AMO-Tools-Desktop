import { Component, OnInit, Input } from '@angular/core';
import { ReportItem } from '../report-rollup-models';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ReportRollupService } from '../report-rollup.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input()
  sidebarHeight: number;
  @Input()
  bannerHeight: number;
  @Input()
  focusedAssessment: Assessment;

  sidebarCollapsed: boolean = false;
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
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit(): void {
    this._phastAssessments = new Array<ReportItem>();
    this._psatAssessments = new Array<ReportItem>();
    this._fsatAssessments = new Array<ReportItem>();
    this._ssmtAssessments = new Array<ReportItem>();
    this._treasureHuntAssessments = new Array<ReportItem>();
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
    this.initFocusedAssessment();
  }

  ngOnDestroy() {
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.psatAssessmentSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
    this.treasureHuntAssesmentsSub.unsubscribe();
  }

  collapseSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  initFocusedAssessment() {
    if (!this.focusedAssessment) {
      if (this._psatAssessments.length != 0) {
        this.focusedAssessment = this._psatAssessments[0].assessment;
      } else if (this._phastAssessments.length != 0) {
        this.focusedAssessment = this._phastAssessments[0].assessment;
      } else if (this._fsatAssessments.length != 0) {
        this.focusedAssessment = this._fsatAssessments[0].assessment;
      } else if (this._ssmtAssessments.length != 0) {
        this.focusedAssessment = this._ssmtAssessments[0].assessment;
      } else if (this._treasureHuntAssessments.length != 0) {
        this.focusedAssessment = this._treasureHuntAssessments[0].assessment;
      }
    }
  }

  setFocused(assessment: Assessment) {
    this.focusedAssessment = assessment;
  }
}
