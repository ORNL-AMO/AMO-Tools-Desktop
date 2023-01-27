import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
 
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Calculator } from '../../shared/models/calculators';
import { Directory } from '../../shared/models/directory';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { DashboardService } from '../dashboard.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';

@Component({
  selector: 'app-move-items',
  templateUrl: './move-items.component.html',
  styleUrls: ['./move-items.component.css']
})
export class MoveItemsComponent implements OnInit {

  @ViewChild('moveModal', { static: false }) public moveModal: ModalDirective;
  moveForm: UntypedFormGroup;
  allDirectories: Array<Directory>;
  directory: Directory;
  folderSelected: boolean = false;
  showNewFolder: boolean = false;
  newFolderForm: UntypedFormGroup;

  constructor(
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private formBuilder: UntypedFormBuilder,
      
    private assessmentDbService: AssessmentDbService,
    private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService) { }

  ngOnInit() {
    this.setDirectories();
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.moveForm  = this.initForm();
    this.newFolderForm = this.initFolderForm();
  }

  async setDirectories() {
    this.allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
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

  async hideMoveModal() {
    this.folderSelected = false;
    this.moveModal.hide();
    let updatedDirectories: Array<Directory> = await firstValueFrom(this.directoryDbService.getAllDirectories());
    this.directoryDbService.setAll(updatedDirectories);
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

  async save() {
    this.saveAssessments();
    this.saveCalculators();
    this.saveDirectories();
    this.saveInventories();
    this.hideMoveModal();
  }

  async saveAssessments() {
    let hasSelectedAssessments: boolean = this.directory.assessments.some(assessment => assessment.selected);
    if (hasSelectedAssessments) {
      let updatedAssessments: Assessment[] = [];
      for (let i = 0; i < this.directory.assessments.length; i++) {
        if (this.directory.assessments[i].selected) {
          this.directoryDbService.setIsMovedExample(this.directory.assessments[i], this.moveForm);
          this.directory.assessments[i].directoryId = this.moveForm.controls.directoryId.value;
          updatedAssessments = await firstValueFrom(this.assessmentDbService.updateWithObservable(this.directory.assessments[i]));
        }
      }
      this.assessmentDbService.setAll(updatedAssessments);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async saveCalculators() {
    let hasSelectedCalculators: boolean = this.directory.calculators.some(calculator => calculator.selected);
    if (hasSelectedCalculators) {
      let updatedCalculators: Calculator[] = [];
      for (let i = 0; i < this.directory.calculators.length; i++) {
        let calculator: Calculator = this.directory.calculators[i];
        if (calculator.selected) {
          calculator.directoryId = this.moveForm.controls.directoryId.value;
          updatedCalculators = await firstValueFrom(this.calculatorDbService.updateWithObservable(calculator))
          calculator.selected = false;
        }
      };
      this.calculatorDbService.setAll(updatedCalculators);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async saveInventories() {
    let hasSelectedInventories: boolean = this.directory.inventories.some(inventory => inventory.selected);
    if (hasSelectedInventories) {
      let updatedInventoryItems: InventoryItem[];
      if (this.directory.inventories.length > 0) {
        for (let i = 0; i < this.directory.inventories.length; i++) {
          let inventory: InventoryItem = this.directory.inventories[i];          
          if (inventory.selected) {
            this.directoryDbService.setIsMovedExample(inventory, this.moveForm);
            inventory.directoryId = this.moveForm.controls.directoryId.value;
            updatedInventoryItems = await firstValueFrom(this.inventoryDbService.updateWithObservable(inventory));
            inventory.selected = false;
          }
        }
        this.inventoryDbService.setAll(updatedInventoryItems);
        this.dashboardService.updateDashboardData.next(true);
      }
    } 
  }

  async saveDirectories() {
    let hasSelectedDirectories: boolean = this.directory.subDirectory.some(directory => directory.selected);
    if (hasSelectedDirectories) {
      let updatedDirectories: Directory[];
        for (let i = 0; i < this.directory.subDirectory.length; i++) {
          let subDir: Directory = this.directory.subDirectory[i];
          if (subDir.selected) {
            if (subDir.parentDirectoryId !== this.moveForm.controls.directoryId.value) {
              subDir.parentDirectoryId = this.moveForm.controls.directoryId.value;
              updatedDirectories = await firstValueFrom(this.directoryDbService.updateWithObservable(subDir));
              this.directoryDbService.setAll(updatedDirectories);
            } else {
              this.hideMoveModal();
            }
            subDir.selected = false;
          }
        }
        this.directoryDbService.setAll(updatedDirectories);
        this.dashboardService.updateDashboardData.next(true);
    }
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


  async createFolder() {
    let newDirectoryId: number = await this.directoryDashboardService.addDirectoryAndSettings(this.newFolderForm);
    this.setDirectories();
    this.moveForm.patchValue({
      'directoryId': newDirectoryId
    });
    this.cancelNewFolder();
  }
}
