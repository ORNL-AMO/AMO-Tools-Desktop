import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { ReportRollupService } from '../report-rollup.service';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { TreasureHuntReportRollupService } from '../treasure-hunt-report-rollup.service';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {
  @Output('hideSummary')
  hideSummary = new EventEmitter<boolean>();
  
  showSummary: string = 'open';

  showPsatSummary: boolean;
  showPhastSummary: boolean;
  showFsatSummary: boolean;
  showSsmtSummary: boolean;
  showTreasureHuntSummary: boolean;
  showWasteWater: boolean;
  psatAssessmentsSub: Subscription;
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  treasureHuntAssessmentsSub: Subscription;
  wasteWaterAssessmentsSub: Subscription;
  settings: Settings;
  settingsSub: Subscription;
  constructor(public reportRollupService: ReportRollupService, private psatReportRollupService: PsatReportRollupService,
    private phastReportRollupService: PhastReportRollupService, private fsatReportRollupService: FsatReportRollupService,
    private ssmtReportRollupService: SsmtReportRollupService, private treasureHuntReportRollupService: TreasureHuntReportRollupService,
    private wasteWaterReportRollupService: WasteWaterReportRollupService) { }

  ngOnInit() {
    this.settingsSub = this.reportRollupService.settings.subscribe(settings => {
      this.settings = settings;
    });
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
    });

    this.treasureHuntAssessmentsSub = this.treasureHuntReportRollupService.treasureHuntAssessments.subscribe(val => {
      this.showTreasureHuntSummary = val.length != 0;
    });

    this.wasteWaterAssessmentsSub = this.wasteWaterReportRollupService.wasteWaterAssessments.subscribe(val => {
      this.showWasteWater = val.length != 0;
    });

  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
    this.phastAssessmentsSub.unsubscribe();
    this.fsatAssessmentsSub.unsubscribe();
    this.ssmtAssessmentsSub.unsubscribe();
    this.treasureHuntAssessmentsSub.unsubscribe();
    this.wasteWaterAssessmentsSub.unsubscribe();
    this.wasteWaterAssessmentsSub.unsubscribe();
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
