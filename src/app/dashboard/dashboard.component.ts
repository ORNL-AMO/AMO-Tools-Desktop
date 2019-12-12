import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('dragbar', { static: false }) public dragbar: ElementRef;

  createAssessment: boolean;
  createAssessmentSub: Subscription;

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;

  createFolder: boolean;
  createFolderSub: Subscription;

  showImportModalSub: Subscription;
  showImportModal: boolean;

  dashboardToastMessageSub: Subscription;

  showExportModalSub: Subscription;
  showExportModal: boolean;
  sidebarWidth: number;
  sidebarWidthSub: Subscription;
  constructor(private dashboardService: DashboardService, private directoryDashboardService: DirectoryDashboardService) {
  }

  ngOnInit() {
    this.createFolderSub = this.directoryDashboardService.createFolder.subscribe(val => {
      this.createFolder = val;
    });
    this.createAssessmentSub = this.dashboardService.createAssessment.subscribe(val => {
      this.createAssessment = val;
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
    })
  }

  ngOnDestroy() {
    this.createAssessmentSub.unsubscribe();
    this.dashboardToastMessageSub.unsubscribe();
    this.createFolderSub.unsubscribe();
    this.showImportModalSub.unsubscribe();
    this.sidebarWidthSub.unsubscribe();
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
