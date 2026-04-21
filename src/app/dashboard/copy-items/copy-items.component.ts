import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
 
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { DiagramIdbService } from '../../indexedDb/diagram-idb.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Calculator } from '../../shared/models/calculators';
import { Directory } from '../../shared/models/directory';
import { Diagram } from '../../shared/models/diagram';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { Settings } from '../../shared/models/settings';
import { DashboardService } from '../dashboard.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { PumpMotorIntegrationService } from '../../shared/connected-inventory/pump-motor-integration.service';
import { CompressedAirMotorIntegrationService } from '../../shared/connected-inventory/compressed-air-motor-integration.service';


@Component({
    selector: 'app-copy-items',
    templateUrl: './copy-items.component.html',
    styleUrls: ['./copy-items.component.css'],
    standalone: false
})
export class CopyItemsComponent implements OnInit {

  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;
  copyForm: UntypedFormGroup;
  destinationDirectoryOptions: Array<Directory>;
  directory: Directory;
  selectedAssessments: Array<Assessment> = [];
  selectedInventories: Array<InventoryItem> = [];
  selectedCalculators: Array<Calculator> = [];
  selectedDiagrams: Array<Diagram> = [];
  selectedDirData: SelectedDirectoryData;
  showNewFolder: boolean = false;
  newFolderForm: UntypedFormGroup;
  showItems: boolean = true;

  constructor(
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private formBuilder: UntypedFormBuilder,
      
    private assessmentDbService: AssessmentDbService,
    private pumpMotorIntegrationService: PumpMotorIntegrationService,
    private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService,
    private diagramIdbService: DiagramIdbService,
    private settingsDbService: SettingsDbService,
    private compressedAirMotorIntegrationService: CompressedAirMotorIntegrationService) { }

  async ngOnInit() {
    this.selectedDirData = this.getResetSelectedDirData();
    this.destinationDirectoryOptions = await firstValueFrom(this.directoryDbService.getAllDirectories());
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.initCopyForm();
    this.initFolderForm();
    this.setSelectedCopyItems(this.directory);
    this.setSelectedCopyDirectories();
  }

  setSelectedCopyItems(directory: Directory, userSelectedParentDirectoryId?: number) {
    directory.assessments.forEach(assessment => {
      if (assessment.selected) {
        this.selectedAssessments.push(assessment);
      } else if (userSelectedParentDirectoryId != undefined) {
        this.selectedDirData.assessments.push(assessment);
        this.selectedDirData.assessmentToDirectoryIdMap[assessment.id] = userSelectedParentDirectoryId;
      }
    });

    directory.calculators.forEach(calculator => {
      if (calculator.selected) {
        this.selectedCalculators.push(calculator);
      } else if (userSelectedParentDirectoryId != undefined) {
        this.selectedDirData.calculators.push(calculator);
        this.selectedDirData.calculatorToDirectoryIdMap[calculator.id] = userSelectedParentDirectoryId;
      }
    });

    directory.inventories.forEach(inventory => {
      if (inventory.selected) {
        this.selectedInventories.push(inventory);
      } else if (userSelectedParentDirectoryId != undefined) {
        this.selectedDirData.inventories.push(inventory);
        this.selectedDirData.inventoryToDirectoryIdMap[inventory.id] = userSelectedParentDirectoryId;
      }
    });

    directory.diagrams.forEach(diagram => {
      if (diagram.selected) {
        this.selectedDiagrams.push(diagram);
      } else if (userSelectedParentDirectoryId != undefined) {
        this.selectedDirData.diagrams.push(diagram);
        this.selectedDirData.diagramToDirectoryIdMap[diagram.id] = userSelectedParentDirectoryId;
      }
    });
  }

  setSelectedCopyDirectories() {
    this.directory.subDirectory.forEach(dir => {
      if (dir.selected) {
        this.setSelectedCopyItems(dir, dir.id);
        let selectedDirectory = {
          directory: dir,
          subDirectories: []
        }
        dir.subDirectory.forEach(subDir => {
          this.setSelectedCopyItems(subDir, subDir.id);
          selectedDirectory.subDirectories.push(subDir);
        });
        this.selectedDirData.selectedDirectories.push(selectedDirectory);
        _.remove(this.destinationDirectoryOptions, (dirOption) => { return dirOption.id === dir.id; });
        _.remove(this.destinationDirectoryOptions, (dirOption) => { return dirOption.parentDirectoryId === dir.id; });
      }
    });
  }

