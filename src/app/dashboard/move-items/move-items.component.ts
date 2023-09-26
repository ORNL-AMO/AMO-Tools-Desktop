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
    await this.saveAssessments();
    await this.saveCalculators();
    await this.saveDirectories();
    await this.saveInventories();
    await this.hideMoveModal();
  }

  async saveAssessments() {
    let selectedAssessments: Assessment[] = this.directory.assessments.filter(assessment => assessment.selected);
    if (selectedAssessments.length !== 0) {
      let updatedAssessments: Assessment[] = [];
      for await (let selectedAssessment of selectedAssessments) { 
        this.directoryDbService.setIsMovedExample(selectedAssessment, this.moveForm);
        selectedAssessment.directoryId = this.moveForm.controls.directoryId.value;
        await firstValueFrom(this.assessmentDbService.updateWithObservable(selectedAssessment));
        updatedAssessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
        selectedAssessment.selected = false;
      }
      this.assessmentDbService.setAll(updatedAssessments);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async saveCalculators() {
    let selectedCalculators: Calculator[] = this.directory.calculators.filter(calculator => calculator.selected);
    if (selectedCalculators.length !== 0) {
      let updatedCalculators: Calculator[] = [];
      for await (let calculator of selectedCalculators) { 
        calculator.directoryId = this.moveForm.controls.directoryId.value;
        await firstValueFrom(this.calculatorDbService.updateWithObservable(calculator));
        updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators()); 
        calculator.selected = false;
      };
      this.calculatorDbService.setAll(updatedCalculators);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async saveInventories() {
    let selectedInventories: InventoryItem[] = this.directory.inventories.filter(inventory => inventory.selected);
    if (selectedInventories.length !== 0) {
      let updatedInventoryItems: InventoryItem[];
      for await (let inventory of selectedInventories) {
        this.directoryDbService.setIsMovedExample(inventory, this.moveForm);
        inventory.directoryId = this.moveForm.controls.directoryId.value;
        await firstValueFrom(this.inventoryDbService.updateWithObservable(inventory));
        updatedInventoryItems = await firstValueFrom(this.inventoryDbService.getAllInventory());
        inventory.selected = false;
      }
      this.inventoryDbService.setAll(updatedInventoryItems);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async saveDirectories() {
    let selectedDirectories: Directory[] = this.directory.subDirectory.filter(directory => directory.selected);
    if (selectedDirectories.length !== 0) {
      let updatedDirectories: Directory[];
      for await (let directory of selectedDirectories) {
        if (directory.parentDirectoryId !== this.moveForm.controls.directoryId.value) {
          directory.parentDirectoryId = this.moveForm.controls.directoryId.value;
          await firstValueFrom(this.directoryDbService.updateWithObservable(directory));
          let updatedDirectories: Directory[] = await firstValueFrom(this.directoryDbService.getAllDirectories()); 
          this.directoryDbService.setAll(updatedDirectories);
        } else {
          this.hideMoveModal();
        }
        directory.selected = false;
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
