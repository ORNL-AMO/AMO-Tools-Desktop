import { Component, OnInit } from '@angular/core';
import { MotorItem, MotorInventoryData } from '../../motor-inventory';
import { Settings } from '../../../shared/models/settings';
import { ReplaceExistingData, ReplaceExistingResults } from '../../../shared/models/calculators';
import { MotorInventoryService } from '../../motor-inventory.service';
import { ReplaceExistingService } from '../../../calculator/motors/replace-existing/replace-existing.service';
import { Subscription } from 'rxjs';
import { BatchAnalysisService, BatchAnalysisSettings } from '../batch-analysis.service';

@Component({
  selector: 'app-batch-analysis-table',
  templateUrl: './batch-analysis-table.component.html',
  styleUrls: ['./batch-analysis-table.component.css']
})
export class BatchAnalysisTableComponent implements OnInit {

  batchAnalysisDataItems: Array<BatchAnalysisResults>;
  filterInventorySub: Subscription;
  sortByField: string = 'motorName';
  sortByDirection: string = 'desc';
  batchAnalysisSettings: BatchAnalysisSettings;
  batchAnalysisSettingsSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private replaceExistingervice: ReplaceExistingService, private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
    this.batchAnalysisSettingsSub = this.batchAnalysisService.batchAnalysisSettings.subscribe(val => {
      this.batchAnalysisSettings = val;
      this.updateReplaceMotorDecision();
    });


