import { Injectable } from '@angular/core';
import { CoolingTowerInput, CoolingTowerOutput } from '../shared/models/chillers';
import { SuiteApiEnumService } from './suite-api-enum.service';

declare var Module: any;

@Injectable()
export class ChillersSuiteApiService {

  constructor(private suiteEnumService: SuiteApiEnumService) { }

  coolingTowerMakeupWater(input: CoolingTowerInput): CoolingTowerOutput {
    let OperatingConditionsData = new Module.CoolingTowerOperatingConditionsData(
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.flowRate,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.coolingLoad,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.operationalHours,
      input.coolingTowerMakeupWaterCalculator.operatingConditionsData.lossCorrectionFactor,
    ); 
    let BaselineWaterConservationData = new Module.CoolingTowerWaterConservationData(
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.cyclesOfConcentration,
      input.coolingTowerMakeupWaterCalculator.waterConservationBaselineData.driftLossFactor,
    ); 
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
    return output;
  }

  // TODO apply process-cooling input type
  basinHeaterEnergyConsumption(input) {
    let output = Module.BasinHeaterEnergyConsumption(
      input.ratedCapacity,
      input.ratedTempSetPoint,
      input.ratedTempDryBulb,
      input.ratedWindSpeed,
      input.operatingTempDryBulb,
      input.operatingWindSpeed,
      input.operatingHours,
      input.baselineTempSetPoint, 
      input.modTempSetPoint
    );
    return output;
  }

  // TODO apply process-cooling input type
  fanEnergyConsumption(input) {
    let fanSpeedTypeBaseline: number = this.suiteEnumService.getCoolingTowerFanControlSpeedType(input.baselineSpeedtype)
    let fanSpeedTypeModification: number = this.suiteEnumService.getCoolingTowerFanControlSpeedType(input.modSpeedType)
    let output = Module.fanEnergyConsumption(
      input.ratedFanPower, 
      input.waterLeavingTemp,
      input.waterEnteringTemp,
      input.operatingTempWetBulb,
      input.operatingHours, 
      fanSpeedTypeBaseline,
      fanSpeedTypeModification
    );
    
    return output;
  }

  chillerCapacityEfficiency(input) {
    let chillerType: number = this.suiteEnumService.getCoolingTowerChillerType(input.modSpeedType)
    let condenserCoolingType: number = this.suiteEnumService.getCoolingTowerCondenserCoolingType(input.modSpeedType)
    let compressorConfigType: number = this.suiteEnumService.getCoolingTowerCompressorConfigType(input.modSpeedType)
    
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
    return output;
  }

  chillerStagingEfficiency(input) {
    let chillerType: number = this.suiteEnumService.getCoolingTowerChillerType(input.modSpeedType)
    let condenserCoolingType: number = this.suiteEnumService.getCoolingTowerCondenserCoolingType(input.modSpeedType)
    let compressorConfigType: number = this.suiteEnumService.getCoolingTowerCompressorConfigType(input.modSpeedType)
    
    let baselineLoadList = this.returnDoubleVector(input.baselineLoadList);
    let modLoadList = this.returnDoubleVector(input.modLoadList);

    let output = Module.ChillerStagingEfficiency(
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
    for (let i = 0; i < output.baselinePowerList.size(); ++i) {
      baselinePowerList.push(output.baselinePowerList.get(i));
      if (modPowerList) {
        modPowerList.push(output.modPowerList.get(i));

      }
    }

    // new object may need to be created from output, once it is typed.
    output.baselinePowerList = baselinePowerList;
    output.modPowerList = modPowerList;
    
    baselineLoadList.delete();
    modLoadList.delete();
    return output;
  }


  returnDoubleVector(doublesArray: Array<number>) {
    let doubleVector = new Module.DoubleVector();
    doublesArray.forEach(x => {
      doubleVector.push_back(x);
    });
    return doubleVector;
  }

}
