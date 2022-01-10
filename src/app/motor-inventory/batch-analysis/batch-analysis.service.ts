import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MotorInventoryService } from '../motor-inventory.service';
import { MotorInventoryData, FilterInventorySummary, MotorItem } from '../motor-inventory';
import { Settings } from '../../shared/models/settings';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingData, ReplaceExistingResults } from '../../shared/models/calculators';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';

@Injectable()
export class BatchAnalysisService {

  selectedTab: BehaviorSubject<string>;
  batchAnalysisSettings: BehaviorSubject<BatchAnalysisSettings>;
  batchAnalysisDataItems: BehaviorSubject<Array<BatchAnalysisResults>>;
  constructor(private motorInventoryService: MotorInventoryService, private replaceExistingService: ReplaceExistingService) {
    this.selectedTab = new BehaviorSubject<string>('table');
    this.batchAnalysisSettings = new BehaviorSubject<BatchAnalysisSettings>({ displayIncompleteMotors: true, paybackThreshold: 2 });
    this.batchAnalysisDataItems = new BehaviorSubject<Array<BatchAnalysisResults>>(new Array());
  }

  setBatchAnalysisDataItems() {
    let inventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
    let filterData: FilterInventorySummary = this.motorInventoryService.filterInventorySummary.value;
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.filterMotorInventoryData(inventoryData, filterData);
    let settings: Settings = this.motorInventoryService.settings.getValue();
    let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisSettings.getValue();
    let batchAnalysisDataItems = this.getBatchAnalysisDataItems(motorInventoryData, settings, batchAnalysisSettings);
    this.batchAnalysisDataItems.next(batchAnalysisDataItems);
  }

  getBatchAnalysisDataItems(motorInventoryData: MotorInventoryData, settings: Settings, batchAnalysisSettings: BatchAnalysisSettings): Array<BatchAnalysisResults> {
    let batchAnalysisDataItems = new Array();
    motorInventoryData.departments.forEach(department => {
      department.catalog.forEach(motorItem => {
        let dataAndResults: { data: ReplaceExistingData, results: ReplaceExistingResults } = this.getDataAndResultsFromMotorItem(motorItem, settings);
        let missingData: Array<string> = this.checkBatchAnalysisDataValid(dataAndResults.data);
        let batchAnalysisResults: BatchAnalysisResults = this.getBatchAnalysisResultObject(motorItem, department.name, dataAndResults.results, batchAnalysisSettings, missingData);
        batchAnalysisDataItems.push(batchAnalysisResults);
      });
    });
    return batchAnalysisDataItems;
  }

  getDataAndResultsFromMotorItem(motorItem: MotorItem, settings: Settings): { data: ReplaceExistingData, results: ReplaceExistingResults } {
    let replaceExistingData: ReplaceExistingData = this.getReplaceExistingInputsFromMotorItem(motorItem, settings);
    let co2SavingsData: Co2SavingsData = this.motorInventoryService.motorInventoryData.getValue().co2SavingsData;
    let replaceExistingResults: ReplaceExistingResults = this.replaceExistingService.getResults(replaceExistingData, settings, co2SavingsData);
    return { data: replaceExistingData, results: replaceExistingResults };
  }

  checkBatchAnalysisDataValid(data: ReplaceExistingData): Array<string> {
    let missingData: Array<string> = new Array();
    if (!data.operatingHours) {
      missingData.push('Operating Hours')
    }
    if (!data.motorSize) {
      missingData.push(' Rated Motor Power')
    }
    if (!data.existingEfficiency) {
      missingData.push(' Efficiency at Average Load')
    }
    if (!data.load) {
      missingData.push(' Average Load Factor')
    }
    if (!data.electricityCost) {
      missingData.push(' Electricity Cost')
    }
    if (!data.newEfficiency) {
      missingData.push(' Replacement Efficiency')
    }
    if (!data.purchaseCost) {
      missingData.push(' Replacement Cost')
    }
    if (!data.rewindEfficiencyLoss) {
      missingData.push(' Rewind Efficiency Loss')
    }
    if (!data.rewindCost) {
      missingData.push(' Rewind Cost')
    }
    return missingData
  }

  getReplaceExistingInputsFromMotorItem(motorItem: MotorItem, settings: Settings): ReplaceExistingData {
    let operatingHours: number;
    if (motorItem.operationData.utilizationFactor) {
      operatingHours = motorItem.operationData.annualOperatingHours * (motorItem.operationData.utilizationFactor / 100);
    } else {
      operatingHours = motorItem.operationData.annualOperatingHours;
    }
    let data: ReplaceExistingData = {
      operatingHours: operatingHours,
      motorSize: motorItem.nameplateData.ratedMotorPower,
      existingEfficiency: motorItem.operationData.efficiencyAtAverageLoad,
      load: motorItem.operationData.averageLoadFactor,
      electricityCost: settings.electricityCost,
      newEfficiency: motorItem.batchAnalysisData.modifiedEfficiency,
      purchaseCost: motorItem.batchAnalysisData.modifiedCost,
      rewindEfficiencyLoss: motorItem.batchAnalysisData.rewindEfficiencyLoss,
      rewindCost: motorItem.batchAnalysisData.rewindCost,
    }
    return data;
  }

