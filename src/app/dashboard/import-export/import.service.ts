import { Injectable } from '@angular/core';
 
import { ImportExportData, ImportExportAssessment, ImportExportDirectory, ImportExportInventory } from './importExportModel';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import * as _ from 'lodash';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { firstValueFrom } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { Directory } from '../../shared/models/directory';
import { InventoryItem } from '../../shared/models/inventory/inventory';

@Injectable()
export class ImportService {

  directoryItems: Array<ImportExportDirectory>;
  assessmentItems: Array<ImportExportAssessment>;
  inventoryItems: Array<ImportExportInventory>;
  addedDirIds: Array<number>;
  assessmentsAdded: Array<ImportExportAssessment>;
  inventoriesAdded: Array<ImportExportInventory>;
  constructor(   private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService,
    private assessmentDbService: AssessmentDbService, private inventoryDbService: InventoryDbService) { }

  async importData(data: ImportExportData, workingDirectoryId: number) {
    this.addedDirIds = new Array<number>();
    this.assessmentsAdded = new Array<ImportExportAssessment>();
    this.inventoriesAdded = new Array<ImportExportInventory>();
    this.assessmentItems = data.assessments;
    this.inventoryItems = data.inventories;
    for (let i = 0; i < this.assessmentItems.length; i++) {
      this.assessmentItems[i].assessment.selected = false;
    }
    this.directoryItems = data.directories;
    //tmpDir to hold new data
    if (data.directories.length !== 0) {
      let tmpDirectory: ImportDirectory = {
        //set tmpDir id as parentDirDirectoryId of first directory
        id: data.directories[0].directory.parentDirectoryId,
        directoryItem: undefined,
        assessments: new Array(),
        subDirectories: new Array(),
        inventories: new Array()
      };
      tmpDirectory = this.buildDir(tmpDirectory, data.directories);
      tmpDirectory.subDirectories.forEach(dir => {
        dir.directoryItem.directory.parentDirectoryId = workingDirectoryId;
      })
      this.addDirectory(tmpDirectory);
      //Add Assessments no in directories
      let tmpAssessments: Array<ImportExportAssessment> = _.xorBy(this.assessmentsAdded, data.assessments, 'assessment.assessment.id');
      this.addAssessments(tmpAssessments, workingDirectoryId);
      let tmpInventories: Array<ImportExportInventory> = _.xorBy(this.inventoriesAdded, data.inventories, 'inventoryItem.inventoryItem.id');
      this.addInventories(tmpInventories, workingDirectoryId);
    } else {
      if (data.assessments && data.assessments.length !== 0) {
        this.addAssessments(data.assessments, workingDirectoryId);
      }
      if (data.inventories && data.inventories.length !== 0) {
        this.addInventories(data.inventories, workingDirectoryId);
      }
    }

    if (data.calculators) {
      let updatedCalculators: Calculator[];
      for (let i = 0; i < data.calculators.length; i++) {
        let calculator: Calculator = data.calculators[i];
        calculator.selected = false;
        delete calculator.id;
        calculator.directoryId = workingDirectoryId;
        await firstValueFrom(this.calculatorDbService.addWithObservable(calculator));
      };
      updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.calculatorDbService.setAll(updatedCalculators);
    }
  }

  buildDir(_directory: ImportDirectory, directoryItems: Array<ImportExportDirectory>): ImportDirectory {
    let hasBeenAdded = _.find(this.addedDirIds, (id) => { return id === _directory.id; });
    if (hasBeenAdded) {
      //this directory has been built already
      return _directory;
    } else {
      this.addedDirIds.push(_directory.id);
    }
    //get siblingDirs
    let tmpDirs: Array<ImportExportDirectory> = _.filter(directoryItems, (dir) => { return dir.directory.parentDirectoryId === _directory.id; });

    let subDirs: Array<ImportDirectory> = new Array<ImportDirectory>();
    tmpDirs.forEach(dir => {
      // if (first) {
      //   dir.directory.parentDirectoryId = workingDirectoryId;
      // }
      let tmpSubDir: ImportDirectory = {
        id: dir.directory.id,
        directoryItem: dir,
        subDirectories: new Array(),
        assessments: new Array(),
        inventories: new Array()
      };
      tmpSubDir = this.buildDir(tmpSubDir, directoryItems);
      subDirs.push(tmpSubDir);
    });
    let dirAssessments = _.filter(this.assessmentItems, (assessmentItem) => { return assessmentItem.assessment.directoryId === _directory.id; });
    let dirInventory = _.filter(this.inventoryItems, (inventory) => { return inventory.inventoryItem.directoryId == _directory.id });
    this.assessmentsAdded = this.assessmentsAdded.concat(dirAssessments);
    this.inventoriesAdded = this.inventoriesAdded.concat(dirInventory);
    _directory.subDirectories = subDirs;
    _directory.assessments = dirAssessments;
    _directory.inventories = dirInventory;
    return _directory;
  }

