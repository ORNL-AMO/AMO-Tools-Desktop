import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../motor-inventory.service';
import { MotorInventoryData, MotorItem } from '../motor-inventory';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingResults, ReplaceExistingData } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-batch-analysis',
  templateUrl: './batch-analysis.component.html',
  styleUrls: ['./batch-analysis.component.css']
})
export class BatchAnalysisComponent implements OnInit {

  batchAnalysisDataItems: Array<BatchAnalysisResults>;
  constructor(private motorInventoryService: MotorInventoryService, private replaceExistingervice: ReplaceExistingService) { }

  ngOnInit(): void {
    this.batchAnalysisDataItems = new Array();
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
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

      })
    });
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
        replacementFailPayback: undefined
      }

    } else {
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
        currentEnergyUse: replaceExistingResults.existingEnergyUse,
        currentEnergyCost: replaceExistingResults.existingEnergyCost,
        rewindEnergyUse: replaceExistingResults.rewoundEnergyUse,
        rewindEnergyCost: replaceExistingResults.rewoundEnergyCost,
        replacementEnergyUse: replaceExistingResults.newEnergyUse,
        replacementEnergyCost: replaceExistingResults.newEnergyCost,
        replacementNowPayback: replaceExistingResults.simplePayback,
        replacementFailPayback: replaceExistingResults.incrementalSimplePayback
      }
    }

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
  replacementFailPayback: number

}