import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTower, CoolingTowerResults, FlowMetric, ProcessUse, ProcessUseResults, WaterAssessmentResults, WaterSystemResults, WaterSystemTypeEnum, WaterUsingSystem } from '../shared/models/water-assessment';
import { WaterSuiteApiService } from '../tools-suite-api/water-suite-api.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { Settings } from '../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentResultsService {

  waterAssessmentResults: BehaviorSubject<WaterAssessmentResults>;
  constructor(private waterSuiteApiService: WaterSuiteApiService, private convertWaterAssessmentService: ConvertWaterAssessmentService) { 
    this.waterAssessmentResults = new BehaviorSubject<WaterAssessmentResults>(undefined);
  }

  getWaterSystemResults(waterSystem: WaterUsingSystem, selectedSystemType: number, settings: Settings): WaterSystemResults {
    let waterSystemResults: WaterSystemResults = {
      plantWaterBalance: undefined,
      grossWaterUse: undefined,
      processUseResults: undefined,
      coolingTowerResults: undefined,
      boilerWaterResults: undefined,
      kitchenRestroomResults: undefined,
      landscapingResults: undefined,
      motorEnergyResults: []
    }

    if (selectedSystemType === WaterSystemTypeEnum.PROCESS && waterSystem.processUse) {
      waterSystemResults.processUseResults = this.calculateProcessUseResults(waterSystem.processUse, waterSystem.hoursPerYear);
      waterSystemResults.processUseResults.incomingWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.incomingWater, settings);
      waterSystemResults.processUseResults.recirculatedWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.recirculatedWater, settings);
      waterSystemResults.processUseResults.wasteDischargedAndRecycledOther = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.wasteDischargedAndRecycledOther, settings);
      waterSystemResults.processUseResults.waterConsumed = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterConsumed, settings);
      waterSystemResults.processUseResults.waterLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterLoss, settings);
      waterSystemResults.processUseResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.processUseResults.grossWaterUse;
    }
    if (selectedSystemType === WaterSystemTypeEnum.COOLINGTOWER && waterSystem.coolingTower) {
      waterSystemResults.coolingTowerResults = this.waterSuiteApiService.calculateCoolingTowerResults(waterSystem.coolingTower, waterSystem.hoursPerYear);
      waterSystemResults.coolingTowerResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.blowdownLoss, settings);
      waterSystemResults.coolingTowerResults.evaporationLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.evaporationLoss, settings);
      waterSystemResults.coolingTowerResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.makeupWater, settings);
      waterSystemResults.coolingTowerResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.coolingTowerResults.grossWaterUse;
    }
    if (selectedSystemType === WaterSystemTypeEnum.BOILER && waterSystem.boilerWater) {
      waterSystemResults.boilerWaterResults = this.waterSuiteApiService.calculateBoilerWaterResults(waterSystem.boilerWater, waterSystem.hoursPerYear);
      waterSystemResults.boilerWaterResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.blowdownLoss, settings);
      waterSystemResults.boilerWaterResults.condensateReturn = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.condensateReturn, settings);
      waterSystemResults.boilerWaterResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.makeupWater, settings);
      waterSystemResults.boilerWaterResults.steamLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.steamLoss, settings);
      waterSystemResults.boilerWaterResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.boilerWaterResults.grossWaterUse;
    }
    if (selectedSystemType === WaterSystemTypeEnum.KITCHEN && waterSystem.kitchenRestroom) {
      waterSystemResults.kitchenRestroomResults = this.waterSuiteApiService.calculateKitchenRestroomResults(waterSystem.kitchenRestroom);
      waterSystemResults.kitchenRestroomResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.kitchenRestroomResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.kitchenRestroomResults.grossWaterUse;
    }
    if (selectedSystemType === WaterSystemTypeEnum.LANDSCAPING && waterSystem.landscaping) {
      waterSystem.landscaping = this.convertWaterAssessmentService.convertLandscapingSuiteInput(waterSystem.landscaping, settings);
      waterSystemResults.landscapingResults = this.waterSuiteApiService.calculateLandscapingResults(waterSystem.landscaping);
      waterSystemResults.landscapingResults = this.convertWaterAssessmentService.convertLandscapingResults(waterSystemResults.landscapingResults, settings);
      waterSystemResults.landscapingResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.landscapingResults.grossWaterUse, settings);
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

  calculateProcessUseResults(processUse: ProcessUse, hoursPerYear: number): ProcessUseResults {
    let grossWaterUse = this.convertAnnualFlow(
      processUse.waterRequiredMetricValue, 
      processUse.waterRequiredMetric, 
      hoursPerYear, 
      processUse.annualProduction
    );
    let recirculatedWater = grossWaterUse * processUse.fractionGrossWaterRecirculated;
    let incomingWater = grossWaterUse - recirculatedWater;
    let waterConsumed = this.convertAnnualFlow(
      processUse.waterConsumedMetricValue, 
      processUse.waterConsumedMetric, 
      hoursPerYear, 
      processUse.annualProduction,
      grossWaterUse, 
      incomingWater
    );
    let waterLoss = this.convertAnnualFlow(
      processUse.waterLossMetricValue, 
      processUse.waterLossMetric, 
      hoursPerYear, 
      processUse.annualProduction,
      grossWaterUse, 
      incomingWater
    );
    let wasteDischargedAndRecycledOther = incomingWater - waterConsumed - waterLoss;

    return {
      grossWaterUse,
      recirculatedWater,
      incomingWater,
      waterConsumed,
      waterLoss,
      wasteDischargedAndRecycledOther
    }
  }

  convertAnnualFlow(flowInput: number, metric: number, hoursPerYear: number, annualProduction: number, grossWaterUse?: number, incomingWater?: number): number {
    if (metric == FlowMetric.ANNUAL) {
      return flowInput;
    } else if (metric == FlowMetric.HOURLY) {
      return flowInput * hoursPerYear;
    } else if (metric == FlowMetric.INTENSITY) {
      return flowInput * annualProduction;
    }else if (metric == FlowMetric.FRACTION_GROSS) {
      return flowInput * grossWaterUse;
    }else if (metric == FlowMetric.FRACTION_INCOMING) {
      return flowInput * incomingWater;
    }
  }

}
