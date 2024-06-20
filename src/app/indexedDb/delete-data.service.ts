import { Injectable } from '@angular/core';
 
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
import { PsatIntegrationService } from '../shared/connected-inventory/psat-integration.service';
import { Diagram } from '../shared/models/app';
import { DiagramIdbService } from './diagram-idb.service';
@Injectable()
export class DeleteDataService {

  constructor(   private calculatorDbService: CalculatorDbService, 
    private psatIntegrationService: PsatIntegrationService, 
    private diagramIdbService: DiagramIdbService,
    private assessmentDbService: AssessmentDbService, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService,
    private inventoryDbService: InventoryDbService) { }

  async deleteDirectory(directory: Directory, isWorkingDir?: boolean) {
    let assessments: Array<Assessment> =  [];
    let inventories: Array<InventoryItem> = [];
    let diagrams: Array<Diagram> = [];
    if (!isWorkingDir) {
      assessments = this.assessmentDbService.getByDirectoryId(directory.id);
      inventories = this.inventoryDbService.getByDirectoryId(directory.id);
      diagrams = this.diagramIdbService.getByDirectoryId(directory.id);
    } else {
      if (directory.assessments) {
        assessments = _.filter(directory.assessments, (assessment) => { return assessment.selected === true; });
      }
      if (directory.inventories) {
        inventories = _.filter(directory.inventories, (inventory) => { return inventory.selected === true; });
      }
      if (directory.diagrams) {
        diagrams = _.filter(directory.diagrams, (diagram) => { return diagram.selected === true; });
      }
    }

    if (assessments.length !== 0) {
      for (let i = 0; i < assessments.length; i++) {
        await this.deleteAssessment(assessments[i]);
      }
    }

    if(inventories.length !== 0){
      for (let i = 0; i < inventories.length; i++) {
        await this.deleteInventory(inventories[i])
      }
    }

    if(diagrams.length !== 0){
      for (let i = 0; i < diagrams.length; i++) {
        await this.deleteDiagram(diagrams[i])
      }
    }

    if (!isWorkingDir) {
      let dirSettings: Settings = this.settingsDbService.getByDirectoryId(directory.id);
      if (dirSettings) {
        let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(dirSettings.id))
        await this.settingsDbService.setAll(updatedSettings);
      }
      let calculators: Array<Calculator> = this.calculatorDbService.getByDirectoryId(directory.id);
      if (calculators) {
        let updatedCalculators: Calculator[];
        for (let i = 0; i < calculators.length; i++) {
          updatedCalculators = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(calculators[i].id)); 
        };
        await this.calculatorDbService.setAll(updatedCalculators); 
      }
      let updatedDirectories: Directory[] = await firstValueFrom(this.directoryDbService.deleteByIdWithObservable(directory.id));
      await this.directoryDbService.setAll(updatedDirectories);
    } else if (directory.calculators && directory.calculators.length !== 0) {
      let updatedCalculators: Calculator[];
      for (let i = 0; i < directory.calculators.length; i++){
        if (directory.calculators[i].id && directory.calculators[i].selected) {
          updatedCalculators = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(directory.calculators[i].id));  
        }
      };
      this.calculatorDbService.setAll(updatedCalculators);
    }

    let subDirectories: Array<Directory> = [];
    if (!isWorkingDir) {
      subDirectories = this.directoryDbService.getSubDirectoriesById(directory.id);
    } else {
      subDirectories = _.filter(directory.subDirectory, (dir) => { return dir.selected === true; });
    }
    if (subDirectories.length !== 0) {
      for (let i = 0; i < subDirectories.length; i++) {
        await this.deleteDirectory(subDirectories[i]);
      }
    }
  }

  async deleteAssessment(assessment: Assessment) {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    if (settings && settings.assessmentId === assessment.id) {
      let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(settings.id))
      this.settingsDbService.setAll(updatedSettings);
    }
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    if (calculator) {
      let calculators: Calculator[] = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(calculator.id)); 
      this.calculatorDbService.setAll(calculators); 
    }

    this.deleteConnectedInventoryItem(assessment);
    let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(assessment.id));
    this.assessmentDbService.setAll(updatedAssessments);
  }

  deleteConnectedInventoryItem(assessment: Assessment) {
    if (assessment.psat && assessment.psat.connectedItem) {
      this.psatIntegrationService.removeConnectedPumpInventory(assessment.psat.connectedItem, assessment.id);
    }
  }

  async deleteInventory(inventory: InventoryItem){
    let settings: Settings = this.settingsDbService.getByInventoryId(inventory);
    if (settings && settings.inventoryId === inventory.id) {
      let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(settings.id));
      this.settingsDbService.setAll(updatedSettings);
    }
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.deleteByIdWithObservable(inventory.id));
    this.inventoryDbService.setAll(updatedInventoryItems);
  }

  async deleteDiagram(diagram: Diagram){
    let settings: Settings = this.settingsDbService.getByDiagramId(diagram);
    if (settings && settings.diagramId === diagram.id) {
      let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(settings.id));
      this.settingsDbService.setAll(updatedSettings);
    }
    let updatedDiagrams: Diagram[] = await firstValueFrom(this.diagramIdbService.deleteByIdWithObservable(diagram.id));
    this.diagramIdbService.setAll(updatedDiagrams);
  }

}
