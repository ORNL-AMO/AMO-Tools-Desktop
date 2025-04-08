import { Injectable } from '@angular/core';
import { WaterSuiteApiService } from '../tools-suite-api/water-suite-api.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { Settings } from '../shared/models/settings';
import { WaterUsingSystem, WaterAssessment, WaterSystemResults, WaterSystemTypeEnum, calculateProcessUseResults, calculateCoolingTowerResults, calculateBoilerWaterResults, calculateKitchenRestroomResults, calculateLandscapingResults, SystemBalanceResults, WaterBalanceResults } from 'process-flow-lib';

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

}
