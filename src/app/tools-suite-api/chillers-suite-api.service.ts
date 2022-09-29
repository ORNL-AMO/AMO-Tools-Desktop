import { Injectable } from '@angular/core';
import { ChillerPerformanceInput, ChillerPerformanceOutput, ChillerStagingInput, ChillerStagingOutput, CoolingTowerBasinInput, CoolingTowerBasinOutput, CoolingTowerBasinResult, CoolingTowerFanInput, CoolingTowerFanOutput, CoolingTowerInput, CoolingTowerOutput } from '../shared/models/chillers';
// import { ChillerPerformanceInput, ChillerPerformanceOutput, ChillerStagingInput, ChillerStagingOutput, CoolingTowerBasinInput, CoolingTowerBasinOutput, CoolingTowerFanInput, CoolingTowerFanOutput, CoolingTowerInput, CoolingTowerOutput } from '../shared/models/chillers';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;

@Injectable()
export class ChillersSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  coolingTowerMakeupWater(input: CoolingTowerInput): CoolingTowerOutput {
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours);

    let OperatingConditionsData = new Module.CoolingTowerOperatingConditionsData(
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor,
    );
    input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration);
    let BaselineWaterConservationData = new Module.CoolingTowerWaterConservationData(
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration,
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.driftLossFactor,
    );
    input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration);
    let ModificationConservationData = new Module.CoolingTowerWaterConservationData(
      input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration,
      input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.driftLossFactor,
    );
    let CoolingTowerMakeupWaterInstance = new Module.CoolingTowerMakeupWaterCalculator(
      OperatingConditionsData,
      BaselineWaterConservationData,
      ModificationConservationData
    );

    let output = CoolingTowerMakeupWaterInstance.calculate();
    let results: CoolingTowerOutput = {
      wcBaseline: output.wcBaseline,
      wcModification: output.wcModification,
      waterSavings: output.waterSavings,
      savingsPercentage: output.savingsPercentage,
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

  basinHeaterEnergyConsumption(input: CoolingTowerBasinInput) {
    let output = Module.BasinHeaterEnergyConsumption(
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
    let fanSpeedTypeBaseline: number = this.suiteApiHelperService.getCoolingTowerFanControlSpeedType(input.baselineSpeedType)
    let fanSpeedTypeModification: number = this.suiteApiHelperService.getCoolingTowerFanControlSpeedType(input.modSpeedType)
    let output = Module.FanEnergyConsumption(
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

  chillerCapacityEfficiency(input: ChillerPerformanceInput) {
    let chillerType: number = this.suiteApiHelperService.getCoolingTowerChillerType(input.chillerType)
    let condenserCoolingType: number = this.suiteApiHelperService.getCoolingTowerCondenserCoolingType(input.condenserCoolingType)
    let compressorConfigType: number = this.suiteApiHelperService.getCoolingTowerCompressorConfigType(input.compressorConfigType)

    let output = Module.ChillerCapacityEfficiency(
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

  chillerStagingEfficiency(input: ChillerStagingInput) {
    let chillerType: number = this.suiteApiHelperService.getCoolingTowerChillerType(input.chillerType)
    let condenserCoolingType: number = this.suiteApiHelperService.getCoolingTowerCondenserCoolingType(input.condenserCoolingType)
    let compressorConfigType: number = this.suiteApiHelperService.getCoolingTowerCompressorConfigType(input.compressorConfigType)

    let baselineLoadList = this.suiteApiHelperService.returnDoubleVector(input.baselineLoadList);
    let modLoadList = this.suiteApiHelperService.returnDoubleVector(input.modLoadList);

    let rawOutput = Module.ChillerStagingEfficiency(
      chillerType, 
      condenserCoolingType, 
      compressorConfigType,
      input.ariCapacity, 
      input.ariEfficiency, 
      input.maxCapacityRatio, 
      input.operatingHours, 
      input.waterSupplyTemp, 
      input.waterEnteringTemp,
      baselineLoadList, 
      modLoadList
    );

    let baselinePowerList: Array<number> = [];
    let modPowerList: Array<number> = [];
    for (let i = 0; i < rawOutput.baselinePowerList.size(); ++i) {
      baselinePowerList.push(rawOutput.baselinePowerList.get(i));
      if (modPowerList) {
        modPowerList.push(rawOutput.modPowerList.get(i));

      }
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
    baselineLoadList.delete();
    modLoadList.delete();
    rawOutput.delete();
    return output;
  }

}
