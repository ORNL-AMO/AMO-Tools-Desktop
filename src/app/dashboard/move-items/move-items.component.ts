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
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { DashboardService } from '../dashboard.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';

@Component({
  selector: 'app-move-items',
  templateUrl: './move-items.component.html',
  styleUrls: ['./move-items.component.css']
})
export class MoveItemsComponent implements OnInit {

  @ViewChild('moveModal', { static: false }) public moveModal: ModalDirective;
  moveForm: FormGroup;
  allDirectories: Array<Directory>;
  directory: Directory;
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
    this.moveForm  = this.initForm();
    this.newFolderForm = this.initFolderForm();
  }

  initForm() {
    this.directory.subDirectory.forEach(subDir => {
      if (subDir.selected) {
        this.folderSelected = true;
        _.remove(this.allDirectories, (dir) => { return dir.id === subDir.id; });
        _.remove(this.allDirectories, (dir) => { return dir.parentDirectoryId === subDir.id; });
      }
    });

    if (this.folderSelected) {
      return this.formBuilder.group({
        'directoryId': [this.directory.parentDirectoryId, Validators.required]
      });
    } else {
      return this.formBuilder.group({
        'directoryId': [this.directory.id, Validators.required]
      });
    }    
    
  }

  ngAfterViewInit() {
    this.showMoveModal();
  }

  showMoveModal() {
    this.moveModal.show();
  }

  hideMoveModal() {
    this.folderSelected = false;
    this.moveModal.hide();
    this.directoryDbService.setAll();
    this.dashboardService.moveItems.next(false);
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

  save() {
    this.directory.assessments.forEach(assessment => {
      if (assessment.selected) {
        assessment.directoryId = this.moveForm.controls.directoryId.value;
        this.indexedDbService.putAssessment(assessment).then(val => {
          this.assessmentDbService.setAll().then(() => {
            this.dashboardService.updateDashboardData.next(true);
          });
        });
      }
    });
    this.directory.calculators.forEach(calculator => {
      if (calculator.selected) {
        calculator.directoryId = this.moveForm.controls.directoryId.value;
        this.indexedDbService.putCalculator(calculator).then(val => {
          this.calculatorDbService.setAll().then(() => {
            this.dashboardService.updateDashboardData.next(true);
          });
        });
        calculator.selected = false;
      }
    });
    this.directory.subDirectory.forEach(subDir => {
      if (subDir.selected) {
        if (subDir.parentDirectoryId !== this.moveForm.controls.directoryId.value) {
          subDir.parentDirectoryId = this.moveForm.controls.directoryId.value;
          this.indexedDbService.putDirectory(subDir).then(val => {
            this.directoryDbService.setAll().then(() => {
              this.dashboardService.updateDashboardData.next(true);
            });
          });
        } else {
          subDir.parentDirectoryId = subDir.parentDirectoryId;
          this.hideMoveModal();
        }
        subDir.selected = false;
      }
    });
    this.directory.inventories.forEach(inventory => {
      if (inventory.selected) {
        inventory.directoryId = this.moveForm.controls.directoryId.value;
        this.indexedDbService.putInventoryItem(inventory).then(val => {
          this.inventoryDbService.setAll().then(() => {
            this.dashboardService.updateDashboardData.next(true);
          });
        });
        inventory.selected = false;
      }
    });
    this.hideMoveModal();
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
            this.moveForm.patchValue({
              'directoryId': newDirId
            });
            this.cancelNewFolder();
          });
        });
      });
    });
  }
}
