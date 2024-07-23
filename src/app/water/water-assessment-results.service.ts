import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTower, CoolingTowerResults, FlowMetric, ProcessUse, ProcessUseResults, WaterAssessmentResults, WaterSystemResults, WaterUsingSystem } from '../shared/models/water-assessment';
import { WaterSuiteApiService } from '../tools-suite-api/water-suite-api.service';

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentResultsService {

  waterAssessmentResults: BehaviorSubject<WaterAssessmentResults>;
  constructor(private waterSuiteApiService: WaterSuiteApiService) { 
    this.waterAssessmentResults = new BehaviorSubject<WaterAssessmentResults>(undefined);
  }

  // todo 6879 - needs conversion coming out of the suite
  getWaterSystemResults(waterSystem: WaterUsingSystem): WaterSystemResults {
    let waterSystemResults: WaterSystemResults = {
      waterBalance: undefined,
      grossWaterUse: undefined,
      processUseResults: undefined,
      coolingTowerResults: undefined,
      boilerWaterResults: undefined,
      kitchenRestroomResults: undefined,
      landscapingResults: undefined,
      motorEnergyResults: []
    }

    if (waterSystem.processUse) {
      waterSystemResults.processUseResults = this.calculateProcessUseResults(waterSystem.processUse, waterSystem.hoursPerYear);
      waterSystemResults.grossWaterUse = waterSystemResults.processUseResults.grossWaterUse;
    }
    if (waterSystem.coolingTower) {
      waterSystemResults.coolingTowerResults = this.waterSuiteApiService.calculateCoolingTowerResults(waterSystem.coolingTower, waterSystem.hoursPerYear);
      waterSystemResults.grossWaterUse = waterSystemResults.coolingTowerResults.grossWaterUse;
    }
    if (waterSystem.boilerWater) {
      waterSystemResults.boilerWaterResults = this.waterSuiteApiService.calculateBoilerWaterResults(waterSystem.boilerWater, waterSystem.hoursPerYear);
      waterSystemResults.grossWaterUse = waterSystemResults.boilerWaterResults.grossWaterUse;
    }
    if (waterSystem.kitchenRestroom) {
      waterSystemResults.kitchenRestroomResults = this.waterSuiteApiService.calculateKitchenRestroomResults(waterSystem.kitchenRestroom);
      waterSystemResults.grossWaterUse = waterSystemResults.kitchenRestroomResults.grossWaterUse;
    }
    if (waterSystem.landscaping) {
      waterSystemResults.landscapingResults = this.waterSuiteApiService.calculateLandscapingResults(waterSystem.landscaping);
      waterSystemResults.grossWaterUse = waterSystemResults.landscapingResults.grossWaterUse;
    }

    waterSystemResults.heatEnergyResults = this.waterSuiteApiService.calculateHeatEnergy(waterSystem.heatEnergy);
    waterSystem.addedMotorEquipment.forEach(motorEnergy => {
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
