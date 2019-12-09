import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DirectoryDbRef, Directory } from '../shared/models/directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../shared/models/settings';
import { AssessmentService } from './assessment.service';
import { Assessment } from '../shared/models/assessment';
import { SuiteDbService } from '../suiteDb/suite-db.service';
import { ReportRollupService } from '../report-rollup/report-rollup.service';
import { Calculator } from '../shared/models/calculators';
import { Subscription } from 'rxjs';

import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DeleteDataService } from '../indexedDb/delete-data.service';
import { ExportService } from './import-export/export.service';
import { ImportExportData } from './import-export/importExportModel';
import { ImportService } from './import-export/import.service';
import { CalculatorService } from '../calculator/calculator.service';
import { DirectoryDashboardService } from './directory-dashboard/directory-dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from './dashboard.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allDirectories: Directory;
  // workingDirectory: Directory;
  // isFirstChange: boolean = true;
  // rootDirectoryRef: DirectoryDbRef;
  showLandingScreen: boolean;

  newDirEventToggle: boolean = false;
  dashboardView: string = 'landing-screen';
  goCalcHome: boolean = false;
  @ViewChild('deleteItemsModal', { static: false }) public deleteItemsModal: ModalDirective;
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;
  @ViewChild('importModal', { static: false }) public importModal: ModalDirective;
  @ViewChild('preAssessmentModal', { static: false }) public preAssessmentModal: ModalDirective;

  importInProgress: boolean = false;
  isExportView: boolean = false;
  isImportView: boolean = false;
  importing: any;
  // reportAssessments: Array<any>;
  selectedItems: Array<any>;
  showImportExport: boolean;
  deleting: boolean;
  suiteDbInit: boolean = false;
  isModalOpen: boolean = false;
  createAssessment: boolean = false;
  showPreAssessment: boolean = false;
  workingDirectorySettings: Settings;
  calcDataExists: boolean = false;
  dontShowSub: Subscription;
  tutorialShown: boolean = false;
  createAssessmentSub: Subscription;
  exportData: ImportExportData;
  exportAllSub: Subscription;
  selectedCalcIndex: number;
  dashboardViewSub: Subscription;
  workingDirectorySub: Subscription;
  selectedTool: string;
  selectedToolSub: Subscription;
  sidebarDataSub: Subscription;

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;

  createFolder: boolean;
  createFolderSub: Subscription;

  showImportModalSub: Subscription;
  showImportModal: boolean;

  dashboardToastMessageSub: Subscription;

  showExportModalSub: Subscription;
  showExportModal: boolean;

  constructor(private dashboardService: DashboardService, private directoryDashboardService: DirectoryDashboardService) {
  }

  ngOnInit() {
    this.createFolderSub = this.directoryDashboardService.createFolder.subscribe(val => {
      this.createFolder = val;
    });
    this.createAssessmentSub = this.directoryDashboardService.createAssessment.subscribe(val => {
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
  }

  ngOnDestroy() {
    this.createAssessmentSub.unsubscribe();
    this.dashboardToastMessageSub.unsubscribe();
    this.createFolderSub.unsubscribe();
    this.showImportModalSub.unsubscribe();
  }

  ngAfterViewInit() {
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
