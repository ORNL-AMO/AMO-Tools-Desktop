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
import { ImportExportService } from '../shared/import-export/import-export.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {

  @ViewChild('dashboardContent', { static: false }) public dashboardContent: ElementRef;

  createAssessment: boolean;
  createAssessmentSub: Subscription;

  showCreateInventory: string;
  showCreateInventorySub: Subscription;

  createFolder: boolean;
  createFolderSub: Subscription;

  moveItems: boolean;
  moveItemsSub: Subscription;

  copyItems: boolean;
  copyItemsSub: Subscription;

  showImportModalSub: Subscription;
  showImportModal: boolean;

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
    'pump-inventory',
    'waste-water'
  ];
  showPrintViewSub: Subscription;
  exportInProgressSub: Subscription;
  showExportInProgress: boolean;
  showCreateDiagramSub: Subscription;
  showCreateDiagram: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContentWidth();
  }
  constructor(private dashboardService: DashboardService, 
    private router: Router,
    private printOptionsMenuService: PrintOptionsMenuService,
    private importExportService: ImportExportService,
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

    this.showCreateDiagramSub = this.dashboardService.showCreateDiagram.subscribe(val => {
      this.showCreateDiagram = val;
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

    this.showCreateInventorySub = this.dashboardService.showCreateInventory.subscribe(showCreateInventory => {
      this.showCreateInventory = showCreateInventory;
    })

    this.exportInProgressSub = this.importExportService.exportInProgress.subscribe(inProgress => {
      this.showExportInProgress = inProgress;
    })
  }

  ngOnDestroy() {
    this.moveItemsSub.unsubscribe();
    this.createAssessmentSub.unsubscribe();
    this.createFolderSub.unsubscribe();
    this.showImportModalSub.unsubscribe();
    this.sidebarWidthSub.unsubscribe();
    this.showCreateInventorySub.unsubscribe();
    this.copyItemsSub.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.showPrintViewSub.unsubscribe();
    this.exportInProgressSub.unsubscribe();
    if (this.importExportService.removeDownloadListener) {
      this.importExportService.removeDownloadListener();
    }
  }

  ngAfterViewInit() {
    this.setContentWidth();
  }

  setContentWidth() {
    if (this.dashboardContent) {
      this.dashboardService.totalScreenWidth.next(this.dashboardContent.nativeElement.clientWidth);
      this.contentWidth = this.dashboardContent.nativeElement.clientWidth - this.sidebarWidth;
      this.cd.detectChanges();
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
