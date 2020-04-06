import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ReportRollupService } from './report-rollup.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { Settings } from '../shared/models/settings';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { ReportItem } from './report-rollup-models';
import { ViewportScroller } from '@angular/common';
import { DirectoryDashboardService } from '../dashboard/directory-dashboard/directory-dashboard.service';
import { PrintOptionsMenuService } from '../shared/print-options-menu/print-options-menu.service';

@Component({
  selector: 'app-report-rollup',
  templateUrl: './report-rollup.component.html',
  styleUrls: ['./report-rollup.component.css']
})
export class ReportRollupComponent implements OnInit {

  _reportAssessments: Array<ReportItem>;
  _phastAssessments: Array<ReportItem>;
  _psatAssessments: Array<ReportItem>;
  _fsatAssessments: Array<ReportItem>;
  _ssmtAssessments: Array<ReportItem>;
  _treasureHuntAssessments: Array<ReportItem>;
  bannerHeight: number;
  assessmentsGathered: boolean = false;
  createdDate: Date;
  settings: Settings;

  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  @ViewChild('assessmentReportsDiv', { static: false }) assessmentReportsDiv: ElementRef;
  sidebarHeight: number = 0;
  printView: boolean = false;
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  allPhastSub: Subscription;
  selectedPhastSub: Subscription;
  psatAssessmentSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  treasureHuntAssesmentsSub: Subscription;
  showPrintSub: Subscription;

  gatheringAssessments: boolean = true;
  constructor(private viewportScroller: ViewportScroller, private reportRollupService: ReportRollupService, private windowRefService: WindowRefService,
    private settingsDbService: SettingsDbService, private cd: ChangeDetectorRef, private directoryDashboardService: DirectoryDashboardService,
    private printOptionsMenuService: PrintOptionsMenuService) { }

  ngOnInit() {
    this._phastAssessments = new Array<ReportItem>();
    this._psatAssessments = new Array<ReportItem>();
    this._fsatAssessments = new Array<ReportItem>();
    this._ssmtAssessments = new Array<ReportItem>();
    this._treasureHuntAssessments = new Array<ReportItem>();
    this.getSettings();

    setTimeout(() => {
      this.gatheringAssessments = false;
      this.cd.detectChanges();
    }, 1000)
    setTimeout(() => {
      this.assessmentsGathered = true;
      this.cd.detectChanges();
    }, 1500);
    setTimeout(() => {
      this.setSidebarHeight();
      this.cd.detectChanges();
    }, 1600);

    this.createdDate = new Date();

    this.showPrintSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printView = val;
    });

    this.allPhastSub = this.reportRollupService.allPhastResults.subscribe(val => {
      if (val.length !== 0) {
        this.reportRollupService.initPhastCompare(val);
      }
    });
    this.selectedPhastSub = this.reportRollupService.selectedPhasts.subscribe(val => {
      if (val.length !== 0) {
        this.reportRollupService.getPhastResultsFromSelected(val);
      }
    });
    this.psatAssessmentSub = this.reportRollupService.psatAssessments.subscribe(items => {
      if (items) {
        this._psatAssessments = items;
        this.reportRollupService.numPsats = this._psatAssessments.length;
      } else {
        this.reportRollupService.numPsats = 0;
      }
    });
    this.phastAssessmentsSub = this.reportRollupService.phastAssessments.subscribe(items => {
      if (items) {
        this.reportRollupService.initPhastResultsArr(items);
        this._phastAssessments = items;
        this.reportRollupService.numPhasts = this._phastAssessments.length;
      } else {
        this.reportRollupService.numPhasts = 0;
      }
    });

    this.fsatAssessmentsSub = this.reportRollupService.fsatAssessments.subscribe(items => {
      if (items) {
        this._fsatAssessments = items;
        this.reportRollupService.numFsats = this._fsatAssessments.length;
        this.reportRollupService.initFsatResultsArr(items);
      } else {
        this.reportRollupService.numFsats = 0;
      }
    });

    this.ssmtAssessmentsSub = this.reportRollupService.ssmtAssessments.subscribe(items => {
      if (items) {
        this._ssmtAssessments = items;
        this.reportRollupService.numSsmt = this._ssmtAssessments.length;
        this.reportRollupService.initSsmtResultsArr(items);
      } else {
        this.reportRollupService.numSsmt = 0;
      }
    });

    this.treasureHuntAssesmentsSub = this.reportRollupService.treasureHuntAssessments.subscribe(items => {
      if (items) {
        this._treasureHuntAssessments = items;
        this.reportRollupService.numTreasureHunt = this._treasureHuntAssessments.length;
        this.reportRollupService.initTreasureHuntResultsArray(this._treasureHuntAssessments);
      } else {
        this.reportRollupService.numTreasureHunt = 0;
      }
    });
  }


  ngOnDestroy() {
    this.reportRollupService.initSummary();
    if (this.showPrintSub) this.showPrintSub.unsubscribe();
    if (this.phastAssessmentsSub) this.phastAssessmentsSub.unsubscribe();
    if (this.allPhastSub) this.allPhastSub.unsubscribe();
    if (this.selectedPhastSub) this.selectedPhastSub.unsubscribe();
    if (this.psatAssessmentSub) this.psatAssessmentSub.unsubscribe();
    if (this.fsatAssessmentsSub) this.fsatAssessmentsSub.unsubscribe();
    if (this.ssmtAssessmentsSub) this.ssmtAssessmentsSub.unsubscribe();
    if (this.treasureHuntAssesmentsSub) this.treasureHuntAssesmentsSub.unsubscribe();
  }

  getSettings() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.settings = this.settingsDbService.getByDirectoryId(directoryId);
    this.checkSettings();
  }

  checkSettings() {
    if (!this.settings.phastRollupElectricityUnit) {
      this.settings.phastRollupElectricityUnit = 'kWh';
    }
    if (!this.settings.phastRollupFuelUnit) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.settings.phastRollupFuelUnit = 'GJ';
      } else {
        this.settings.phastRollupFuelUnit = 'MMBtu';
      }
    }
    if (!this.settings.phastRollupSteamUnit) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.settings.phastRollupSteamUnit = 'GJ';
      } else {
        this.settings.phastRollupSteamUnit = 'MMBtu';
      }
    }
  }

  setSidebarHeight() {
    let window = this.windowRefService.nativeWindow;
    let wndHeight = window.innerHeight;
    this.bannerHeight = this.reportHeader.nativeElement.clientHeight;
    this.sidebarHeight = wndHeight - this.bannerHeight;
    this.viewportScroller.setOffset([0, this.bannerHeight + 15]);
  }
}