    this.filterInventorySub = this.motorInventoryService.filterInventorySummary.subscribe(filterData => {
      this.batchAnalysisDataItems = new Array();
      let inventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
      let motorInventoryData: MotorInventoryData = this.motorInventoryService.filterMotorInventoryData(inventoryData, filterData);
      motorInventoryData.departments.forEach(department => {
        department.catalog.forEach(motorItem => {
          let settings: Settings = this.motorInventoryService.settings.getValue();
          let replaceExistingData: ReplaceExistingData = this.getReplaceExistingInputsFromMotorItem(motorItem, settings);
          let missingData: Array<string> = this.checkBatchAnalysisDataValid(replaceExistingData);
          if (missingData.length != 0) {
            let batchAnalysisResults: BatchAnalysisResults = this.getBatchAnalysisResultObject(motorItem, department.name, undefined, missingData);
            this.batchAnalysisDataItems.push(batchAnalysisResults);
          } else {
            let replaceExistingResults: ReplaceExistingResults = this.replaceExistingervice.getResults(replaceExistingData, settings);
            let batchAnalysisResults: BatchAnalysisResults = this.getBatchAnalysisResultObject(motorItem, department.name, replaceExistingResults);
            this.batchAnalysisDataItems.push(batchAnalysisResults);
          }
        });
      });
    });
  }

  ngOnDestroy() {
    this.filterInventorySub.unsubscribe();
    this.batchAnalysisSettingsSub.unsubscribe();
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
    let data: ReplaceExistingData = {
      operatingHours: motorItem.operationData.annualOperatingHours,
      motorSize: motorItem.nameplateData.ratedMotorPower,
      existingEfficiency: motorItem.operationData.efficiencyAtAverageLoad,
      load: motorItem.operationData.averageLoadFactor,
      electricityCost: settings.electricityCost,
      newEfficiency: motorItem.batchAnalysisData.modifiedEfficiency,
      purchaseCost: motorItem.batchAnalysisData.modifiedCost,
      rewindEfficiencyLoss: motorItem.batchAnalysisData.rewindEfficiencyLoss,
      rewindCost: motorItem.batchAnalysisData.rewindCost
    }
    return data;
  }

  getBatchAnalysisResultObject(motorItem: MotorItem, departmentName: string, replaceExistingResults: ReplaceExistingResults, missingData?: Array<string>): BatchAnalysisResults {
    if (missingData) {
      return {
        motorName: motorItem.name,
        departmentName: departmentName,
        operatingHours: motorItem.operationData.annualOperatingHours,
        motorSize: motorItem.nameplateData.ratedMotorPower,
        averageLoadFactor: motorItem.operationData.averageLoadFactor,
        currentEfficiency: motorItem.operationData.efficiencyAtAverageLoad,
        rewindEfficiencyLoss: motorItem.batchAnalysisData.rewindEfficiencyLoss,
        rewindCost: motorItem.batchAnalysisData.rewindCost,
        replacementEfficiency: motorItem.batchAnalysisData.modifiedEfficiency,
        replacementPurchaseCost: motorItem.batchAnalysisData.modifiedCost,
        isBatchAnalysisValid: false,
        missingData: missingData,
        currentEnergyUse: undefined,
        currentEnergyCost: undefined,
        rewindEnergyUse: undefined,
        rewindEnergyCost: undefined,
        replacementEnergyUse: undefined,
        replacementEnergyCost: undefined,
        replacementNowPayback: undefined,
        replacementFailPayback: undefined,
        replaceMotor: undefined
      }
    } else {
      let replaceNowDecision: string;
      if (this.batchAnalysisSettings) {
        if (this.batchAnalysisSettings.paybackThreshold > replaceExistingResults.simplePayback) {
          replaceNowDecision = 'Replace';
        } else if (this.batchAnalysisSettings.paybackThreshold > replaceExistingResults.incrementalSimplePayback) {
          replaceNowDecision = 'Replace When Fail';
        } else {
          replaceNowDecision = 'Rewind';
        }
      }
      return {
        motorName: motorItem.name,
        departmentName: departmentName,
        operatingHours: motorItem.operationData.annualOperatingHours,
        motorSize: motorItem.nameplateData.ratedMotorPower,
        averageLoadFactor: motorItem.operationData.averageLoadFactor,
        currentEfficiency: motorItem.operationData.efficiencyAtAverageLoad,
        rewindEfficiencyLoss: motorItem.batchAnalysisData.rewindEfficiencyLoss,
        rewindCost: motorItem.batchAnalysisData.rewindCost,
        replacementEfficiency: motorItem.batchAnalysisData.modifiedEfficiency,
        replacementPurchaseCost: motorItem.batchAnalysisData.modifiedCost,
        isBatchAnalysisValid: true,
        currentEnergyUse: this.checkInfinity(replaceExistingResults.existingEnergyUse),
        currentEnergyCost: this.checkInfinity(replaceExistingResults.existingEnergyCost),
        rewindEnergyUse: this.checkInfinity(replaceExistingResults.rewoundEnergyUse),
        rewindEnergyCost: this.checkInfinity(replaceExistingResults.rewoundEnergyCost),
        replacementEnergyUse: this.checkInfinity(replaceExistingResults.newEnergyUse),
        replacementEnergyCost: this.checkInfinity(replaceExistingResults.newEnergyCost),
        replacementNowPayback: this.checkInfinity(replaceExistingResults.simplePayback),
        replacementFailPayback: this.checkInfinity(replaceExistingResults.incrementalSimplePayback),
        replaceMotor: replaceNowDecision
      }
    }
  }


  updateReplaceMotorDecision() {
    if (this.batchAnalysisDataItems && this.batchAnalysisSettings) {
      this.batchAnalysisDataItems.forEach(dataItem => {
        if (dataItem.isBatchAnalysisValid) {
          (this.batchAnalysisSettings.paybackThreshold > dataItem.replacementNowPayback)
          if (this.batchAnalysisSettings.paybackThreshold > dataItem.replacementNowPayback) {
            dataItem.replaceMotor = 'Replace';
          } else if (this.batchAnalysisSettings.paybackThreshold > dataItem.replacementFailPayback) {
            dataItem.replaceMotor = 'Replace When Fail';
          } else {
            dataItem.replaceMotor = 'Rewind';
          }
        }
      });
    }
  }

  checkInfinity(val: number): number {
    if (val == Infinity) {
      return undefined;
    } else {
      return val;
    }
  }

  setSortByField(str: string) {
    if (this.sortByField == str) {
      if (this.sortByDirection == 'desc') {
        this.sortByDirection = 'asc';
      } else {
        this.sortByDirection = 'desc';
      }
    }
    this.sortByField = str;
  }

}


export interface BatchAnalysisResults {
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
  currentEnergyCost: number,
  rewindEnergyUse: number,
  rewindEnergyCost: number,
  replacementEnergyUse: number,
  replacementEnergyCost: number,
  replacementNowPayback: number,
  replacementFailPayback: number,
  replaceMotor: string

}