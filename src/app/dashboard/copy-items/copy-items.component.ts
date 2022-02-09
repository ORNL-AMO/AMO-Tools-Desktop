import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Calculator } from '../../shared/models/calculators';
import { Directory } from '../../shared/models/directory';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { Settings } from '../../shared/models/settings';
import { DashboardService } from '../dashboard.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';


@Component({
  selector: 'app-copy-items',
  templateUrl: './copy-items.component.html',
  styleUrls: ['./copy-items.component.css']
})
export class CopyItemsComponent implements OnInit {

  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;
  copyForm: FormGroup;
  allDirectories: Array<Directory>;
  directory: Directory;
  assessmentCopy: boolean = false;
  folderSelected: boolean = false;
  showNewFolder: boolean = false;
  newFolderForm: FormGroup;

  constructor(
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
    private indexedDbService: IndexedDbService,
    private assessmentDbService: AssessmentDbService,
    private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService,
    private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.allDirectories = this.directoryDbService.getAll();
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.copyForm = this.initForm();
    this.newFolderForm = this.initFolderForm();
  }

  initForm() {
    this.directory.assessments.forEach(assessment => {
      if (assessment.selected) {
        this.assessmentCopy = true;
      }
    });

    this.directory.subDirectory.forEach(subDir => {
      if (subDir.selected) {
        this.folderSelected = true;
        _.remove(this.allDirectories, (dir) => { return dir.id === subDir.id; });
        _.remove(this.allDirectories, (dir) => { return dir.parentDirectoryId === subDir.id; });
      }
    });

    if (this.folderSelected) {
      return this.formBuilder.group({
        'directoryId': [this.directory.parentDirectoryId, Validators.required],
        'copyModifications': [false],
        'copyCalculators': [false]
      });
    } else {
      return this.formBuilder.group({
        'directoryId': [this.directory.id, Validators.required],
        'copyModifications': [false],
        'copyCalculators': [false]
      });
    }

  }

  ngAfterViewInit() {
    this.showCopyModal();
  }

  showCopyModal() {
    this.copyModal.show();
  }

  hideCopyModal() {
    this.assessmentCopy = false;
    this.folderSelected = false;
    this.copyModal.hide();
    this.directoryDbService.setAll();
    this.dashboardService.copyItems.next(false);
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.allDirectories, (dir) => { return dir.id === id; });
    let str = parentDir.name + '/';
    while (parentDir.parentDirectoryId) {
      parentDir = _.find(this.allDirectories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
      str = parentDir.name + '/' + str;
    }
    return str;
  }

