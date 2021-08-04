import { Injectable } from '@angular/core';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ImportExportData, ImportExportAssessment, ImportExportDirectory, ImportExportInventory } from './importExportModel';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import * as _ from 'lodash';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';

@Injectable()
export class ImportService {

  directoryItems: Array<ImportExportDirectory>;
  assessmentItems: Array<ImportExportAssessment>;
  inventoryItems: Array<ImportExportInventory>;
  addedDirIds: Array<number>;
  assessmentsAdded: Array<ImportExportAssessment>;
  inventoriesAdded: Array<ImportExportInventory>;
  constructor(private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService,
    private assessmentDbService: AssessmentDbService, private inventoryDbService: InventoryDbService) { }

  importData(data: ImportExportData, workingDirectoryId: number) {
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
      data.calculators.forEach(calc => {
        calc.selected = false;
        delete calc.id;
        calc.directoryId = workingDirectoryId;
        this.indexedDbService.addCalculator(calc).then(() => { this.calculatorDbService.setAll(); });
      });
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

  addDirectory(importDir: ImportDirectory) {
    if (importDir.directoryItem) {
      delete importDir.directoryItem.directory.id;
      this.indexedDbService.addDirectory(importDir.directoryItem.directory).then(newId => {
        this.directoryDbService.setAll();
        importDir.directoryItem.settings.directoryId = newId;
        delete importDir.directoryItem.settings.id;
        this.indexedDbService.addSettings(importDir.directoryItem.settings).then(() => {
          this.settingsDbService.setAll();
        });

        if (importDir.directoryItem.calculator) {
          if (importDir.directoryItem.calculator.length !== 0) {
            importDir.directoryItem.calculator[0].directoryId = newId;
            delete importDir.directoryItem.calculator[0].id;
            this.indexedDbService.addCalculator(importDir.directoryItem.calculator[0]).then(() => {
              this.calculatorDbService.setAll();
            });
          }
        }

        importDir.assessments.forEach(assessmentItem => {
          assessmentItem.assessment.directoryId = newId;
          delete assessmentItem.assessment.id;
          this.indexedDbService.addAssessment(assessmentItem.assessment).then(newAssessmentId => {
            this.assessmentDbService.setAll();
            assessmentItem.settings.assessmentId = newAssessmentId;
            delete assessmentItem.settings.id;
            this.indexedDbService.addSettings(assessmentItem.settings).then(() => {
              this.settingsDbService.setAll();
            });

            if (assessmentItem.calculator) {
              assessmentItem.calculator.directoryId = newId;
              delete assessmentItem.calculator.id;
              this.indexedDbService.addCalculator(assessmentItem.calculator).then(() => {
                this.calculatorDbService.setAll();
              });

            }
          });
        });

        importDir.subDirectories.forEach(subDir => {
          if (subDir.directoryItem.directory) {
            subDir.directoryItem.directory.parentDirectoryId = newId;
          }
          this.addDirectory(subDir);
        });

        importDir.inventories.forEach(inventory => {
          inventory.inventoryItem.selected = false;
          delete inventory.inventoryItem.id;
          inventory.inventoryItem.directoryId = newId;
          this.indexedDbService.addInventoryItem(inventory.inventoryItem).then(newInventoryId => {
            delete inventory.settings.id;
            inventory.settings.inventoryId = newInventoryId;
            this.indexedDbService.addSettings(inventory.settings).then(() => {
              this.settingsDbService.setAll();
              this.inventoryDbService.setAll();
            })
          })
        })

      });
    } else {
      importDir.subDirectories.forEach(subDir => { this.addDirectory(subDir); });
    }
  }


  addAssessments(assessments: Array<ImportExportAssessment>, workingDirectoryId: number) {
    assessments.forEach(assessment => {
      delete assessment.assessment.id;
      assessment.assessment.directoryId = workingDirectoryId;
      this.indexedDbService.addAssessment(assessment.assessment).then(newId => {
        this.assessmentDbService.setAll().then(() => {
          assessment.settings.assessmentId = newId;
          delete assessment.settings.id;
          this.indexedDbService.addSettings(assessment.settings).then(() => { this.settingsDbService.setAll(); });
          if (assessment.calculator) {
            assessment.calculator.assessmentId = newId;
            delete assessment.calculator.id;
            this.indexedDbService.addCalculator(assessment.calculator).then(() => { this.calculatorDbService.setAll(); });
          }
        });
      });
    });
  }

  addInventories(inventories: Array<ImportExportInventory>, workingDirectoryId: number) {
    inventories.forEach(inventory => {
      inventory.inventoryItem.selected = false;
      delete inventory.inventoryItem.id;
      inventory.inventoryItem.directoryId = workingDirectoryId;
      this.indexedDbService.addInventoryItem(inventory.inventoryItem).then(newInventoryId => {
        delete inventory.settings.id;
        inventory.settings.inventoryId = newInventoryId;
        this.indexedDbService.addSettings(inventory.settings).then(() => {
          this.settingsDbService.setAll();
          this.inventoryDbService.setAll();
        })
      })
    })
  }
}


export interface ImportDirectory {
  id: number;
  directoryItem: ImportExportDirectory;
  subDirectories: Array<ImportDirectory>;
  assessments: Array<ImportExportAssessment>;
  inventories: Array<ImportExportInventory>;
}
