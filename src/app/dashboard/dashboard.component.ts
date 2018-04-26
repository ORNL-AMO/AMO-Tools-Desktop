import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DirectoryDbRef, Directory } from '../shared/models/directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { Settings } from '../shared/models/settings';
import { AssessmentService } from '../assessment/assessment.service';
import { JsonToCsvService } from '../shared/json-to-csv/json-to-csv.service';
import { Assessment } from '../shared/models/assessment';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { SuiteDbService } from '../suiteDb/suite-db.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { WallLossesSurface, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../shared/models/materials';
import { ReportRollupService } from '../report-rollup/report-rollup.service';
import { SettingsService } from '../settings/settings.service';
import { Calculator } from '../shared/models/calculators';
import { Subscription } from 'rxjs';

import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DeleteDataService } from '../indexedDb/delete-data.service';
import { CoreService } from '../core/core.service';
import { ExportService } from '../shared/import-export/export.service';
import { ImportExportData } from '../shared/import-export/importExportModel';
import { ImportService } from '../shared/import-export/import.service';
declare const packageJson;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allDirectories: Directory;
  workingDirectory: Directory;
  selectedCalculator: string;
  isFirstChange: boolean = true;
  rootDirectoryRef: DirectoryDbRef;
  view: string;

  showLandingScreen: boolean;

  newDirEventToggle: boolean = false;
  dashboardView: string = 'landing-screen';
  goCalcHome: boolean = false;
  @ViewChild('deleteModal') public deleteModal: ModalDirective;
  @ViewChild('deleteItemsModal') public deleteItemsModal: ModalDirective;
  @ViewChild('exportModal') public exportModal: ModalDirective;
  @ViewChild('importModal') public importModal: ModalDirective;
  @ViewChild('preAssessmentModal') public preAssessmentModal: ModalDirective;

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
  workingDirectoryCalculator: Calculator;
  calcDataExists: boolean = false;
  dontShowSub: Subscription;
  tutorialShown: boolean = false;
  createAssessmentSub: Subscription;
  exportData: ImportExportData;
  exportAllSub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private formBuilder: FormBuilder, private assessmentService: AssessmentService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private jsonToCsvService: JsonToCsvService, private suiteDbService: SuiteDbService, private reportRollupService: ReportRollupService, private settingsService: SettingsService, private exportService: ExportService,
    private assessmentDbService: AssessmentDbService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService,
    private deleteDataService: DeleteDataService, private coreService: CoreService, private importService: ImportService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    //start toolts suite database if it has not started
    this.initData();

    this.createAssessmentSub = this.assessmentService.createAssessment.subscribe(val => {
      this.createAssessment = val;
    })
    if (!this.settingsDbService.globalSettings.disableTutorial) {
      this.dontShowSub = this.settingsService.setDontShow.subscribe(val => {
        if (this.settingsDbService.globalSettings) {
          this.settingsDbService.globalSettings.disableTutorial = val;
          this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
            this.settingsDbService.setAll();
          });
        }
      })
    }
    this.exportAllSub = this.exportService.exportAllClick.subscribe(val => {
      if (val) {
        this.exportAll();
      }
    })
  }

  ngOnDestroy() {
    this.assessmentService.createAssessment.next(false);
    this.createAssessmentSub.unsubscribe();
    if (this.dontShowSub) this.dontShowSub.unsubscribe();
    this.exportAllSub.unsubscribe();
  }

  ngAfterViewInit() {
  }

  initData() {
    this.selectedItems = new Array();
    this.showLandingScreen = this.assessmentService.getLandingScreen();
    this.getData();
    if (this.suiteDbService.hasStarted == true && this.indexedDbService.initCustomObjects == true) {
      this.suiteDbService.initCustomDbMaterials();
    }
  }
  getWorkingDirectoryData() {
    // this.updateDbData();
    this.workingDirectorySettings = this.settingsDbService.getByDirectoryId(this.workingDirectory.id);
    let tmpCalcs = this.calculatorDbService.getByDirectoryId(this.workingDirectory.id);
    if (tmpCalcs.length != 0) {
      this.workingDirectoryCalculator = tmpCalcs[0];
      this.calcDataExists = true;
    } else {
      this.workingDirectoryCalculator = {
        directoryId: this.workingDirectory.id
      }
      this.calcDataExists = false;
    }
    this.workingDirectory.calculators = [this.workingDirectoryCalculator];
  }

  addCalculatorData(calcualtorData: Calculator) {
    if (this.calcDataExists) {
      this.indexedDbService.putCalculator(calcualtorData).then(() => {
        this.calculatorDbService.setAll().then(() => {
          this.hidePreAssessmentModal();
          this.getWorkingDirectoryData();
        })
      });
    } else {
      calcualtorData.directoryId = this.workingDirectory.id;
      calcualtorData.name = this.workingDirectory.name + ' Pre-Assessment';
      this.indexedDbService.addCalculator(calcualtorData).then(() => {
        this.calculatorDbService.setAll().then(() => {
          this.hidePreAssessmentModal();
          this.getWorkingDirectoryData();
        });
      });
    }
  }

  getData() {
    this.rootDirectoryRef = this.directoryDbService.getById(1);
    this.allDirectories = this.directoryDbService.getById(1);
    this.workingDirectory = this.allDirectories;
    if (!this.tutorialShown) {
      if (this.settingsDbService.globalSettings) {
        if (!this.settingsDbService.globalSettings.disableTutorial) {
          this.assessmentService.openingTutorial.next(true);
          this.tutorialShown = true;
        }
      }
    }
    this.getWorkingDirectoryData();
  }

  updateDbData() {
    this.directoryDbService.getAll();
    this.assessmentDbService.getAll();
    this.settingsDbService.getAll();
    this.calculatorDbService.getAll();
  }

  openModal($event) {
    this.isModalOpen = $event;
  }

  hideScreen() {
    this.dashboardView = 'assessment-dashboard';
  }

  showPreAssessmentModal() {
    this.showPreAssessment = true;
    this.preAssessmentModal.show();
  }

  hidePreAssessmentModal() {
    this.showPreAssessment = false;
    this.preAssessmentModal.hide();
  }

  getAllDirectories() {
    return this.allDirectories;
  }

  getWorkingDirectory() {
    return this.workingDirectory;
  }

  goHome() {
    this.selectedCalculator = '';
    this.dashboardView = 'landing-screen';
  }

  showAbout() {
    this.selectedCalculator = '';
    this.dashboardView = 'about-page';
  }

  showAcknowledgments() {
    this.selectedCalculator = '';
    this.dashboardView = 'acknowledgments-page';
  }

  showTutorials() {
    this.selectedCalculator = '';
    this.dashboardView = 'tutorials';
  }

  showSettings() {
    this.selectedCalculator = '';
    this.dashboardView = 'settings';
  }

  showContact() {
    this.selectedCalculator = '';
    this.dashboardView = 'contact';
  }

  populateDirectories(directory: Directory): Directory {
    let tmpDirectory: Directory = {
      name: directory.name,
      createdDate: directory.createdDate,
      modifiedDate: directory.modifiedDate,
      id: directory.id,
      collapsed: false,
      parentDirectoryId: directory.parentDirectoryId
    }
    tmpDirectory.assessments = this.assessmentDbService.getByDirectoryId(directory.id);
    tmpDirectory.subDirectory = this.directoryDbService.getSubDirectoriesById(directory.id);
    return tmpDirectory;
  }

  changeWorkingDirectory(directory: Directory) {
    this.dashboardView = 'assessment-dashboard';
    this.workingDirectory = this.populateDirectories(directory);
    this.getWorkingDirectoryData();
  }

  viewCalculator(str: string) {
    this.goCalcHome = !this.goCalcHome;
    this.dashboardView = 'calculator';
    this.selectedCalculator = str;
  }

  newDir() {
    this.allDirectories = this.populateDirectories(this.allDirectories);
    this.workingDirectory = this.populateDirectories(this.workingDirectory);
    this.getWorkingDirectoryData();
    this.newDirEventToggle = !this.newDirEventToggle;
  }

  showDeleteModal() {
    this.deleting = false;
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
    this.deleteModal.onHidden.subscribe(() => {
      this.deleting = false;
    })
  }

  showDeleteItemsModal() {
    if (this.checkSelected()) {
      this.deleteItemsModal.show();
    } else {
      this.addToast('No items have been selected');
    }
  }

  hideDeleteItemsModal() {
    this.deleteItemsModal.hide();
  }

  showExportModal() {
    this.isExportView = true;
    this.isImportView = false;
    this.showImportExport = true;
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
    this.showImportExport = false;
    this.isExportView = false;
    this.isImportView = false;
  }

  showImportModal() {
    this.isImportView = true;
    this.isExportView = false;
    this.showImportExport = true;
    this.importModal.show();
  }

  hideImportModal() {
    this.importModal.hide();
    this.showImportExport = false;
    this.isExportView = false;
    this.isImportView = false;
  }

  deleteData() {
    this.deleting = true;
    this.indexedDbService.deleteDb().then(
      results => {
        this.suiteDbService.startup();
        this.indexedDbService.db = this.indexedDbService.initDb().then(() => {
          this.coreService.createDirectory().then(() => {
            this.coreService.createDirectorySettings().then(() => {
              this.coreService.createExamples().then(() => {
                this.setAllDbData();
              });
            });
          });
        });
      });
  }
  setAllDbData() {
    this.directoryDbService.setAll().then(() => {
      this.assessmentDbService.setAll().then(() => {
        this.settingsDbService.setAll().then(() => {
          this.calculatorDbService.setAll().then(() => {
            this.assessmentService.tutorialShown = false;
            this.tutorialShown = false;
            this.initData();
            this.hideDeleteModal();
          })
        })
      })
    })
  }
  checkSelected() {
    let tmpArray = new Array();
    let tmpArray2 = new Array();
    if (this.workingDirectory.assessments) {
      tmpArray = this.workingDirectory.assessments.filter(
        assessment => {
          if (assessment.selected) {
            return assessment;
          }
        }
      )
    }
    if (this.workingDirectory.subDirectory) {
      tmpArray2 = this.workingDirectory.subDirectory.filter(
        subDir => {
          if (subDir.selected) {
            return subDir;
          }
        }
      )
    }
    if (tmpArray.length != 0 || tmpArray2.length != 0 || this.workingDirectoryCalculator.selected) {
      return true;
    } else {
      return false;
    }

  }

  deleteSelected(dir: Directory) {
    this.deleting = true;
    let isWorkingDir;
    if (dir.id == this.workingDirectory.id) {
      isWorkingDir = true;
    } else {
      isWorkingDir = false;
    }
    this.deleteDataService.deleteDirectory(dir, isWorkingDir);
    setTimeout(() => {
      this.newDir();
      this.hideDeleteItemsModal();
      this.deleting = false;
    }, 1500)
  }

  generateReport() {
    if (this.checkSelected()) {
      this.selectedItems = new Array();
      if (this.workingDirectoryCalculator) {
        if (this.workingDirectoryCalculator.selected) {
          this.reportRollupService.calcsArray.push(this.workingDirectoryCalculator);
          this.reportRollupService.selectedCalcs.next(this.reportRollupService.calcsArray);
        }
      }
      this.reportRollupService.getReportData(this.workingDirectory);
      //this.getSelected(this.workingDirectory);
      this.dashboardView = 'detailed-report';
    } else {
      this.addToast('No items have been selected');
    }
  }

  exportSelected() {
    let test = this.exportService.getSelected(JSON.parse(JSON.stringify(this.workingDirectory)), this.workingDirectory.id);
    if (test.assessments.length != 0 || test.directories.length != 0 || test.calculators.length != 0) {
      this.exportData = test;
      this.showExportModal();
    } else {
      this.addToast('No items have been selected');
    }
  }

  exportAll() {
    this.exportData = this.exportService.getSelected(JSON.parse(JSON.stringify(this.allDirectories)), 1);
    this.showExportModal();
  }

  returnSelected() {
    return this.selectedItems;
  }

  closeReport() {
    this.selectedItems = new Array();
    this.workingDirectoryCalculator.selected = false;
    this.workingDirectory.assessments.forEach(
      assessment => {
        assessment.selected = false;
      }
    )
    //prevents unneccessary pre assessments in report rollup
    this.workingDirectory.subDirectory.forEach(dir => {
      dir.selected = false;
    });
    this.dashboardView = 'assessment-dashboard';
  }

  checkImportData(data: ImportExportData) {
    if (data.origin == "AMO-TOOLS-DESKTOP") {
      this.importInProgress = true;
      this.importService.importData(data, this.workingDirectory.id);
      setTimeout(() => {
        this.hideImportModal();
        this.importInProgress = false;
        this.allDirectories = this.populateDirectories(this.allDirectories);
        this.workingDirectory = this.populateDirectories(this.workingDirectory);
        this.getWorkingDirectoryData();
      }, 1500)
    }
    else {
      this.addToast('INVALID FILE');
    }
  }

  addToast(msg: string) {
    let toastOptions: ToastOptions = {
      title: msg,
      timeout: 2000,
      showClose: true,
      theme: 'default'
    }
    this.toastyService.warning(toastOptions);
  }
}

export interface ImportDataObjects {
  settings: Settings,
  directory: Directory,
  assessment: Assessment,
  directorySettings: Settings,
  calculator?: Calculator
}