  async addDirectory(importDir: ImportDirectory) {
    if (importDir.directoryItem) {
      delete importDir.directoryItem.directory.id;
      let newDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(importDir.directoryItem.directory));
      let allDirectories: Directory[] = await firstValueFrom(this.directoryDbService.getAllDirectories());
      this.directoryDbService.setAll(allDirectories);

      importDir.directoryItem.settings.directoryId = newDirectory.id;
      delete importDir.directoryItem.settings.id;
      await firstValueFrom(this.settingsDbService.addWithObservable(importDir.directoryItem.settings));
      let allSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      this.settingsDbService.setAll(allSettings);

      if (importDir.directoryItem.calculator && importDir.directoryItem.calculator.length !== 0) {
        let calculator: Calculator = importDir.directoryItem.calculator[0]; 
        calculator.directoryId = newDirectory.id;
        delete calculator.id;
        await firstValueFrom(this.calculatorDbService.addWithObservable(calculator));
        let allCalculators: Calculator[] =  await firstValueFrom(this.calculatorDbService.getAllCalculators());
        this.calculatorDbService.setAll(allCalculators);
      }

      if (importDir.assessments.length > 0) {
        this.addImportDirectoryAssessments(importDir, newDirectory.id);
      }
      if (importDir.inventories.length > 0) {
        this.addImportDirectoryInventories(importDir, newDirectory.id);
      }

      importDir.subDirectories.forEach(subDir => {
        if (subDir.directoryItem.directory) {
          subDir.directoryItem.directory.parentDirectoryId = newDirectory.id;
        }
        this.addDirectory(subDir);
      });

    } else {
      importDir.subDirectories.forEach(subDir => { this.addDirectory(subDir); });
    }
  }

  async addImportDirectoryAssessments(importDir: ImportDirectory, newDirectoryId: number) {
    for (let i = 0; i < importDir.assessments.length; i++) {
      let assessmentItem: ImportExportAssessment = importDir.assessments[i];
      assessmentItem.assessment.directoryId = newDirectoryId;
      delete assessmentItem.assessment.id;
      // ***
      assessmentItem = await this.addImportedAssessmentItem(assessmentItem, newDirectoryId);
    }
    let updatedAssessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(updatedAssessments);
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    let allCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
    this.calculatorDbService.setAll(allCalculators);
  }

  async addImportedAssessmentItem(item: ImportExportAssessment, newDirectoryId: number) {
    let addedAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(item.assessment));
    item.settings.assessmentId = addedAssessment.id;
    delete item.settings.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(item.settings));
    if (item.calculator) {
      item.calculator.directoryId = newDirectoryId;
      delete item.calculator.id;
      await firstValueFrom(this.calculatorDbService.addWithObservable(item.calculator));
    }
    return item;
  }

  async addImportDirectoryInventories(importDir: ImportDirectory, newDirectoryId: number) {
    for (let i = 0; i < importDir.inventories.length; i++) {
      let inventory: ImportExportInventory = importDir.inventories[i];
      inventory.inventoryItem.selected = false;
      delete inventory.inventoryItem.id;
      inventory.inventoryItem.directoryId = newDirectoryId;

      let newInventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(inventory.inventoryItem));
      delete inventory.settings.id;
      inventory.settings.inventoryId = newInventory.id;
      await firstValueFrom(this.settingsDbService.addWithObservable(inventory.settings));
    }
    let updatedInventories: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.inventoryDbService.setAll(updatedInventories);
    this.settingsDbService.setAll(updatedSettings);
  }

  // ***
  async addAssessments(assessments: Array<ImportExportAssessment>, workingDirectoryId: number) {
    for (let i = 0; i < assessments.length; i++) {
      let assessment: ImportExportAssessment = assessments[i]; 
      delete assessment.assessment.id;
      assessment.assessment.directoryId = workingDirectoryId;

      let newAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(assessment.assessment));
      let allAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
      this.assessmentDbService.setAll(allAssessments);

      assessment.settings.assessmentId = newAssessment.id;
      delete assessment.settings.id;

      await firstValueFrom(this.settingsDbService.addWithObservable(assessment.settings));
      let allSettings: Settings[] =  await firstValueFrom(this.settingsDbService.getAllSettings());
      this.settingsDbService.setAll(allSettings);

      if (assessment.calculator) {
        assessment.calculator.assessmentId = newAssessment.id;
        delete assessment.calculator.id;
        await firstValueFrom(this.calculatorDbService.addWithObservable(assessment.calculator));
        let allCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
        this.calculatorDbService.setAll(allCalculators);
      }
    }
  }

async addInventories(inventories: Array<ImportExportInventory>, workingDirectoryId: number) {
   for (let i = 0; i < inventories.length; i++) {
     let inventory = inventories[i];
       inventory.inventoryItem.selected = false;
       delete inventory.inventoryItem.id;
       inventory.inventoryItem.directoryId = workingDirectoryId;
       let newInventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(inventory.inventoryItem));
       delete inventory.settings.id;
       inventory.settings.inventoryId = newInventory.id;
       await firstValueFrom(this.settingsDbService.addWithObservable(inventory.settings));
       
       let updatedInventories: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
       let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
       this.inventoryDbService.setAll(updatedInventories);
       this.settingsDbService.setAll(updatedSettings);
      }
  }
}


export interface ImportDirectory {
  id: number;
  directoryItem: ImportExportDirectory;
  subDirectories: Array<ImportDirectory>;
  assessments: Array<ImportExportAssessment>;
  inventories: Array<ImportExportInventory>;
}