  initCopyForm() {
    if (this.selectedDirData.selectedDirectories.length !== 0) {
      this.copyForm = this.formBuilder.group({
        'destinationDirectoryId': [this.directory.parentDirectoryId, Validators.required],
        'copyModifications': [true],
        'copyCalculators': [false]
      });
    } else {
      this.copyForm = this.formBuilder.group({
        'destinationDirectoryId': [this.directory.id, Validators.required],
        'copyModifications': [true],
        'copyCalculators': [false]
      });
    }
  }

  ngAfterViewInit() {
    this.showCopyModal();
  }

  showCopyModal() {
    this.showItems = true;
    this.copyModal.show();
  }

  hideCopyModal() {
    this.selectedAssessments = undefined;
    this.selectedCalculators = undefined;
    this.selectedInventories = undefined;
    this.selectedDiagrams = undefined;
    this.selectedDirData = this.getResetSelectedDirData();
    this.copyModal.hide();
    this.dashboardService.copyItems.next(false);
  }

  getParentDirStr(id: number) {
      let parentDir = _.find(this.destinationDirectoryOptions, (dir) => { return dir.id === id; });
      let str = parentDir.name + '/';
      if (parentDir.parentDirectoryId !== undefined) {
        parentDir = _.find(this.destinationDirectoryOptions, (dir) => { return dir.id === parentDir.parentDirectoryId; });
        if (parentDir) {
          str = parentDir.name + '/' + str;
        }
      }
      return str;
  }

