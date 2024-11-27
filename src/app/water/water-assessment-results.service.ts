import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlowMetric, ProcessUse, ProcessUseResults, WaterAssessment, SystemBalanceResults, WaterSystemResults, WaterSystemTypeEnum, WaterUsingSystem, WaterBalanceResults } from '../shared/models/water-assessment';
import { WaterSuiteApiService } from '../tools-suite-api/water-suite-api.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { Settings } from '../shared/models/settings';
import { roundVal } from '../shared/helperFunctions';

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
      waterSystemResults.processUseResults = this.calculateProcessUseResults(waterSystem.processUse, waterSystem.hoursPerYear);
      waterSystemResults.processUseResults.incomingWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.incomingWater, settings);
      waterSystemResults.processUseResults.recirculatedWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.recirculatedWater, settings);
      waterSystemResults.processUseResults.wasteDischargedAndRecycledOther = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.wasteDischargedAndRecycledOther, settings);
      waterSystemResults.processUseResults.waterConsumed = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterConsumed, settings);
      waterSystemResults.processUseResults.waterLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterLoss, settings);
      waterSystemResults.processUseResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.processUseResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.COOLINGTOWER && waterSystem.coolingTower) {
      waterSystemResults.coolingTowerResults = this.waterSuiteApiService.calculateCoolingTowerResults(waterSystem.coolingTower, waterSystem.hoursPerYear);
      waterSystemResults.coolingTowerResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.blowdownLoss, settings);
      waterSystemResults.coolingTowerResults.evaporationLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.evaporationLoss, settings);
      waterSystemResults.coolingTowerResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.makeupWater, settings);
      waterSystemResults.coolingTowerResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.coolingTowerResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.BOILER && waterSystem.boilerWater) {
      waterSystemResults.boilerWaterResults = this.waterSuiteApiService.calculateBoilerWaterResults(waterSystem.boilerWater, waterSystem.hoursPerYear);
      waterSystemResults.boilerWaterResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.blowdownLoss, settings);
      waterSystemResults.boilerWaterResults.condensateReturn = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.condensateReturn, settings);
      waterSystemResults.boilerWaterResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.makeupWater, settings);
      waterSystemResults.boilerWaterResults.steamLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.steamLoss, settings);
      waterSystemResults.boilerWaterResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.boilerWaterResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.KITCHEN && waterSystem.kitchenRestroom) {
      waterSystemResults.kitchenRestroomResults = this.waterSuiteApiService.calculateKitchenRestroomResults(waterSystem.kitchenRestroom);
      waterSystemResults.kitchenRestroomResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.kitchenRestroomResults.grossWaterUse, settings);
      waterSystemResults.grossWaterUse = waterSystemResults.kitchenRestroomResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.LANDSCAPING && waterSystem.landscaping) {
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

  getSystemSystemBalanceResults(waterSystem: WaterUsingSystem): SystemBalanceResults {
    let systemBalanceResults = {
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
      return roundVal(percent, 2);
    }
    return 0;
  }


  getWaterBalanceResults(waterAssessment: WaterAssessment): WaterBalanceResults {
    let allSystemBalanceResults = [];
    let systemTotalBalance = 0;
    waterAssessment.waterUsingSystems.forEach(system => {
      let systemBalanceResults:  SystemBalanceResults = this.getSystemSystemBalanceResults(system);
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
