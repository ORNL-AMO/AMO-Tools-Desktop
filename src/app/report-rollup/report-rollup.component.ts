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

  bannerHeight: number;
  assessmentsGathered: boolean = false;
  createdDate: Date;

  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  @ViewChild('assessmentReportsDiv', { static: false }) assessmentReportsDiv: ElementRef;
  sidebarHeight: number = 0;
  printView: boolean = false;
  showPrintSub: Subscription;

  gatheringAssessments: boolean = true;
  constructor(private viewportScroller: ViewportScroller, private reportRollupService: ReportRollupService, private windowRefService: WindowRefService,
    private cd: ChangeDetectorRef, private directoryDashboardService: DirectoryDashboardService, private printOptionsMenuService: PrintOptionsMenuService) { }

  ngOnInit() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.reportRollupService.setReportRollupSettings(directoryId);
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
  }


  ngOnDestroy() {
    this.reportRollupService.initSummary();
    if (this.showPrintSub) this.showPrintSub.unsubscribe();
  }

  setSidebarHeight() {
    let window = this.windowRefService.nativeWindow;
    let wndHeight = window.innerHeight;
    this.bannerHeight = this.reportHeader.nativeElement.clientHeight;
    this.sidebarHeight = wndHeight - this.bannerHeight;
    this.viewportScroller.setOffset([0, this.bannerHeight + 15]);
  }
}
