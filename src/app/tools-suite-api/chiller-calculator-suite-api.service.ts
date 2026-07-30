import { Injectable } from '@angular/core';
import { ChillerPerformanceInput, ChillerPerformanceOutput, ChillerStagingInput, ChillerStagingOutput, CoolingTowerBasinInput, CoolingTowerBasinOutput, CoolingTowerBasinResult, CoolingTowerFanInput, CoolingTowerFanOutput, CoolingTowerInput, CoolingTowerOutput } from '../shared/models/chillers';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type CapacityPowerEnergyConsumptionOutput,
  type ChillerType,
  type CompressorConfigType,
  type CondenserCoolingType,
  type CoolingTowerMakeupWaterCalculator,
  type CoolingTowerMakeupWaterCalculatorOutput,
  type CoolingTowerOperatingConditionsData,
  type CoolingTowerWaterConservationData,
  type FanControlSpeedType,
  type PowerEnergyConsumptionOutput,
  type StagingPowerConsumptionOutput,
} from 'measur-tools-suite';

@Injectable()
export class ChillerCalculatorSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  coolingTowerMakeupWater(input: CoolingTowerInput): CoolingTowerOutput {
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours);

    let OperatingConditionsData: CoolingTowerOperatingConditionsData = new this.toolsSuiteApiService.ToolsSuiteModule.CoolingTowerOperatingConditionsData(
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor,
    );
    input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration);
    let BaselineWaterConservationData: CoolingTowerWaterConservationData = new this.toolsSuiteApiService.ToolsSuiteModule.CoolingTowerWaterConservationData(
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration,
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.driftLossFactor,
    );
    input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration);
    let ModificationConservationData: CoolingTowerWaterConservationData = new this.toolsSuiteApiService.ToolsSuiteModule.CoolingTowerWaterConservationData(
      input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration,
      input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.driftLossFactor,
    );
    let CoolingTowerMakeupWaterInstance: CoolingTowerMakeupWaterCalculator = new this.toolsSuiteApiService.ToolsSuiteModule.CoolingTowerMakeupWaterCalculator(
      OperatingConditionsData,
      BaselineWaterConservationData,
      ModificationConservationData
    );

    let output: CoolingTowerMakeupWaterCalculatorOutput = CoolingTowerMakeupWaterInstance.calculate();
    let results: CoolingTowerOutput = {
      wcBaseline: output.wcBaseline,
      wcModification: output.wcModification,
      waterSavings: output.waterSavings,
      savingsPercentage: output.wcBaseline ? (output.waterSavings / output.wcBaseline) * 100 : 0,
      coolingTowerCaseResults: [],
      annualCostSavings: undefined,
      baselineCost: undefined,
      modificationCost: undefined,
      
    }
    output.delete();
    CoolingTowerMakeupWaterInstance.delete();
    OperatingConditionsData.delete();
    BaselineWaterConservationData.delete();
    ModificationConservationData.delete();
    return results;
  }

  basinHeaterEnergyConsumption(input: CoolingTowerBasinInput): CoolingTowerBasinResult {
    let output: PowerEnergyConsumptionOutput = this.toolsSuiteApiService.ToolsSuiteModule.BasinHeaterEnergyConsumption(
      input.ratedCapacity,
      input.ratedTempSetPoint,
      input.ratedTempDryBulb,
      input.ratedWindSpeed,
      input.operatingTempDryBulb,
      input.operatingWindSpeed,
      input.operatingHours,
      input.baselineTempSetPoint, 
      input.modTempSetPoint,
      input.panLossRatio,
    );

    let results: CoolingTowerBasinResult = {
      baselinePower: output.baselinePower,
      baselineEnergy: output.baselineEnergy,
      modPower: output.modPower,
      modEnergy: output.modEnergy,
      savingsEnergy: output.savingsEnergy,
      baselineEnergyCost: undefined,
      modEnergyCost: undefined,
      annualCostSaving: undefined
    }
    output.delete();

    return results;
  }

  fanEnergyConsumption(input: CoolingTowerFanInput): CoolingTowerFanOutput {
    let fanSpeedTypeBaseline: FanControlSpeedType = this.suiteApiHelperService.getCoolingTowerFanControlSpeedType(input.baselineSpeedType)
    let fanSpeedTypeModification: FanControlSpeedType = this.suiteApiHelperService.getCoolingTowerFanControlSpeedType(input.modSpeedType)
    let output: PowerEnergyConsumptionOutput = this.toolsSuiteApiService.ToolsSuiteModule.FanEnergyConsumption(
      input.ratedFanPower, 
      input.waterLeavingTemp,
      input.waterEnteringTemp,
      input.operatingTempWetBulb,
      input.operatingHours, 
      fanSpeedTypeBaseline,
      fanSpeedTypeModification
    );

    let results: CoolingTowerFanOutput = {
      baselinePower: output.baselinePower,
      baselineEnergy: output.baselineEnergy,
      modPower: output.modPower,
      modEnergy: output.modEnergy,
      savingsEnergy: output.savingsEnergy,
      annualCostSaving: undefined,
      modEnergyCost: undefined,
      baselineEnergyCost: undefined
    }
    output.delete();
    
    return results;
  }

  chillerCapacityEfficiency(input: ChillerPerformanceInput): ChillerPerformanceOutput {
    let chillerType: ChillerType = this.suiteApiHelperService.getCoolingTowerChillerType(input.chillerType)
    let condenserCoolingType: CondenserCoolingType = this.suiteApiHelperService.getCoolingTowerCondenserCoolingType(input.condenserCoolingType)
    let compressorConfigType: CompressorConfigType = this.suiteApiHelperService.getCoolingTowerCompressorConfigType(input.compressorConfigType)

    let output: CapacityPowerEnergyConsumptionOutput = this.toolsSuiteApiService.ToolsSuiteModule.ChillerCapacityEfficiency(
      chillerType, 
      condenserCoolingType, 
      compressorConfigType,
      input.ariCapacity, 
      input.ariEfficiency, 
      input.maxCapacityRatio, 
      input.operatingHours, 
      input.waterFlowRate, 
      input.waterDeltaT,
      input.baselineWaterSupplyTemp, 
      input.baselineWaterEnteringTemp, 
      input.modWaterSupplyTemp, 
      input.modWaterEnteringTemp
    );

    let results: ChillerPerformanceOutput = {
      baselineActualEfficiency: output.baselineActualEfficiency,
      baselineActualCapacity: output.baselineActualCapacity,
      baselinePower: output.baselinePower,
      baselineEnergy: output.baselineEnergy,
      modActualEfficiency: output.modActualEfficiency,
      modActualCapacity: output.modActualCapacity,
      modPower: output.modPower,
      modEnergy: output.modEnergy,
      savingsEnergy: output.savingsEnergy,
      annualCostSaving: undefined,
      modEnergyCost: undefined,
      baselineEnergyCost: undefined
    }
    output.delete();
    return results;
  }

  chillerStagingEfficiency(input: ChillerStagingInput): ChillerStagingOutput {
    let chillerType: ChillerType = this.suiteApiHelperService.getCoolingTowerChillerType(input.chillerType)
    let condenserCoolingType: CondenserCoolingType = this.suiteApiHelperService.getCoolingTowerCondenserCoolingType(input.condenserCoolingType)
    let compressorConfigType: CompressorConfigType = this.suiteApiHelperService.getCoolingTowerCompressorConfigType(input.compressorConfigType)

    let rawOutput: StagingPowerConsumptionOutput = this.toolsSuiteApiService.ToolsSuiteModule.ChillerStagingEfficiency(
      chillerType,
      condenserCoolingType,
      compressorConfigType,
      input.ariCapacity,
      input.ariEfficiency,
      input.maxCapacityRatio,
      input.operatingHours,
      input.waterSupplyTemp,
      input.waterEnteringTemp,
      input.baselineLoadList,
      input.modLoadList
    );

    let baselinePowerList: Array<number> = [];
    let modPowerList: Array<number> = [];
    for (let i: number = 0; i < rawOutput.baselinePowerList.length; ++i) {
      baselinePowerList.push(rawOutput.baselinePowerList[i]);
    }
    for (let i: number = 0; i < rawOutput.modPowerList.length; ++i) {
      modPowerList.push(rawOutput.modPowerList[i]);
    }

    let output: ChillerStagingOutput = {
      baselineTotalPower: rawOutput.baselineTotalPower,
      baselineTotalEnergy: rawOutput.baselineTotalEnergy,
      modTotalPower: rawOutput.modTotalPower,
      modTotalEnergy: rawOutput.modTotalEnergy,
      savingsEnergy: rawOutput.savingsEnergy,
      baselinePowerList: baselinePowerList,
      modPowerList: modPowerList,
      costSavings: undefined,
      baselineCost: undefined,
      modificationCost: undefined
    }
    rawOutput.delete();
    return output;
  }

}