  createCopy(){
    this.directory.assessments.forEach(assessment => {
      if (assessment.selected) {
        let assessmentCopy: Assessment = JSON.parse(JSON.stringify(assessment));
        delete assessmentCopy.id;
        let tempCalculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
        let assessmentCalculatorCopy: Calculator;
        if (tempCalculator){
          assessmentCalculatorCopy = JSON.parse(JSON.stringify(tempCalculator));
          delete assessmentCalculatorCopy.id;
        }
        let tempSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let settingsCopy: Settings = JSON.parse(JSON.stringify(tempSettings));
        delete settingsCopy.id;
        assessmentCopy.name = assessment.name + ' (copy)';
        assessmentCopy.directoryId = this.copyForm.controls.directoryId.value;
        assessmentCopy.createdDate = new Date();
        assessmentCopy.modifiedDate = new Date();

        if (this.copyForm.controls.copyModifications.value === false) {
          if (assessmentCopy.type === 'PHAST') {
            assessmentCopy.phast.modifications = new Array();
          } else if (assessmentCopy.type === 'PSAT') {
            assessmentCopy.psat.modifications = new Array();
          } else if (assessmentCopy.type == 'FSAT') {
            assessmentCopy.fsat.modifications = new Array();
          } else if (assessmentCopy.type == 'SSMT') {
            assessmentCopy.ssmt.modifications = new Array();
          } else if (assessmentCopy.type === 'CompressedAir') {
            assessmentCopy.compressedAirAssessment.modifications = new Array();
          } else if (assessmentCopy.type === 'WasteWater') {
            assessmentCopy.wasteWater.modifications = new Array();
          }
        }

        this.indexedDbService.addAssessment(assessmentCopy).then(newAssessmentId => {
          settingsCopy.assessmentId = newAssessmentId;
          this.indexedDbService.addSettings(settingsCopy).then(() => {
            this.settingsDbService.setAll().then(() => {
              this.assessmentDbService.setAll().then(() => {
                if (this.copyForm.controls.copyCalculators.value === true) {
                  assessmentCalculatorCopy.assessmentId = newAssessmentId;
                  this.indexedDbService.addCalculator(assessmentCalculatorCopy).then(() => {
                    this.calculatorDbService.setAll().then(() => {
                      this.dashboardService.updateDashboardData.next(true);
                    });
                  });
                } else {
                  this.dashboardService.updateDashboardData.next(true);
                }
              });
            });
          });
        });
      }
    });
    
    this.directory.calculators.forEach(preAssessment => {
      if (preAssessment.selected) {
        let preAssessmentCopy: Calculator = JSON.parse(JSON.stringify(preAssessment));
        delete preAssessmentCopy.id;
        preAssessmentCopy.selected = false;
        preAssessmentCopy.name = preAssessment.name + ' (copy)';
        preAssessmentCopy.directoryId = this.copyForm.controls.directoryId.value;
        this.indexedDbService.addCalculator(preAssessmentCopy).then(preAssessmentId => {
          this.calculatorDbService.setAll().then(() => {
            this.dashboardService.updateDashboardData.next(true);            
          });
        });
        preAssessment.selected = false;
      }
    });

    this.directory.inventories.forEach(inventory => {
      if (inventory.selected) {
        let inventoryCopy: InventoryItem = JSON.parse(JSON.stringify(inventory));
        delete inventoryCopy.id;
        let tmpSettings: Settings = this.settingsDbService.getByInventoryId(inventory);
        let settingsCopy: Settings = JSON.parse(JSON.stringify(tmpSettings));
        delete settingsCopy.id;
        inventoryCopy.selected = false;
        inventoryCopy.name = inventory.name + ' (copy)';
        inventoryCopy.directoryId = this.copyForm.controls.directoryId.value;
        inventoryCopy.createdDate = new Date();
        inventoryCopy.modifiedDate = new Date();
        this.indexedDbService.addInventoryItem(inventoryCopy).then(newInventoryId => {
          settingsCopy.inventoryId = newInventoryId;
          this.indexedDbService.addSettings(settingsCopy).then(() => {
            this.settingsDbService.setAll().then(() => {
              this.inventoryDbService.setAll().then(() => {
                this.dashboardService.updateDashboardData.next(true);
              });
            });
          });
        });
        inventory.selected = false;
      }
    });
    this.hideCopyModal();
  }

  addFolder() {
    this.showNewFolder = true;
  }

  cancelNewFolder() {
    this.showNewFolder = false;
  }

  initFolderForm() {
    return this.formBuilder.group({
      'folderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  createFolder() {
    let tmpFolder: Directory = {
      name: this.newFolderForm.controls.folderName.value,
      parentDirectoryId: this.newFolderForm.controls.directoryId.value,
      selected: false
    };
    let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(this.newFolderForm.controls.directoryId.value);
    delete tmpSettings.facilityInfo;
    delete tmpSettings.id;
    if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
      tmpSettings.facilityInfo = {
        companyName: this.newFolderForm.controls.companyName.value,
        facilityName: this.newFolderForm.controls.facilityName.value,
        date: new Date().toLocaleDateString()
      };
    }
    this.indexedDbService.addDirectory(tmpFolder).then((newDirId) => {
      tmpSettings.directoryId = newDirId;
      this.directoryDbService.setAll().then(() => {
        this.indexedDbService.addSettings(tmpSettings).then(() => {
          this.settingsDbService.setAll().then(() => {
            this.allDirectories = this.directoryDbService.getAll();
            this.copyForm.patchValue({
              'directoryId': newDirId
            });
            this.cancelNewFolder();
          });
        });
      });
    });
  }

}
