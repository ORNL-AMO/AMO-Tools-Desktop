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
  addedDirIds: Array<number>;
  // get new import directory id from old
  importDirectoryIdMap: { [oldId: number]: number };
  // assessments not exported from a select all dir, or sub dir
  nonDirectoryAssessments: Array<ImportExportAssessment>;
  nonDirectoryInventories: Array<ImportExportInventory>;
  constructor(private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService,
    private assessmentDbService: AssessmentDbService, private inventoryDbService: InventoryDbService) { }

  async importData(exportedData: ImportExportData, workingDirectoryId: number) {
    this.addedDirIds = new Array<number>();
    this.importDirectoryIdMap = {};
    this.nonDirectoryAssessments = new Array<ImportExportAssessment>();
    this.nonDirectoryInventories = new Array<ImportExportInventory>();
    exportedData.assessments.map(item => item.assessment.selected = false);
    exportedData.inventories.map(item => item.inventoryItem.selected = false);
    exportedData.calculators.map(item => item.selected = false);
    exportedData.directories.map(item => item.directory.selected = false);

    if (exportedData.directories.length !== 0) {
      // This is the wrapping directory for all exported data (i.e. the current working dir items were exported from)
      let newImportDirectory: ImportDirectory = {
        //set id as parentDirDirectoryId of first directory
        id: exportedData.directories[0].directory.parentDirectoryId,
        directoryItem: undefined,
        assessments: new Array(),
        subDirectories: new Array(),
        inventories: new Array()
      };
      newImportDirectory = this.buildDir(newImportDirectory, exportedData);
      newImportDirectory.subDirectories.forEach(dir => {
        dir.directoryItem.directory.parentDirectoryId = workingDirectoryId;
      })
      await this.addDirectory(newImportDirectory);
      await this.addAssessments(this.nonDirectoryAssessments, workingDirectoryId);
      await this.addInventories(this.nonDirectoryInventories, workingDirectoryId);

    } else {
      if (exportedData.assessments && exportedData.assessments.length !== 0) {
        await this.addAssessments(exportedData.assessments, workingDirectoryId);
      }
      if (exportedData.inventories && exportedData.inventories.length !== 0) {
        await this.addInventories(exportedData.inventories, workingDirectoryId);
      }
    }

    if (exportedData.calculators && exportedData.calculators.length > 0) {
      let updatedCalculators: Calculator[];
      for await (let calculator of exportedData.calculators) {
        calculator.selected = false;
        delete calculator.id;
        // Use new Dir id if from selected import/export dir
        let fromImportDirectoryId: number = this.importDirectoryIdMap[calculator.directoryId];
        if (fromImportDirectoryId) {
          calculator.directoryId = fromImportDirectoryId;
        } else {
          calculator.directoryId = workingDirectoryId;
        }
        await firstValueFrom(this.calculatorDbService.addWithObservable(calculator));
      };
      updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.calculatorDbService.setAll(updatedCalculators);
    }
  }

  buildDir(newImportDirectory: ImportDirectory, exportedData: ImportExportData): ImportDirectory {
    let hasBeenAdded = _.find(this.addedDirIds, (id) => { return id === newImportDirectory.id; });
    if (hasBeenAdded) {
      return newImportDirectory;
    } else {
      this.addedDirIds.push(newImportDirectory.id);
    }
    let exportedDirectories: Array<ImportExportDirectory> = _.filter(exportedData.directories, (dir) => { return dir.directory.parentDirectoryId === newImportDirectory.id; });

    let subDirs: Array<ImportDirectory> = new Array<ImportDirectory>();
    exportedDirectories.forEach(dir => {
      let subDir: ImportDirectory = {
        id: dir.directory.id,
        directoryItem: dir,
        subDirectories: new Array(),
        assessments: new Array(),
        inventories: new Array()
      };
      subDir = this.buildDir(subDir, exportedData);
      subDirs.push(subDir);
    });
    let dirAssessments = _.filter(exportedData.assessments, (assessmentItem) => { return assessmentItem.assessment.directoryId === newImportDirectory.id; });
    let dirInventory = _.filter(exportedData.inventories, (inventory) => { return inventory.inventoryItem.directoryId == newImportDirectory.id });

    if (!newImportDirectory.directoryItem) {
      this.nonDirectoryAssessments = dirAssessments;
      this.nonDirectoryInventories = dirInventory;
    }
    newImportDirectory.assessments = dirAssessments;
    newImportDirectory.inventories = dirInventory;
    newImportDirectory.subDirectories = subDirs;
    return newImportDirectory;
  }

  async addDirectory(importDir: ImportDirectory) {
    if (importDir.directoryItem) {
      let oldDirectoryId: number = importDir.directoryItem.directory.id;
      delete importDir.directoryItem.directory.id;
      let newDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(importDir.directoryItem.directory));
      this.importDirectoryIdMap[oldDirectoryId] = newDirectory.id;
      let allDirectories: Directory[] = await firstValueFrom(this.directoryDbService.getAllDirectories());
      this.directoryDbService.setAll(allDirectories);

      importDir.directoryItem.settings.directoryId = newDirectory.id;
      delete importDir.directoryItem.settings.id;
      await firstValueFrom(this.settingsDbService.addWithObservable(importDir.directoryItem.settings));
      let allSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      this.settingsDbService.setAll(allSettings);

      if (importDir.assessments.length > 0) {
        await this.addImportDirectoryAssessments(importDir, newDirectory.id);
      }
      if (importDir.inventories.length > 0) {
        await this.addImportDirectoryInventories(importDir, newDirectory.id);
      }

      for await (let subDir of importDir.subDirectories) {
        if (subDir.directoryItem.directory) {
          subDir.directoryItem.directory.parentDirectoryId = newDirectory.id;
        }
        await this.addDirectory(subDir);
      }

    } else {
      for await (let subDir of importDir.subDirectories) {
        await this.addDirectory(subDir);
      }
    }
  }

  async addImportDirectoryAssessments(importDir: ImportDirectory, newDirectoryId: number) {
    for await (const item of importDir.assessments) {
      item.assessment.directoryId = newDirectoryId;
      delete item.assessment.id;
      let addedAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(item.assessment));
      item.settings.assessmentId = addedAssessment.id;
      delete item.settings.id;
      await firstValueFrom(this.settingsDbService.addWithObservable(item.settings));
      if (item.calculator) {
        item.calculator.directoryId = newDirectoryId;
        delete item.calculator.id;
        await firstValueFrom(this.calculatorDbService.addWithObservable(item.calculator));
      }
    }

    let updatedAssessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(updatedAssessments);
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    let allCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
    this.calculatorDbService.setAll(allCalculators);

  }

  async addImportDirectoryInventories(importDir: ImportDirectory, newDirectoryId: number) {
    for await (const inventory of importDir.inventories) {
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

  async addAssessments(assessments: Array<ImportExportAssessment>, workingDirectoryId: number) {
    for await (let assessment of assessments) {
      delete assessment.assessment.id;
      assessment.assessment.directoryId = workingDirectoryId;

      let newAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(assessment.assessment));
      if (assessment.calculator) {
        assessment.calculator.assessmentId = newAssessment.id;
        delete assessment.calculator.id;
        await firstValueFrom(this.calculatorDbService.addWithObservable(assessment.calculator));
        let allCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
        this.calculatorDbService.setAll(allCalculators);
      }

      let allAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
      this.assessmentDbService.setAll(allAssessments);

      assessment.settings.assessmentId = newAssessment.id;
      delete assessment.settings.id;

      await firstValueFrom(this.settingsDbService.addWithObservable(assessment.settings));
      let allSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
      this.settingsDbService.setAll(allSettings);
    }
  }

  async addInventories(inventories: Array<ImportExportInventory>, workingDirectoryId: number) {
    for await (const inventory of inventories) {
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
