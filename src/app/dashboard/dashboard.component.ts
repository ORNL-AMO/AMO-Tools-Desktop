import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DirectoryDbRef, Directory } from '../shared/models/directory';
import { MockDirectory } from '../shared/mocks/mock-directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ModalDirective } from 'ng2-bootstrap';
import * as _ from 'lodash';
import { Settings } from '../shared/models/settings';
import { AssessmentService } from '../assessment/assessment.service';
import { JsonToCsvService } from '../shared/json-to-csv/json-to-csv.service';
import { Assessment } from '../shared/models/assessment';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { SuiteDbService } from '../suiteDb/suite-db.service';

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

  importInProgress: boolean = false;
  isExportView: boolean = false;
  isImportView: boolean = false;
  importing: any;
  reportAssessments: Array<any>;
  selectedItems: Array<any>;
  showImportExport: boolean;
  constructor(private indexedDbService: IndexedDbService, private formBuilder: FormBuilder, private assessmentService: AssessmentService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private jsonToCsvService: JsonToCsvService, private suitDbService: SuiteDbService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    //start toolts suite database
    this.suitDbService.startup();
    this.selectedItems = new Array();
    this.showLandingScreen = this.assessmentService.getLandingScreen();
    //open DB and get directories
    this.indexedDbService.initDb().then(
      results => {
        this.indexedDbService.getDirectory(1).then(
          results => {
            if (results) {
              this.rootDirectoryRef = results;
              this.allDirectories = this.populateDirectories(results);
              this.workingDirectory = this.allDirectories
            } else {
              this.createExampleAssessments();
              this.createDirectory();
            }
          })
        this.indexedDbService.getDirectorySettings(1).then(
          results => {
            if (results.length == 0) {
              this.createDirectorySettings();
            }
          }
        );
      }
    )
  }

  hideScreen() {
    this.dashboardView = 'assessment-dashboard';
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

  showTutorials() {
    this.selectedCalculator = '';
    this.dashboardView = 'tutorials';
  }

  showSettings() {
    this.selectedCalculator = '';
    this.dashboardView = 'settings';
  }

  populateDirectories(directoryRef: DirectoryDbRef): Directory {
    let tmpDirectory: Directory = {
      name: directoryRef.name,
      createdDate: directoryRef.createdDate,
      modifiedDate: directoryRef.modifiedDate,
      id: directoryRef.id,
      collapsed: false,
      parentDirectoryId: directoryRef.parentDirectoryId
    }
    this.indexedDbService.getDirectoryAssessments(directoryRef.id).then(
      results => {
        tmpDirectory.assessments = results;
      }
    );

    this.indexedDbService.getChildrenDirectories(directoryRef.id).then(
      results => {
        tmpDirectory.subDirectory = results;
      }
    )
    return tmpDirectory;
  }

  changeWorkingDirectory(directory: Directory) {
    this.dashboardView = 'assessment-dashboard';
    this.indexedDbService.getDirectory(directory.id).then(
      results => {
        if (results) {
          this.workingDirectory = this.populateDirectories(results);
        }
      })
  }

  viewCalculator(str: string) {
    this.goCalcHome = !this.goCalcHome;
    this.dashboardView = 'calculator';
    this.selectedCalculator = str;
  }

  createExampleAssessments() {
    let tmpAssessment = MockDirectory.assessments[0];
    tmpAssessment.directoryId = 1;
    this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {

    })

    tmpAssessment = MockDirectory.assessments[1];
    tmpAssessment.directoryId = 1;
    this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {

    })
  }

  createDirectorySettings() {
    let tmpSettings: Settings = {
      language: 'English',
      currency: '$ - US Dollar',
      unitsOfMeasure: 'Imperial',
      directoryId: 1,
      createdDate: new Date(),
      modifiedDate: new Date(),
      distanceMeasurement: 'ft',
      flowMeasurement: 'gpm',
      powerMeasurement: 'hp',
      pressureMeasurement: 'psi'

    }
    this.indexedDbService.addSettings(tmpSettings).then(
      results => {
      }
    )
  }

  createDirectory() {
    let tmpDirectory: DirectoryDbRef = {
      name: 'Assessments',
      createdDate: new Date(),
      modifiedDate: new Date(),
      parentDirectoryId: null,
    }
    this.indexedDbService.addDirectory(tmpDirectory).then(
      results => {
        this.indexedDbService.getDirectory(results).then(result => {
          this.rootDirectoryRef = results;
          this.allDirectories = this.populateDirectories(result);
          this.workingDirectory = this.allDirectories;
        })
      }
    )
  }

  newDir() {
    this.newDirEventToggle = !this.newDirEventToggle;
  }

  showDeleteModal() {
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
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
    this.indexedDbService.deleteDb().then(
      results => {
        this.ngOnInit();
        this.hideDeleteModal()
      }
    )
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
    if (tmpArray.length != 0 || tmpArray2.length != 0) {
      return true;
    } else {
      return false;
    }

  }

  deleteSelected(dir: Directory) {
    this.hideDeleteItemsModal();
    if (dir.subDirectory) {
      dir.subDirectory.forEach(subDir => {
        if (subDir.selected || subDir.parentDirectoryId != 1) {
          this.indexedDbService.getChildrenDirectories(subDir.id).then(results => {
            if (results) {
              subDir.subDirectory = results;
              this.deleteSelected(subDir);
            }
          })
        }
      });
    }
    if (dir != this.workingDirectory) {
      if (dir.parentDirectoryId != this.workingDirectory.id || dir.selected) {
        this.indexedDbService.getDirectoryAssessments(dir.id).then(results => {
          let childDirAssessments = results;
          childDirAssessments.forEach(assessment => {
            this.indexedDbService.deleteAssessment(assessment.id).then(results => {
              this.allDirectories = this.populateDirectories(this.rootDirectoryRef);
              this.workingDirectory = this.populateDirectories(this.workingDirectory);
            });
            this.indexedDbService.getAssessmentSettings(assessment.id).then(
              results => {
                if (results.length != 0) {
                  this.indexedDbService.deleteSettings(results[0].id).then(
                    results => { console.log('assessment setting deleted'); }
                  )
                }
              }
            )
          })
        })
        this.indexedDbService.deleteDirectory(dir.id).then(results => {
          this.allDirectories = this.populateDirectories(this.rootDirectoryRef);
          this.workingDirectory = this.populateDirectories(this.workingDirectory);
        })

        this.indexedDbService.getDirectorySettings(dir.id).then(results => {
          if (results.length != 0) {
            this.indexedDbService.deleteSettings(results[0].id).then(
              results => { console.log('dir setting deleted'); }
            )
          }
        })
      }
    }
    if (dir == this.workingDirectory) {
      let checkedAssessments = _.filter(this.workingDirectory.assessments, { 'selected': true });
      checkedAssessments.forEach(assessment => {
        this.indexedDbService.deleteAssessment(assessment.id).then(results => {
          this.allDirectories = this.populateDirectories(this.rootDirectoryRef);
          this.workingDirectory = this.populateDirectories(this.workingDirectory);
        });
        this.indexedDbService.getAssessmentSettings(assessment.id).then(
          results => {
            if (results.length != 0) {
              this.indexedDbService.deleteSettings(results[0].id).then(
                results => { console.log('assessment setting deleted'); }
              )
            }
          }
        )
      })
    }
  }

  generateReport() {
    if (this.checkSelected()) {
      this.selectedItems = new Array();
      this.getSelected(this.workingDirectory);
      this.dashboardView = 'detailed-report';
    } else {
      this.addToast('No items have been selected');
    }
  }

  exportSelected() {
    if (this.checkSelected()) {
      this.selectedItems = new Array();
      this.getSelected(this.workingDirectory);
      this.showExportModal();
    } else {
      this.addToast('No items have been selected');
    }
  }

  returnSelected() {
    return this.selectedItems;
  }

  closeReport() {
    this.selectedItems = new Array();
    this.workingDirectory.assessments.forEach(
      assessment => {
        assessment.selected = false;
      }
    )
    this.dashboardView = 'assessment-dashboard';
  }


  getSelected(dir: Directory) {
    //add selected and children dir assessments
    if (dir.assessments) {
      dir.assessments.forEach(
        assessment => {
          let assessmentDir;
          if (dir.id != this.workingDirectory.id) {
            assessmentDir = dir;
          }
          if (assessment.selected) {
            this.selectedItems.push({ assessment: assessment, directory: assessmentDir });
          } else if (dir.id != this.workingDirectory.id) {
            this.selectedItems.push({ assessment: assessment, directory: assessmentDir });
          }
        }
      )
    } else {
      //get assessments of directory if non passed in
      this.indexedDbService.getDirectoryAssessments(dir.id).then(
        resultAssessments => {
          if (resultAssessments.length != 0) {
            resultAssessments.forEach(assessment => { this.selectedItems.push({ assessment: assessment, directory: dir }) })
          }
        }
      )
    }

    //process selected sub directories of working directory
    if (dir.id == this.workingDirectory.id) {
      if (dir.subDirectory) {
        dir.subDirectory.forEach(
          subDir => {
            if (subDir.selected) {
              this.getSelected(subDir);
            }
          }
        )
      }
    }
    //get subdirectories of selected non working directories
    else {
      this.indexedDbService.getChildrenDirectories(dir.id).then(
        resultDir => {
          if (resultDir.length != 0) {
            resultDir.forEach(dir => this.getSelected(dir));
          }
        }
      )
    }
  }

  checkImportData(data: any) {
    if (data[data.length - 1].origin == "AMO-TOOLS-DESKTOP") {
      data.pop();
      this.importInProgress = true;
      this.runImport(data);

    }
    else {
      this.addToast('INVALID FILE');
    }
  }

  runImport(data: ImportDataObjects[]) {
    if (this.importing) {
      clearTimeout(this.importing)
    }
    this.importing = setTimeout(() => {
      this.hideImportModal();
      this.importInProgress = false;
      this.allDirectories = this.populateDirectories(this.rootDirectoryRef);
      this.workingDirectory = this.populateDirectories(this.workingDirectory);
    }, 2500)

    let uniqDirs = _.uniqBy(data, 'directory.id');
    let dirIdPairs = new Array();
    uniqDirs.forEach(dir => {
      if (dir.directory) {
        let tmpDirDbRef: DirectoryDbRef = {
          name: dir.directory.name,
          parentDirectoryId: this.workingDirectory.id
        }
        this.indexedDbService.addDirectory(tmpDirDbRef).then(results => {
          dirIdPairs.push({ oldId: dir.directory.id, newId: results })
        });
      }
    })
    setTimeout(() => {
      data.forEach(dataObj => {
        let tmpDirectoryIdArr = dirIdPairs.filter(pair => { return pair.oldId == dataObj.assessment.directoryId });
        let tmpDirectoryId = this.workingDirectory.id;
        if (tmpDirectoryIdArr.length != 0) {
          tmpDirectoryId = tmpDirectoryIdArr[0].newId;
        }
        let tmpAssessment: Assessment = {
          type: dataObj.assessment.type,
          name: dataObj.assessment.name,
          psat: dataObj.assessment.psat,
          phast: dataObj.assessment.phast,
          directoryId: tmpDirectoryId
        }
        this.indexedDbService.addAssessment(tmpAssessment).then(
          results => {
            //check for psat until phast has settings
            if (tmpAssessment.psat) {
              let tmpSettings: Settings = {
                language: dataObj.settings.language,
                currency: dataObj.settings.currency,
                unitsOfMeasure: dataObj.settings.unitsOfMeasure,
                assessmentId: results,
                flowMeasurement: dataObj.settings.flowMeasurement,
                powerMeasurement: dataObj.settings.powerMeasurement,
                distanceMeasurement: dataObj.settings.distanceMeasurement,
                pressureMeasurement: dataObj.settings.pressureMeasurement
              }
              this.indexedDbService.addSettings(tmpSettings).then(
                results => {
                  console.log('3')
                }
              )
            }
            console.log('2')
          }
        )
      })
    }, 1000);
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
  assessment: Assessment
}
