import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { CalculatorDbService } from './calculator-db.service';
import { AssessmentDbService } from './assessment-db.service';
import { DirectoryDbService } from './directory-db.service';
import { SettingsDbService } from './settings-db.service';
import { Directory } from '../shared/models/directory';
import { Assessment } from '../shared/models/assessment';
import * as _ from 'lodash';
import { Settings } from '../shared/models/settings';
import { Calculator } from '../shared/models/calculators';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { InventoryDbService } from './inventory-db.service';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class DeleteDataService {

  constructor(private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService, private assessmentDbService: AssessmentDbService, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService,
    private inventoryDbService: InventoryDbService) { }

  async deleteDirectory(directory: Directory, isWorkingDir?: boolean) {
    let assessments: Array<Assessment>;
    let inventories: Array<InventoryItem>;
    if (!isWorkingDir) {
      assessments = this.assessmentDbService.getByDirectoryId(directory.id);
      inventories = this.inventoryDbService.getByDirectoryId(directory.id);
    } else {
      if (directory.assessments) {
        assessments = _.filter(directory.assessments, (assessment) => { return assessment.selected === true; });
      }
      if (directory.inventories) {
        inventories = _.filter(directory.inventories, (inventory) => { return inventory.selected === true; });
      }
    }
    if (assessments) {
      assessments.forEach(assessment => {
        this.deleteAssessment(assessment);
      });
    }

    if(inventories){
      inventories.forEach(inventory => {
        this.deleteInventory(inventory)
      })
    }

    if (!isWorkingDir) {
      let dirSettings: Settings = this.settingsDbService.getByDirectoryId(directory.id);
      if (dirSettings) {
        this.indexedDbService.deleteSettings(dirSettings.id).then(() => {
          this.settingsDbService.setAll();
        });
      }
      let calculators: Array<Calculator> = this.calculatorDbService.getByDirectoryId(directory.id);
      if (calculators) {
        let updatedCalculators: Calculator[];
        for (let i = 0; i < calculators.length; i++) {
          updatedCalculators = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(calculators[i].id)); 
        };
        this.calculatorDbService.setAll(updatedCalculators); 
      }
      this.indexedDbService.deleteDirectory(directory.id).then(() => {
        this.directoryDbService.setAll();
      });
    } else if (directory.calculators && directory.calculators.length !== 0) {
      let updatedCalculators: Calculator[];
      for (let i = 0; i < directory.calculators.length; i++){
        if (directory.calculators[i].id && directory.calculators[i].selected) {
          updatedCalculators = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(directory.calculators[i].id));  
        }
      };
      this.calculatorDbService.setAll(updatedCalculators);
    }

    let subDirectories: Array<Directory>;
    if (!isWorkingDir) {
      subDirectories = this.directoryDbService.getSubDirectoriesById(directory.id);
    } else {
      subDirectories = _.filter(directory.subDirectory, (dir) => { return dir.selected === true; });
    }
    if (subDirectories) {
      subDirectories.forEach(dir => {
        this.deleteDirectory(dir);
      });
    }
  }

  async deleteAssessment(assessment: Assessment) {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    if (settings && settings.assessmentId === assessment.id) {
      this.indexedDbService.deleteSettings(settings.id).then(() => {
        this.settingsDbService.setAll();
      });
    }
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    if (calculator) {
      let calculators: Calculator[] = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(calculator.id)); 
      this.calculatorDbService.setAll(calculators); 
    }
    let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(assessment.id));
    this.assessmentDbService.setAll(updatedAssessments);
  }

  deleteInventory(inventory: InventoryItem){
    let settings: Settings = this.settingsDbService.getByInventoryId(inventory);
    if (settings && settings.inventoryId === inventory.id) {
      this.indexedDbService.deleteSettings(settings.id).then(() => {
        this.settingsDbService.setAll();
      });
    }
    this.indexedDbService.deleteInventoryItem(inventory.id).then(() => {
      this.inventoryDbService.setAll();
    })
  }

}
