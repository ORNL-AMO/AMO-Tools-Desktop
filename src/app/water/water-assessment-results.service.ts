import { Injectable } from '@angular/core';
import { WaterAssessment, SystemBalanceResults, WaterSystemResults, WaterSystemTypeEnum, WaterUsingSystem, WaterBalanceResults } from '../shared/models/water-assessment';
import { WaterSuiteApiService } from '../tools-suite-api/water-suite-api.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { Settings } from '../shared/models/settings';
import { calculateBoilerWaterResults, calculateCoolingTowerResults, calculateKitchenRestroomResults, calculateLandscapingResults, calculateProcessUseResults } from '../../process-flow-types/shared-process-flow-logic';

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentResultsService {

  // waterAssessmentResults: BehaviorSubject<WaterAssessmentResults>;
  constructor(private waterSuiteApiService: WaterSuiteApiService, 
    private convertWaterAssessmentService: ConvertWaterAssessmentService) { 
    // this.waterAssessmentResults = new BehaviorSubject<WaterAssessmentResults>(undefined);
  }

  getWaterSystemResults(waterSystem: WaterUsingSystem, waterAssessment: WaterAssessment, settings: Settings): WaterSystemResults {
    let waterSystemResults: WaterSystemResults = {
      grossWaterUse: undefined,
      processUseResults: undefined,
      coolingTowerResults: undefined,
      boilerWaterResults: undefined,
      kitchenRestroomResults: undefined,
      landscapingResults: undefined,
      motorEnergyResults: []
    }

    if (waterSystem.systemType === WaterSystemTypeEnum.PROCESS && waterSystem.processUse) {
      waterSystemResults.processUseResults = calculateProcessUseResults(waterSystem.processUse, waterSystem.hoursPerYear);
      waterSystemResults.processUseResults.incomingWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.incomingWater, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.recirculatedWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.recirculatedWater, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.wasteDischargedAndRecycledOther = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.wasteDischargedAndRecycledOther, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.waterConsumed = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterConsumed, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.waterLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterLoss, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.processUseResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.COOLINGTOWER && waterSystem.coolingTower) {
      waterSystemResults.coolingTowerResults = calculateCoolingTowerResults(waterSystem.coolingTower, waterSystem.hoursPerYear);
      waterSystemResults.coolingTowerResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.blowdownLoss, settings.unitsOfMeasure);
      waterSystemResults.coolingTowerResults.evaporationLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.evaporationLoss, settings.unitsOfMeasure);
      waterSystemResults.coolingTowerResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.makeupWater, settings.unitsOfMeasure);
      waterSystemResults.coolingTowerResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.coolingTowerResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.BOILER && waterSystem.boilerWater) {
      waterSystemResults.boilerWaterResults = calculateBoilerWaterResults(waterSystem.boilerWater, waterSystem.hoursPerYear);
      waterSystemResults.boilerWaterResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.blowdownLoss, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.condensateReturn = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.condensateReturn, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.makeupWater, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.steamLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.steamLoss, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.boilerWaterResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.KITCHEN && waterSystem.kitchenRestroom) {
      waterSystemResults.kitchenRestroomResults = calculateKitchenRestroomResults(waterSystem.kitchenRestroom);
      waterSystemResults.kitchenRestroomResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.kitchenRestroomResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.kitchenRestroomResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.LANDSCAPING && waterSystem.landscaping) {
      let landscapingInput = this.convertWaterAssessmentService.convertLandscapingSuiteInput(waterSystem.landscaping, settings.unitsOfMeasure);
      waterSystemResults.landscapingResults = calculateLandscapingResults(landscapingInput);
      waterSystemResults.landscapingResults = this.convertWaterAssessmentService.convertLandscapingResults(waterSystemResults.landscapingResults, settings.unitsOfMeasure);
      waterSystemResults.landscapingResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.landscapingResults.grossWaterUse, settings.unitsOfMeasure);
      console.log(waterSystemResults.landscapingResults);
      waterSystemResults.grossWaterUse = waterSystemResults.landscapingResults.grossWaterUse;
    }

    if (waterSystem.heatEnergy) {
      waterSystemResults.heatEnergyResults = this.waterSuiteApiService.calculateHeatEnergy(waterSystem.heatEnergy);
    }
    waterSystem.addedMotorEnergy.forEach(motorEnergy => {
      waterSystemResults.motorEnergyResults.push(this.waterSuiteApiService.calculateMotorEnergy(motorEnergy))
     });

    return waterSystemResults;
  }

  getSystemBalanceResults(waterSystem: WaterUsingSystem): SystemBalanceResults {
    let systemBalanceResults: SystemBalanceResults = {
      id: waterSystem.diagramNodeId,
      name: waterSystem.name,
      incomingWater: 0,
      outgoingWater: 0,
      waterBalance: 0,
      percentIncomingWater: 0,
      percentTotalBalance: 0,
  }
    let consumptiveIrrigationLoss = 0;
    if (waterSystem.systemType = WaterSystemTypeEnum.LANDSCAPING) {
      // todo 7121 how should this be retrieved?
      consumptiveIrrigationLoss = 0;
    }

    systemBalanceResults.incomingWater = waterSystem.waterFlows.sourceWater + waterSystem.waterFlows.recycledSourceWater;
    systemBalanceResults.outgoingWater = waterSystem.waterFlows.waterInProduct + waterSystem.waterFlows.dischargeWater + waterSystem.waterFlows.dischargeWaterRecycled + consumptiveIrrigationLoss;
    systemBalanceResults.waterBalance = systemBalanceResults.incomingWater - systemBalanceResults.outgoingWater;
    systemBalanceResults.percentIncomingWater = this.getBalancePercent(systemBalanceResults.incomingWater, systemBalanceResults.waterBalance);
    console.log('SystemBalanceResults', waterSystem.name, systemBalanceResults);
    return systemBalanceResults;
  }


  getBalancePercent(total: number, segment: number) {
    if (total) {
      let percent = Math.abs((segment / total) * 100);
      return percent;
    }
    return 0;
  }


  getWaterBalanceResults(waterAssessment: WaterAssessment): WaterBalanceResults {
    let allSystemBalanceResults = [];
    let systemTotalBalance = 0;
    waterAssessment.waterUsingSystems.forEach(system => {
      let systemBalanceResults:  SystemBalanceResults = this.getSystemBalanceResults(system);
      allSystemBalanceResults.push(systemBalanceResults);
      systemTotalBalance += systemBalanceResults.waterBalance;
    });
    
    let plantBalanceResults: WaterBalanceResults = {
      incomingWater: 0,
      outgoingWater: 0,
      waterBalance: 0,
      percentIncomingWater: 0,
      percentTotalBalance: 0,
      allSystemBalanceResults: []
    }
    
    plantBalanceResults.allSystemBalanceResults = allSystemBalanceResults.map(systemResult => {
      plantBalanceResults.incomingWater += systemResult.incomingWater; 
      plantBalanceResults.outgoingWater += systemResult.outgoingWater; 
      plantBalanceResults.waterBalance += systemResult.waterBalance; 
      plantBalanceResults.percentTotalBalance += systemResult.percentTotalBalance; 
      
      systemResult.percentTotalBalance = this.getBalancePercent(systemTotalBalance, systemResult.waterBalance);
      return systemResult;
    });

    console.log('plantWaterBalance', plantBalanceResults);
    return plantBalanceResults;
  }

}
