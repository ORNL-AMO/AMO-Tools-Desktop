import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ReportItem } from '../report-rollup-models';
import { Subscription } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ReportRollupService } from '../report-rollup.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { TreasureHuntReportRollupService } from '../treasure-hunt-report-rollup.service';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';
import { CompressedAirReportRollupService } from '../compressed-air-report-rollup.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
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
  _wasteWaterAssessments: Array<ReportItem>;
  _compressedAirAssessments: Array<ReportItem>;
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  psatAssessmentSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  treasureHuntAssesmentsSub: Subscription;
  reportAssessmentsSub: Subscription;
  wasteWaterAssessmentsSub: Subscription;
  compressedAirAssessmentsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService, private windowRefService: WindowRefService, private psatReportRollupService: PsatReportRollupService,
    private phastReportRollupService: PhastReportRollupService, private fsatReportRollupService: FsatReportRollupService, private ssmtReportRollupService: SsmtReportRollupService,
    private treasureHuntReportRollupService: TreasureHuntReportRollupService, private wasteWaterReportRollupService: WasteWaterReportRollupService,
    private compressedAirReportRollupService: CompressedAirReportRollupService) { }

  ngOnInit(): void {
    this._phastAssessments = new Array<ReportItem>();
    this._psatAssessments = new Array<ReportItem>();
    this._fsatAssessments = new Array<ReportItem>();
    this._ssmtAssessments = new Array<ReportItem>();
    this._treasureHuntAssessments = new Array<ReportItem>();
    this._reportAssessments = new Array<ReportItem>();
    this._wasteWaterAssessments = new Array<ReportItem>();
    this._compressedAirAssessments = new Array<ReportItem>();
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
    this.reportAssessmentsSub = this.reportRollupService.reportAssessments.subscribe(items => {
      if (items) {
        this._reportAssessments = items;
      }
    });

    this.wasteWaterAssessmentsSub = this.wasteWaterReportRollupService.wasteWaterAssessments.subscribe(items => {
      if (items) {
        this._wasteWaterAssessments = items;
      }
    });

    this.compressedAirAssessmentsSub = this.compressedAirReportRollupService.compressedAirAssessments.subscribe(items => {
      if (items) {
        this._compressedAirAssessments = items;
      }
    })

    // this.initFocusedAssessment();
    this.setFocusGraphs();
  }

  ngOnDestroy() {
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.psatAssessmentSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
    this.treasureHuntAssesmentsSub.unsubscribe();
    this.wasteWaterAssessmentsSub.unsubscribe();
    this.reportAssessmentsSub.unsubscribe();
    this.compressedAirAssessmentsSub.unsubscribe();
  }

  collapseSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  // initFocusedAssessment() {
  //   if (!this.focusedAssessment) {
  //     if (this._psatAssessments.length != 0) {
  //       this.focusedAssessment = this._psatAssessments[0].assessment;
  //     } else if (this._phastAssessments.length != 0) {
  //       this.focusedAssessment = this._phastAssessments[0].assessment;
  //     } else if (this._fsatAssessments.length != 0) {
  //       this.focusedAssessment = this._fsatAssessments[0].assessment;
  //     } else if (this._ssmtAssessments.length != 0) {
  //       this.focusedAssessment = this._ssmtAssessments[0].assessment;
  //     } else if (this._treasureHuntAssessments.length != 0) {
  //       this.focusedAssessment = this._treasureHuntAssessments[0].assessment;
  //     } else if(this._wasteWaterAssessments.length != 0){
  //       this.focusedAssessment = this._wasteWaterAssessments[0].assessment;
  //     } else if(this._compressedAirAssessments.length != 0){
  //       this.focusedAssessment = this._compressedAirAssessments[0].assessment;
  //     }
  //   }
  // }

  setFocused(assessment: Assessment) {
    this.focusedAssessment = assessment;
  }

  setFocusGraphs() {
    this.focusedAssessment = {
      id: undefined,
      type: undefined,
      name: undefined
    }
  }

  checkActiveAssessment() {
    let scrollAmount = this.windowRefService.nativeWindow.pageYOffset;
    if (scrollAmount) {
      let doc = this.windowRefService.getDoc();
      let element = doc.getElementById('rollup_graphs');
      let diff = Math.abs(Math.abs(this.bannerHeight - element.offsetTop) - scrollAmount);
      if (diff > 0 && diff < 50) {
        this.setFocusGraphs();
      } else {
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
}
