import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
import { Assessment } from '../shared/models/assessment';
import { Calculator } from '../shared/models/calculators';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from './directory-dashboard/directory-dashboard.service';
import { DashboardService } from './dashboard.service';


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
  constructor(private dashboardService: DashboardService, private directoryDashboardService: DirectoryDashboardService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.createFolderSub = this.directoryDashboardService.createFolder.subscribe(val => {
      this.createFolder = val;
    });
    this.createAssessmentSub = this.dashboardService.createAssessment.subscribe(val => {
      this.createAssessment = val;
    });

    this.moveItemsSub = this.dashboardService.moveItems.subscribe(val => {
      this.moveItems = val;
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
      if (this.dashboardContent && this.sidebarWidth) {
        this.contentWidth = this.dashboardContent.nativeElement.clientWidth - this.sidebarWidth;
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
  }

  ngAfterViewInit() {
    if (this.dashboardContent && this.sidebarWidth) {
      this.contentWidth = this.dashboardContent.nativeElement.clientWidth - this.sidebarWidth;
      this.cd.detectChanges();
    }
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
