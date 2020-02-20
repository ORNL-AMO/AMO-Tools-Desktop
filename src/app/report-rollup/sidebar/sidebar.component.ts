import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ReportItem } from '../report-rollup-models';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ReportRollupService } from '../report-rollup.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';

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

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.checkActiveAssessment();
  }
  
  focusedAssessment: Assessment;

  sidebarCollapsed: boolean = false;
  _phastAssessments: Array<ReportItem>;
  _psatAssessments: Array<ReportItem>;
  _fsatAssessments: Array<ReportItem>;
  _ssmtAssessments: Array<ReportItem>;
  _treasureHuntAssessments: Array<ReportItem>;
  _reportAssessments: Array<ReportItem>;
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  psatAssessmentSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  treasureHuntAssesmentsSub: Subscription;
  reportAssessmentsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService, private windowRefService: WindowRefService) { }

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
    this.reportAssessmentsSub = this.reportRollupService.reportAssessments.subscribe(items => {
      if (items) {
        // if (items.length !== 0) {
        this._reportAssessments = items;
        // this.focusedAssessment = this._reportAssessments[this._reportAssessments.length - 1].assessment;
        // }
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

  checkActiveAssessment() {
    let scrollAmount = this.windowRefService.nativeWindow.pageYOffset;
    if (scrollAmount) {
      this._reportAssessments.forEach(item => {
        let doc = this.windowRefService.getDoc();
        let element = doc.getElementById('assessment_' + item.assessment.id);
        let diff = Math.abs(Math.abs(this.bannerHeight - element.offsetTop) - scrollAmount);
        if (diff > 0 && diff < 50) {
          this.focusedAssessment = item.assessment;
        }
      });
    }
  }
}