  getBatchAnalysisResultObject(motorItem: MotorItem, departmentName: string, replaceExistingResults: ReplaceExistingResults, batchAnalysisSettings: BatchAnalysisSettings, missingData?: Array<string>): BatchAnalysisResults {
    let replaceNowDecision: string;
    if (batchAnalysisSettings && missingData.length == 0) {
      if (batchAnalysisSettings.paybackThreshold > replaceExistingResults.simplePayback) {
        replaceNowDecision = 'Replace Now';
      } else if (batchAnalysisSettings.paybackThreshold > replaceExistingResults.incrementalSimplePayback) {
        replaceNowDecision = 'Replace When Fail';
      } else {
        replaceNowDecision = 'Rewind When Fail';
      }
    }
    let operatingHours: number;
    if (motorItem.operationData.utilizationFactor) {
      operatingHours = motorItem.operationData.annualOperatingHours * (motorItem.operationData.utilizationFactor / 100);
    } else {
      operatingHours = motorItem.operationData.annualOperatingHours;
    }
    return {
      motorItem: motorItem,
      departmentId: motorItem.departmentId,
      motorName: motorItem.name,
      departmentName: departmentName,
      operatingHours: operatingHours,
      motorSize: motorItem.nameplateData.ratedMotorPower,
      averageLoadFactor: motorItem.operationData.averageLoadFactor,
      currentEfficiency: motorItem.operationData.efficiencyAtAverageLoad,
      rewindEfficiencyLoss: motorItem.batchAnalysisData.rewindEfficiencyLoss,
      rewindCost: motorItem.batchAnalysisData.rewindCost,
      replacementEfficiency: motorItem.batchAnalysisData.modifiedEfficiency,
      replacementPurchaseCost: motorItem.batchAnalysisData.modifiedCost,
      isBatchAnalysisValid: missingData.length == 0,
      missingData: missingData,
      currentEnergyUse: this.checkInfinity(replaceExistingResults.existingEnergyUse),
      currentEmissionOutput: this.checkInfinity(replaceExistingResults.existingEmissionOutput),
      currentEnergyCost: this.checkInfinity(replaceExistingResults.existingEnergyCost),
      rewindEnergyUse: this.checkInfinity(replaceExistingResults.rewoundEnergyUse),
      rewindEmissionOutput: this.checkInfinity(replaceExistingResults.rewoundEmissionOutput),
      rewindEnergyCost: this.checkInfinity(replaceExistingResults.rewoundEnergyCost),
      replacementEnergyUse: this.checkInfinity(replaceExistingResults.newEnergyUse),
      replacementEmissionOutput: this.checkInfinity(replaceExistingResults.newEmissionOutput),
      replacementEnergyCost: this.checkInfinity(replaceExistingResults.newEnergyCost),
      replacementNowPayback: this.checkInfinity(replaceExistingResults.simplePayback),
      replacementFailPayback: this.checkInfinity(replaceExistingResults.incrementalSimplePayback),
      replaceMotor: replaceNowDecision
    }
  }


  updateReplaceMotorDecision() {
    let batchAnalysisDataItems: Array<BatchAnalysisResults> = this.batchAnalysisDataItems.getValue();
    let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisSettings.getValue();
    if (batchAnalysisDataItems && batchAnalysisSettings) {
      batchAnalysisDataItems.forEach(dataItem => {
        if (dataItem.isBatchAnalysisValid) {
          (batchAnalysisSettings.paybackThreshold > dataItem.replacementNowPayback)
          if (batchAnalysisSettings.paybackThreshold > dataItem.replacementNowPayback) {
            dataItem.replaceMotor = 'Replace Now';
          } else if (batchAnalysisSettings.paybackThreshold > dataItem.replacementFailPayback) {
            dataItem.replaceMotor = 'Replace When Fail';
          } else {
            dataItem.replaceMotor = 'Rewind When Fail';
          }
        }
      });
    }
    this.batchAnalysisDataItems.next(batchAnalysisDataItems);
  }

  checkInfinity(val: number): number {
    if (val == Infinity) {
      return undefined;
    } else {
      return val;
    }
  }
}

export interface BatchAnalysisSettings {
  displayIncompleteMotors: boolean;
  paybackThreshold: number
}

export interface BatchAnalysisResults {
  motorItem: MotorItem,
  departmentId: string,
  motorName: string,
  departmentName: string,
  operatingHours: number,
  motorSize: number,
  averageLoadFactor: number,
  currentEfficiency: number,
  rewindEfficiencyLoss: number,
  rewindCost: number,
  replacementEfficiency: number,
  replacementPurchaseCost: number,
  isBatchAnalysisValid: boolean,
  missingData?: Array<string>,
  currentEnergyUse: number,
  currentEmissionOutput: number
  currentEnergyCost: number,
  rewindEnergyUse: number,
  rewindEmissionOutput: number,
  rewindEnergyCost: number,
  replacementEnergyUse: number,
  replacementEmissionOutput: number,
  replacementEnergyCost: number,
  replacementNowPayback: number,
  replacementFailPayback: number,
  replaceMotor: string

}