  async copyDirectories() {
    for await (const originalDir of this.selectedDirData.selectedDirectories) { 
      let newDirectoryId: number = await this.copyDirectory(originalDir.directory);
      for await (const subDir of originalDir.subDirectories) {
        await this.copyDirectory(subDir, newDirectoryId);
      } 
    }
    let allSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);
    let allDirectories: Directory[] = await firstValueFrom(this.directoryDbService.getAllDirectories());
    this.directoryDbService.setAll(allDirectories);
  }

  async createCopy(){
    this.showItems = false;
    // * copy directories first to set new id for items within
    if (this.selectedDirData.selectedDirectories.length !== 0) {
      await this.copyDirectories();
      this.selectedAssessments.push(...this.selectedDirData.assessments);
      this.selectedInventories.push(...this.selectedDirData.inventories);
      this.selectedCalculators.push(...this.selectedDirData.calculators);
      this.selectedDiagrams.push(...this.selectedDirData.diagrams);
    }

    let copiedAssessmentIdsBySourceId: { [sourceId: number]: number } = {};
    let copiedDiagramIdsBySourceId: { [sourceId: number]: number } = {};
    await this.copyDirectoryAssessmentsAndSettings(copiedAssessmentIdsBySourceId, copiedDiagramIdsBySourceId);
    await this.copyDirectoryDiagrams(copiedAssessmentIdsBySourceId, copiedDiagramIdsBySourceId);
    await this.copyDirectoryCalculators();
    await this.copyDirectoryInventory();
    this.hideCopyModal();
  }

  async copyDirectory(originalDirectory: Directory, selectedParentDirId?: number) {
      let oldDirectoryId: number = originalDirectory.id;
      delete originalDirectory.id;
      if (selectedParentDirId !== undefined) {
        originalDirectory.parentDirectoryId = selectedParentDirId;
      } else {
        originalDirectory.parentDirectoryId = this.copyForm.controls.destinationDirectoryId.value
      }
      originalDirectory.name = originalDirectory.name + ' (copy)';
      let newDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(originalDirectory));
      this.selectedDirData.newDirectoryIdMap[oldDirectoryId] = newDirectory.id;

      let originalSettings: Settings = this.settingsDbService.getByDirectoryId(originalDirectory.id);
      originalSettings.directoryId = newDirectory.id;
      delete originalSettings.id;
      await firstValueFrom(this.settingsDbService.addWithObservable(originalSettings));

      return newDirectory.id;
  }

  async copyDirectoryAssessmentsAndSettings(copiedAssessmentIdsBySourceId: { [sourceId: number]: number },
    copiedDiagramIdsBySourceId: { [sourceId: number]: number }) {
    if (this.selectedAssessments.length !== 0) {
      let selectedDiagramIds: Array<number> = this.selectedDiagrams.map(diagram => diagram.id);
      for await (let assessment of this.selectedAssessments) {
          let assessmentCopy: Assessment = JSON.parse(JSON.stringify(assessment));
          let originalAssessmentId: number = assessmentCopy.id;

          // * if item is member of selected directory
          let originalDirectoryId: number = this.selectedDirData.assessmentToDirectoryIdMap[assessmentCopy.id];
          let destinationDirectoryId: number = this.selectedDirData.newDirectoryIdMap[originalDirectoryId];

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
          if (destinationDirectoryId !== undefined) {
            assessmentCopy.directoryId = destinationDirectoryId;
          } else {
            assessmentCopy.directoryId = this.copyForm.controls.destinationDirectoryId.value;
          }
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
          copiedAssessmentIdsBySourceId[originalAssessmentId] = addedAssessment.id;
          settingsCopy.assessmentId = addedAssessment.id;
          await firstValueFrom(this.settingsDbService.addWithObservable(settingsCopy));

          if (assessment.diagramId && !selectedDiagramIds.includes(assessment.diagramId)) {
            let sourceDiagram: Diagram = this.diagramIdbService.findById(assessment.diagramId);
            if (sourceDiagram) {
              let diagramCopy: Diagram = JSON.parse(JSON.stringify(sourceDiagram));
              delete diagramCopy.id;
              diagramCopy.assessmentId = addedAssessment.id;
              diagramCopy.name = sourceDiagram.name + ' (copy)';
              diagramCopy.directoryId = assessmentCopy.directoryId;
              let addedDiagram: Diagram = await firstValueFrom(this.diagramIdbService.addWithObservable(diagramCopy));
              copiedDiagramIdsBySourceId[sourceDiagram.id] = addedDiagram.id;

              let tempDiagramSettings: Settings = this.settingsDbService.getByDiagramId(sourceDiagram, true);
              if (tempDiagramSettings) {
                let diagramSettingsCopy: Settings = JSON.parse(JSON.stringify(tempDiagramSettings));
                delete diagramSettingsCopy.id;
                diagramSettingsCopy.diagramId = addedDiagram.id;
                await firstValueFrom(this.settingsDbService.addWithObservable(diagramSettingsCopy));
              }

              addedAssessment.diagramId = addedDiagram.id;
              await firstValueFrom(this.assessmentDbService.updateWithObservable(addedAssessment));
            }
          }

          if (this.copyForm.controls.copyCalculators.value === true) {
            assessmentCalculatorCopy.assessmentId = addedAssessment.id;
            await firstValueFrom(this.calculatorDbService.addWithObservable(assessmentCalculatorCopy));
        }
      };
      let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
      let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      let updatedCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      let updatedDiagrams: Diagram[] = await firstValueFrom(this.diagramIdbService.getAllDiagrams());
      this.assessmentDbService.setAll(updatedAssessments);
      this.settingsDbService.setAll(updatedSettings);
      this.calculatorDbService.setAll(updatedCalculators);
      this.diagramIdbService.setAll(updatedDiagrams);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async copyDirectoryDiagrams(copiedAssessmentIdsBySourceId: { [sourceId: number]: number },
    copiedDiagramIdsBySourceId: { [sourceId: number]: number }) {
    if (this.selectedDiagrams.length !== 0) {
      let selectedAssessmentIds: Array<number> = this.selectedAssessments.map(assessment => assessment.id);
      for await (let diagram of this.selectedDiagrams) {
          let diagramCopy: Diagram = JSON.parse(JSON.stringify(diagram));
          let originalDiagramId: number = diagramCopy.id;

          // * if item is member of selected directory
          let originalDirectoryId: number = this.selectedDirData.diagramToDirectoryIdMap[diagramCopy.id];
          let destinationDirectoryId: number = this.selectedDirData.newDirectoryIdMap[originalDirectoryId];

          delete diagramCopy.id;
          if (destinationDirectoryId !== undefined) {
            diagramCopy.directoryId = destinationDirectoryId;
          } else {
            diagramCopy.directoryId = this.copyForm.controls.destinationDirectoryId.value;
          }
          diagramCopy.name = diagram.name + ' (copy)';
          let linkedAssessmentId: number = diagram.assessmentId;
          delete diagramCopy.assessmentId;
          let newDiagram: Diagram = await firstValueFrom(this.diagramIdbService.addWithObservable(diagramCopy));
          copiedDiagramIdsBySourceId[originalDiagramId] = newDiagram.id;

          let tmpSettings: Settings = this.settingsDbService.getByDiagramId(diagram, true);
          if (tmpSettings) {
            let settingsCopy: Settings = JSON.parse(JSON.stringify(tmpSettings));
            delete settingsCopy.id;
            settingsCopy.diagramId = newDiagram.id;
            await firstValueFrom(this.settingsDbService.addWithObservable(settingsCopy));
          }

          if (linkedAssessmentId) {
            if (selectedAssessmentIds.includes(linkedAssessmentId) && copiedAssessmentIdsBySourceId[linkedAssessmentId]) {
              let copiedAssessment: Assessment = this.assessmentDbService.findById(copiedAssessmentIdsBySourceId[linkedAssessmentId]);
              if (copiedAssessment) {
                newDiagram.assessmentId = copiedAssessment.id;
                copiedAssessment.diagramId = newDiagram.id;
                await firstValueFrom(this.assessmentDbService.updateWithObservable(copiedAssessment));
              }
            } else {
              let sourceAssessment: Assessment = this.assessmentDbService.findById(linkedAssessmentId);
              if (sourceAssessment) {
                let assessmentCopy: Assessment = JSON.parse(JSON.stringify(sourceAssessment));
                delete assessmentCopy.id;
                assessmentCopy.name = sourceAssessment.name + ' (copy)';
                assessmentCopy.isExample = false;
                assessmentCopy.directoryId = diagramCopy.directoryId;
                assessmentCopy.diagramId = newDiagram.id;
                let addedAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(assessmentCopy));
                copiedAssessmentIdsBySourceId[sourceAssessment.id] = addedAssessment.id;

                let tmpAssessmentSettings: Settings = this.settingsDbService.getByAssessmentId(sourceAssessment, true);
                if (tmpAssessmentSettings) {
                  let assessmentSettingsCopy: Settings = JSON.parse(JSON.stringify(tmpAssessmentSettings));
                  delete assessmentSettingsCopy.id;
                  assessmentSettingsCopy.assessmentId = addedAssessment.id;
                  await firstValueFrom(this.settingsDbService.addWithObservable(assessmentSettingsCopy));
                }

                newDiagram.assessmentId = addedAssessment.id;
              }
            }
            await firstValueFrom(this.diagramIdbService.updateWithObservable(newDiagram));
          }
      }
      let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
      let updatedDiagrams: Diagram[] = await firstValueFrom(this.diagramIdbService.getAllDiagrams());
      let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      this.assessmentDbService.setAll(updatedAssessments);
      this.diagramIdbService.setAll(updatedDiagrams);
      this.settingsDbService.setAll(updatedSettings);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async copyDirectoryCalculators() {
    if (this.selectedCalculators.length !== 0) {
      for await (let calculator of this.selectedCalculators) {
          let calculatorCopy: Calculator = JSON.parse(JSON.stringify(calculator));

          // * if item is member of selected directory
          let originalDirectoryId: number = this.selectedDirData.calculatorToDirectoryIdMap[calculatorCopy.id];
          let destinationDirectoryId: number = this.selectedDirData.newDirectoryIdMap[originalDirectoryId];

          delete calculatorCopy.id;
          calculatorCopy.selected = false;
          calculatorCopy.name = calculator.name + ' (copy)';
          if (destinationDirectoryId !== undefined) {
            calculatorCopy.directoryId = destinationDirectoryId;
          } else {
            calculatorCopy.directoryId = this.copyForm.controls.destinationDirectoryId.value;
          }
          
          await firstValueFrom(this.calculatorDbService.addWithObservable(calculatorCopy));
          calculator.selected = false;
      };
      let updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.calculatorDbService.setAll(updatedCalculators);
      this.dashboardService.updateDashboardData.next(true);
    }
  }

  async copyDirectoryInventory() {
    if (this.selectedInventories.length !== 0) {
      for await (let inventory of this.selectedInventories) {
          let inventoryCopy: InventoryItem = JSON.parse(JSON.stringify(inventory));

          // * if item is member of selected directory
          let originalDirectoryId: number = this.selectedDirData.inventoryToDirectoryIdMap[inventoryCopy.id];
          let destinationDirectoryId: number = this.selectedDirData.newDirectoryIdMap[originalDirectoryId];

          delete inventoryCopy.id;
          let tmpSettings: Settings = this.settingsDbService.getByInventoryId(inventory);
          let settingsCopy: Settings = JSON.parse(JSON.stringify(tmpSettings));
          delete settingsCopy.id;
          if (inventoryCopy.motorInventoryData) {
            this.pumpMotorIntegrationService.removeAllMotorConnectedItems(inventoryCopy);
            this.compressedAirMotorIntegrationService.removeAllMotorConnectedItems(inventoryCopy);
          } else if (inventoryCopy.pumpInventoryData) {
            this.pumpMotorIntegrationService.removeAllPumpConnectedItems(inventoryCopy);
          } else if (inventoryCopy.compressedAirInventoryData) {
            this.compressedAirMotorIntegrationService.removeAllCompressedAirConnectedItems(inventoryCopy);
          }

          inventoryCopy.selected = false;
          inventoryCopy.isExample = false;
          inventoryCopy.name = inventory.name + ' (copy)';
          if (destinationDirectoryId !== undefined) {
            inventoryCopy.directoryId = destinationDirectoryId;
          } else {
            inventoryCopy.directoryId = this.copyForm.controls.destinationDirectoryId.value;
          }

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

  addFolder() {
    this.showNewFolder = true;
  }

  cancelNewFolder() {
    this.showNewFolder = false;
  }

  initFolderForm() {
    this.newFolderForm = this.formBuilder.group({
      'folderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  async createDirectory() {
    let newDirectoryId: number = await this.directoryDashboardService.addDirectoryAndSettings(this.newFolderForm);
    this.destinationDirectoryOptions = await firstValueFrom(this.directoryDbService.getAllDirectories());
    
    // * Added folder becomes new starting directory and copy-to-destination dir
    this.newFolderForm.patchValue({
      'directoryId': newDirectoryId
    });
    this.copyForm.patchValue({
      'destinationDirectoryId': newDirectoryId
    });
    this.cancelNewFolder();
  }

  getResetSelectedDirData(): SelectedDirectoryData  {
    return {
      directories: [],
      assessments: [],
      inventories: [],
      calculators: [],
      diagrams: [],
      subDirectories: [],
      selectedDirectories: [],
      assessmentToDirectoryIdMap: {},
      inventoryToDirectoryIdMap: {},
      calculatorToDirectoryIdMap: {},
      diagramToDirectoryIdMap: {},
      newDirectoryIdMap: {},
    }
  }
}

export interface SelectedDirectoryData {
  directories: Array<Directory>;
  assessments: Array<Assessment>;
  inventories: Array<InventoryItem>;
  calculators: Array<Calculator>;
  diagrams: Array<Diagram>;
  selectedDirectories: Array<SelectedDirectory>;
  subDirectories: Array<Directory>;
  // * map items from a selected directory to move with copied directory
  assessmentToDirectoryIdMap: { [itemId: number]: number };
  inventoryToDirectoryIdMap: { [itemId: number]: number };
  calculatorToDirectoryIdMap: { [itemId: number]: number };
  diagramToDirectoryIdMap: { [itemId: number]: number };
  newDirectoryIdMap: { [oldDirId: number]: number };
}

export interface SelectedDirectory {
  directory: Directory,
  subDirectories: Array<Directory>
}
