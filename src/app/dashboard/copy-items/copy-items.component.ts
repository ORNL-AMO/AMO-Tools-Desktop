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
import { Settings } from '../../shared/models/settings';
import { DashboardService } from '../dashboard.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { MotorIntegrationService } from '../../shared/connected-inventory/motor-integration.service';


@Component({
  selector: 'app-copy-items',
  templateUrl: './copy-items.component.html',
  styleUrls: ['./copy-items.component.css']
})
export class CopyItemsComponent implements OnInit {

  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;
  copyForm: UntypedFormGroup;
  allDirectories: Array<Directory>;
  directory: Directory;
  assessmentCopy: boolean = false;
  folderSelected: boolean = false;
  showNewFolder: boolean = false;
  newFolderForm: UntypedFormGroup;

  constructor(
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private formBuilder: UntypedFormBuilder,
      
    private assessmentDbService: AssessmentDbService,
    private motorIntegrationService: MotorIntegrationService,
    private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService,
    private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.setDirectories();
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.copyForm = this.initForm();
    this.newFolderForm = this.initFolderForm();
  }

  async setDirectories() {
    this.allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
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
        'copyModifications': [true],
        'copyCalculators': [false]
      });
    } else {
      return this.formBuilder.group({
        'directoryId': [this.directory.id, Validators.required],
        'copyModifications': [true],
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

  async copyDirectoryAssessmentsAndSettings() {
    let selectedAssessments: Assessment[] = this.directory.assessments.filter(assessment => assessment.selected);
    if (selectedAssessments.length !== 0) {
      for await (let assessment of selectedAssessments) {
          let assessmentCopy: Assessment = JSON.parse(JSON.stringify(assessment));
          delete assessmentCopy.id;
          let tempCalculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
          let assessmentCalculatorCopy: Calculator;
          if (tempCalculator) {
            assessmentCalculatorCopy = JSON.parse(JSON.stringify(tempCalculator));
            delete assessmentCalculatorCopy.id;
          }
          let tempSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
          let settingsCopy: Settings = JSON.parse(JSON.stringify(tempSettings));
          delete settingsCopy.id;
          assessmentCopy.name = assessment.name + ' (copy)';
          assessmentCopy.isExample = false;
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

          let addedAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(assessmentCopy));
          settingsCopy.assessmentId = addedAssessment.id;

          await firstValueFrom(this.settingsDbService.addWithObservable(settingsCopy));

          if (this.copyForm.controls.copyCalculators.value === true) {
            assessmentCalculatorCopy.assessmentId = addedAssessment.id;
            await firstValueFrom(this.calculatorDbService.addWithObservable(assessmentCalculatorCopy));
        }
      };
      let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
      let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      let updatedCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.assessmentDbService.setAll(updatedAssessments);
      this.settingsDbService.setAll(updatedSettings);
      this.calculatorDbService.setAll(updatedCalculators);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async copyDirectoryCalculators() {
    let selectedCalculators: Calculator[] = this.directory.calculators.filter(calculator => calculator.selected);
    if (selectedCalculators.length !== 0) {
      for await (let calculator of selectedCalculators) {
          let calculatorCopy: Calculator = JSON.parse(JSON.stringify(calculator));
          delete calculatorCopy.id;
          calculatorCopy.selected = false;
          calculatorCopy.name = calculator.name + ' (copy)';
          calculatorCopy.directoryId = this.copyForm.controls.directoryId.value;
          
          await firstValueFrom(this.calculatorDbService.addWithObservable(calculatorCopy));
          calculator.selected = false;
      };
      let updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.calculatorDbService.setAll(updatedCalculators);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async copyDirectoryInventory() {
    let selectedInventories: InventoryItem[] = this.directory.inventories.filter(inventory => inventory.selected);
    if (selectedInventories.length !== 0) {
      for await (let inventory of selectedInventories) {
          let inventoryCopy: InventoryItem = JSON.parse(JSON.stringify(inventory));
          delete inventoryCopy.id;
          let tmpSettings: Settings = this.settingsDbService.getByInventoryId(inventory);
          let settingsCopy: Settings = JSON.parse(JSON.stringify(tmpSettings));
          delete settingsCopy.id;
          if (inventoryCopy.motorInventoryData) {
            this.motorIntegrationService.removeAllMotorConnectedItems(inventoryCopy);
          } else if (inventoryCopy.pumpInventoryData) {
            this.motorIntegrationService.removeAllPumpConnectedItems(inventoryCopy);
          }

          inventoryCopy.selected = false;
          inventoryCopy.name = inventory.name + ' (copy)';
          inventoryCopy.directoryId = this.copyForm.controls.directoryId.value;

          let newInventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(inventoryCopy));
          settingsCopy.inventoryId = newInventory.id;
          await firstValueFrom(this.settingsDbService.addWithObservable(settingsCopy));
          inventory.selected = false;
      }
      let updatedInventories: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
      let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      this.inventoryDbService.setAll(updatedInventories);
      this.settingsDbService.setAll(updatedSettings);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async createCopy(){
    await this.copyDirectoryAssessmentsAndSettings();
    await this.copyDirectoryCalculators();
    await this.copyDirectoryInventory();
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

  async createFolder() {
    let newDirectoryId: number = await this.directoryDashboardService.addDirectoryAndSettings(this.newFolderForm);
    this.setDirectories();
    this.newFolderForm.patchValue({
      'directoryId': newDirectoryId
    });
    this.cancelNewFolder();
  }

}
