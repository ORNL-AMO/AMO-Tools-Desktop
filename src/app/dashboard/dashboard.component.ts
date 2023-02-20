import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
import { Assessment } from '../shared/models/assessment';
import { Calculator } from '../shared/models/calculators';
import { filter, Subscription } from 'rxjs';
import { DirectoryDashboardService } from './directory-dashboard/directory-dashboard.service';
import { DashboardService } from './dashboard.service';
import { NavigationEnd, Router } from '@angular/router';
import { PrintOptionsMenuService } from '../shared/print-options-menu/print-options-menu.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild('dashboardContent', { static: false }) public dashboardContent: ElementRef;

  createAssessment: boolean;
  createAssessmentSub: Subscription;

  createInventory: boolean;
  createInventorySub: Subscription;

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;

  createFolder: boolean;
  createFolderSub: Subscription;

  moveItems: boolean;
  moveItemsSub: Subscription;

  copyItems: boolean;
  copyItemsSub: Subscription;

  showImportModalSub: Subscription;
  showImportModal: boolean;

  dashboardToastMessageSub: Subscription;

  showExportModalSub: Subscription;
  showExportModal: boolean;
  sidebarWidth: number;
  sidebarWidthSub: Subscription;
  contentWidth: number;
  routerSubscription: any;
  useContainerScroll: boolean = true;
  inPrintView: boolean = false;
  noScrollContainerView: Array<string> = [
    'phast',
    'psat',
    'fsat',
    'ssmt',
    'treasure-hunt',
    'compressed-air',
    'report-rollup',
    'log-tool',
    'motor-inventory',
    'waste-water'
  ];
  showPrintViewSub: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContentWidth();
  }
  constructor(private dashboardService: DashboardService, 
    private router: Router,
    private printOptionsMenuService: PrintOptionsMenuService,
    private directoryDashboardService: DirectoryDashboardService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      let firstUrlSegment: string = event.urlAfterRedirects.split('/')[1];
      // /phast
      if(this.noScrollContainerView.includes(firstUrlSegment)) {
        this.useContainerScroll = false;
      } else {
        this.useContainerScroll = true;
      }
    });
    
    this.createFolderSub = this.directoryDashboardService.createFolder.subscribe(val => {
      this.createFolder = val;
    });
    this.createAssessmentSub = this.dashboardService.createAssessment.subscribe(val => {
      this.createAssessment = val;
    });

    this.moveItemsSub = this.dashboardService.moveItems.subscribe(val => {
      this.moveItems = val;
    });

    this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.inPrintView = val;
    });

    this.copyItemsSub = this.dashboardService.copyItems.subscribe(val => {
      this.copyItems = val;
    });

    this.dashboardToastMessageSub = this.dashboardService.dashboardToastMessage.subscribe(val => {
      if (val != undefined) {
        this.addToast(val);
        this.dashboardService.dashboardToastMessage.next(undefined);
      }
    });

    this.showImportModalSub = this.directoryDashboardService.showImportModal.subscribe(val => {
      this.showImportModal = val;
    });

    this.showExportModalSub = this.directoryDashboardService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.sidebarWidthSub = this.dashboardService.sidebarX.subscribe(val => {
      this.sidebarWidth = val;
      if (this.dashboardContent && this.sidebarWidth !== undefined) {
        this.setContentWidth();
      }
    });

    this.createInventorySub = this.dashboardService.createInventory.subscribe(val => {
      this.createInventory = val;
    })
  }

  ngOnDestroy() {
    this.moveItemsSub.unsubscribe();
    this.createAssessmentSub.unsubscribe();
    this.dashboardToastMessageSub.unsubscribe();
    this.createFolderSub.unsubscribe();
    this.showImportModalSub.unsubscribe();
    this.sidebarWidthSub.unsubscribe();
    this.createInventorySub.unsubscribe();
    this.copyItemsSub.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.showPrintViewSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.setContentWidth();
  }

  setContentWidth() {
    this.dashboardService.totalScreenWidth.next(this.dashboardContent.nativeElement.clientWidth);
    this.contentWidth = this.dashboardContent.nativeElement.clientWidth - this.sidebarWidth;
    this.cd.detectChanges();
  }

  //TOAST HERE
  addToast(msg: string) {
    this.toastData.title = msg;
    this.toastData.setTimeoutVal = 2000;
    this.showToast = true;
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    }
  }  
}

export interface ImportDataObjects {
  settings: Settings;
  directory: Directory;
  assessment: Assessment;
  directorySettings: Settings;
  calculator?: Calculator;
}
