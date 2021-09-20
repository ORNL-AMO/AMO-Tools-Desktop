import { Injectable } from '@angular/core';
import { CoolingTowerInput, CoolingTowerOutput } from '../shared/models/chillers';
// import { ChillerPerformanceInput, ChillerPerformanceOutput, ChillerStagingInput, ChillerStagingOutput, CoolingTowerBasinInput, CoolingTowerBasinOutput, CoolingTowerFanInput, CoolingTowerFanOutput, CoolingTowerInput, CoolingTowerOutput } from '../shared/models/chillers';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;

@Injectable()
export class ChillersSuiteApiService {

  constructor(private suiteEnumService: SuiteApiHelperService) { }

  coolingTowerMakeupWater(input: CoolingTowerInput): CoolingTowerOutput {
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad = this.suiteEnumService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate = this.suiteEnumService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor = this.suiteEnumService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor);
    input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours = this.suiteEnumService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours);
    
    let OperatingConditionsData = new Module.CoolingTowerOperatingConditionsData(
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor,
    );
    input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration = this.suiteEnumService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration); 
    let BaselineWaterConservationData = new Module.CoolingTowerWaterConservationData(
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration,
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.driftLossFactor,
    ); 
    input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration = this.suiteEnumService.convertNullInputValueForObjectConstructor(input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration); 
    let ModificationConservationData = new Module.CoolingTowerWaterConservationData(
      input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.cyclesOfConcentration,
      input.coolingTowerMakeupWaterCalculator.waterConservationModificationData.driftLossFactor,
    ); 
    let CoolingTowerMakeupWaterInstance = new Module.CoolingTowerMakeupWaterCalculator(
      OperatingConditionsData, 
      BaselineWaterConservationData, 
      ModificationConservationData
      );
    
    let output: CoolingTowerOutput = CoolingTowerMakeupWaterInstance.calculate();
    CoolingTowerMakeupWaterInstance.delete();
    OperatingConditionsData.delete();
    BaselineWaterConservationData.delete();
    ModificationConservationData.delete();
    return output;
  }

  // basinHeaterEnergyConsumption(input: CoolingTowerBasinInput) {
  //   let output: CoolingTowerBasinOutput = Module.BasinHeaterEnergyConsumption(
  //     input.ratedCapacity,
  //     input.ratedTempSetPoint,
  //     input.ratedTempDryBulb,
  //     input.ratedWindSpeed,
  //     input.operatingTempDryBulb,
  //     input.operatingWindSpeed,
  //     input.operatingHours,
  //     input.baselineTempSetPoint, 
  //     input.modTempSetPoint
  //   );
  //   return output;
  // }

  // fanEnergyConsumption(input: CoolingTowerFanInput): CoolingTowerFanOutput {
  //   let fanSpeedTypeBaseline: number = this.suiteEnumService.getCoolingTowerFanControlSpeedType(input.baselineSpeedType)
  //   let fanSpeedTypeModification: number = this.suiteEnumService.getCoolingTowerFanControlSpeedType(input.modSpeedType)
  //   let output: CoolingTowerFanOutput = Module.FanEnergyConsumption(
  //     input.ratedFanPower, 
  //     input.waterLeavingTemp,
  //     input.waterEnteringTemp,
  //     input.operatingTempWetBulb,
  //     input.operatingHours, 
  //     fanSpeedTypeBaseline,
  //     fanSpeedTypeModification
  //   );
    
  //   return output;
  // }

  // chillerCapacityEfficiency(input: ChillerPerformanceInput) {
  //   let chillerType: number = this.suiteEnumService.getCoolingTowerChillerType(input.chillerType)
  //   let condenserCoolingType: number = this.suiteEnumService.getCoolingTowerCondenserCoolingType(input.condenserCoolingType)
  //   let compressorConfigType: number = this.suiteEnumService.getCoolingTowerCompressorConfigType(input.compressorConfigType)
    
  //   let output: ChillerPerformanceOutput = Module.ChillerCapacityEfficiency(
  //     chillerType, 
  //     condenserCoolingType, 
  //     compressorConfigType,
  //     input.ariCapacity, 
  //     input.ariEfficiency, 
  //     input.maxCapacityRatio, 
  //     input.operatingHours, 
  //     input.waterFlowRate, 
  //     input.waterDeltaT,
  //     input.baselineWaterSupplyTemp, 
  //     input.baselineWaterEnteringTemp, 
  //     input.modWaterSupplyTemp, 
  //     input.modWaterEnteringTemp
  //   );
  //   return output;
  // }

  // chillerStagingEfficiency(input: ChillerStagingInput) {
  //   let chillerType: number = this.suiteEnumService.getCoolingTowerChillerType(input.chillerType)
  //   let condenserCoolingType: number = this.suiteEnumService.getCoolingTowerCondenserCoolingType(input.condenserCoolingType)
  //   let compressorConfigType: number = this.suiteEnumService.getCoolingTowerCompressorConfigType(input.compressorConfigType)
    
  //   let baselineLoadList = this.returnDoubleVector(input.baselineLoadList);
  //   let modLoadList = this.returnDoubleVector(input.modLoadList);

  //   let rawOutput = Module.ChillerStagingEfficiency(
  //     chillerType, 
  //     condenserCoolingType, 
  //     compressorConfigType,
  //     input.ariCapacity, 
  //     input.ariEfficiency, 
  //     input.maxCapacityRatio, 
  //     input.operatingHours, 
  //     input.waterSupplyTemp, 
  //     input.waterEnteringTemp,
  //     baselineLoadList, 
  //     modLoadList
  //   );

  //   let baselinePowerList: Array<number> = [];
  //   let modPowerList: Array<number> = [];
  //   for (let i = 0; i < rawOutput.baselinePowerList.size(); ++i) {
  //     baselinePowerList.push(rawOutput.baselinePowerList.get(i));
  //     if (modPowerList) {
  //       modPowerList.push(rawOutput.modPowerList.get(i));

  //     }
  //   }

  //   let output: ChillerStagingOutput = {
  //     baselineTotalPower: rawOutput.baselineTotalPower,
  //     baselineTotalEnergy: rawOutput.baselineTotalEnergy,
  //     modTotalPower: rawOutput.modTotalPower,
  //     modTotalEnergy: rawOutput.modTotalEnergy,
  //     savingsEnergy: rawOutput.savingsEnergy,
  //     baselinePowerList: baselinePowerList,
  //     modPowerList: modPowerList,
  //   }
  //   baselineLoadList.delete();
  //   modLoadList.delete();
  //   return output;
  // }


  // returnDoubleVector(doublesArray: Array<number>) {
  //   let doubleVector = new Module.DoubleVector();
  //   doublesArray.forEach(x => {
  //     doubleVector.push_back(x);
  //   });
  //   return doubleVector;
  // }

}
