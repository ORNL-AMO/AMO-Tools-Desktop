import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportItem } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';
import { Router, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

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
  constructor(private reportRollupService: ReportRollupService, private router: Router, private viewportScroller: ViewportScroller) { }

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

    // this.router.events.pipe(filter(e => e instanceof Scroll)).subscribe((e: any) => {
    //   console.log(e);

    //   // this is fix for dynamic generated(loaded..?) content
    //   setTimeout(() => {
    //     if (e.position) {
    //       this.viewportScroller.scrollToPosition(e.position);
    //     } else if (e.anchor) {
    //       this.viewportScroller.scrollToAnchor(e.anchor);
    //     } else {
    //       this.viewportScroller.scrollToPosition([0, 0]);
    //     }
    //   });
    // });
  }

  ngOnDestroy() {
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.psatAssessmentSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
    this.treasureHuntAssesmentsSub.unsubscribe();
  }
}
