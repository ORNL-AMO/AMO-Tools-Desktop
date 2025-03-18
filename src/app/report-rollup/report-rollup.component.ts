import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { ReportRollupService } from './report-rollup.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { Subscription } from 'rxjs';
import { ViewportScroller } from '@angular/common';
import { DirectoryDashboardService } from '../dashboard/directory-dashboard/directory-dashboard.service';
import { PrintOptionsMenuService } from '../shared/print-options-menu/print-options-menu.service';
import { ReportSummaryGraphsService } from './report-summary-graphs/report-summary-graphs.service';

@Component({
    selector: 'app-report-rollup',
    templateUrl: './report-rollup.component.html',
    styleUrls: ['./report-rollup.component.css'],
    standalone: false
})
export class ReportRollupComponent implements OnInit {

  bannerHeight: number;
  assessmentsGathered: boolean = false;
  createdDate: Date;

  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  printView: boolean = false;
  containerHeight: number;
  showPrintSub: Subscription;

  gatheringAssessments: boolean = true;
  routerSubscription: Subscription;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      if (!this.printView) {
        this.setContainerHeight();
      }
    }, 50);
  }
  constructor(private viewportScroller: ViewportScroller, 
   private reportRollupService: ReportRollupService, private windowRefService: WindowRefService,
    private cd: ChangeDetectorRef, private directoryDashboardService: DirectoryDashboardService, private printOptionsMenuService: PrintOptionsMenuService,
    private reportSummaryGraphService: ReportSummaryGraphsService) { }

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
      this.setContainerHeight();
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
    this.reportSummaryGraphService.clearData();
  }

  setContainerHeight() {
    let window = this.windowRefService.nativeWindow;
    let wndHeight = window.innerHeight;
    this.bannerHeight = this.reportHeader.nativeElement.clientHeight;
    this.containerHeight = wndHeight - this.bannerHeight;
    this.viewportScroller.setOffset([0, this.bannerHeight + 15]);
  }
}
