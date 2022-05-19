import { Injectable } from '@angular/core';
import { CentrifugalInput, CompressorCalcResult, CompressorsCalcInput } from '../compressed-air-assessment/compressed-air-calculation.service';
import { CompEEM_kWAdjustedInput, CompressedAirPressureReductionInput, CompressedAirPressureReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;

@Injectable()
export class CompressedAirSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService) { }
  compressedAirPressureReduction(inputObj: CompressedAirPressureReductionInput): CompressedAirPressureReductionResult {
    if (inputObj.compressedAirPressureReductionInputVec && inputObj.compressedAirPressureReductionInputVec.length > 0) {
      inputObj.compressedAirPressureReductionInputVec[0].compressorPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].compressorPower);
      inputObj.compressedAirPressureReductionInputVec[0].pressureRated = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].pressureRated);
      inputObj.compressedAirPressureReductionInputVec[0].pressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].pressure);
      inputObj.compressedAirPressureReductionInputVec[0].atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].atmosphericPressure);

      let input: CompEEM_kWAdjustedInput = {
        kW_fl_rated: inputObj.compressedAirPressureReductionInputVec[0].compressorPower,
        P_fl_rated: inputObj.compressedAirPressureReductionInputVec[0].pressureRated,
        P_discharge: inputObj.compressedAirPressureReductionInputVec[0].pressure,
        P_alt: inputObj.compressedAirPressureReductionInputVec[0].atmosphericPressure,
        P_atm: 14.7
      }
      let kW_adjusted: number = Module.kWAdjusted(input.kW_fl_rated, input.P_fl_rated, input.P_discharge, input.P_alt, input.P_atm);
      let annualEnergyUsage: number = kW_adjusted * inputObj.compressedAirPressureReductionInputVec[0].hoursPerYear;
      let annualEnergyCost: number = annualEnergyUsage * inputObj.compressedAirPressureReductionInputVec[0].electricityCost;
      return {
        energyCost: annualEnergyCost,
        energyUse: annualEnergyUsage
      }
    }
    return {
      energyCost: 0,
      energyUse: 0
    }
  }


  compressorCalc(inputData: CompressorsCalcInput): CompressorCalcResult {
    let instance;
    inputData.controlType = this.suiteApiHelperService.getControlTypeEnum(inputData.controlType);
    inputData.compressorType = this.suiteApiHelperService.getCompressorTypeEnum(inputData.compressorType);
    inputData.lubricantType = this.suiteApiHelperService.getLubricantEnum(inputData.lubricantType);
    inputData.stageType = this.suiteApiHelperService.getStageEnum(inputData.stageType);
    inputData.computeFrom = this.suiteApiHelperService.getComputeFromEnum(inputData.computeFrom);

    if (inputData.controlType == Module.ControlType.LoadUnload) {
      instance = this.compressorsCalcLoadUnload(inputData);
    }
    else if (inputData.controlType == Module.ControlType.ModulationWOUnload) {
      instance = this.compressorsCalcModulationWOUnload(inputData);
    }
    else if (inputData.controlType == Module.ControlType.ModulationUnload) {
      instance = this.compressorsCalcModulationWithUnload(inputData);
    }
    else if (inputData.controlType == Module.ControlType.VariableDisplacementUnload) {
      instance = this.compressorsCalcVariableDisplacement(inputData);
    } else if (inputData.controlType == Module.ControlType.MultiStepUnloading) {
      instance = this.compressorsCalcMultiStepUnloading(inputData);
    }
    else if (inputData.controlType == Module.ControlType.StartStop) {
      instance = this.compressorsCalcStartStop(inputData);
    }

    let suiteOutput;
    if (inputData.computeFrom == Module.ComputeFrom.PercentagePower) {
      suiteOutput = instance.calculateFromPerkW(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == Module.ComputeFrom.PercentageCapacity) {
      suiteOutput = instance.calculateFromPerC(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == Module.ComputeFrom.PowerMeasured) {
      suiteOutput = instance.calculateFromkWMeasured(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == Module.ComputeFrom.CapacityMeasured) {
      suiteOutput = instance.calculateFromCMeasured(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == Module.ComputeFrom.PowerFactor) {
      suiteOutput = instance.calculateFromVIPFMeasured(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps);
    }

    let results: CompressorCalcResult = {
      powerCalculated: suiteOutput.kW_Calc,
      capacityCalculated: suiteOutput.C_Calc,
      percentagePower: suiteOutput.PerkW,
      percentageCapacity: suiteOutput.C_Per
    };
    suiteOutput.delete();
    instance.delete();
    return results;
  }

  compressorsCalcModulationWOUnload(input: CompressorsCalcInput) {
    return new Module.Compressors_ModulationWOUnload(input.powerAtFullLoad, input.capacityAtFullLoad, input.powerAtNoLoad);
  }

  compressorsCalcStartStop(input: CompressorsCalcInput) {
    return new Module.Compressors_StartStop(input.powerAtFullLoad, input.capacityAtFullLoad, input.powerMaxPercentage, input.powerAtFullLoadPercentage);
  }

  compressorsCalcLoadUnload(input: CompressorsCalcInput) {
    return new Module.Compressors_LoadUnload(input.powerAtFullLoad, input.capacityAtFullLoad, input.receiverVolume, input.powerMax,
      input.dischargePsiFullLoad, input.dischargePsiMax, input.modulatingPsi, input.loadFactorUnloaded, input.atmosphericPsi,
      input.compressorType, input.lubricantType, input.controlType, input.powerAtNoLoad, input.unloadPointCapacity, input.blowdownTime,
      input.unloadSumpPressure, input.noLoadPowerFM);
  }

  compressorsCalcModulationWithUnload(input: CompressorsCalcInput) {
    return new Module.Compressors_ModulationWithUnload(input.powerAtFullLoad, input.capacityAtFullLoad, input.receiverVolume, input.powerMax, input.powerAtNoLoad, input.dischargePsiFullLoad, input.dischargePsiMax, input.modulatingPsi, input.atmosphericPsi, input.unloadPointCapacity, input.controlType, input.blowdownTime, input.unloadSumpPressure, input.noLoadPowerFM, input.powerAtUnload, input.pressureAtUnload, input.capacityAtUnload);
  }

  compressorsCalcVariableDisplacement(input: CompressorsCalcInput) {
    return new Module.Compressors_ModulationWithUnload(input.powerAtFullLoad, input.capacityAtFullLoad, input.receiverVolume, input.powerMax, input.powerAtNoLoad, input.dischargePsiFullLoad, input.dischargePsiMax, input.modulatingPsi, input.atmosphericPsi, input.unloadPointCapacity, input.controlType, input.blowdownTime, input.unloadSumpPressure, input.noLoadPowerFM, 0, 0, 0);
  }

  compressorsCalcMultiStepUnloading(input: CompressorsCalcInput) {
    return new Module.Compressors_LoadUnload(input.powerAtFullLoad, input.capacityAtFullLoad, input.receiverVolume, input.powerMax,
      input.dischargePsiFullLoad, input.dischargePsiMax, input.modulatingPsi, input.loadFactorUnloaded, input.atmosphericPsi,
      input.compressorType, input.lubricantType, input.controlType, input.powerAtNoLoad, input.unloadPointCapacity, input.blowdownTime,
      input.unloadSumpPressure, input.noLoadPowerFM);
  }

  compressorCalcCentrifugal(inputData: CentrifugalInput): CompressorCalcResult {
    inputData.controlType = this.suiteApiHelperService.getControlTypeEnum(inputData.controlType);
    inputData.compressorType = this.suiteApiHelperService.getCompressorTypeEnum(inputData.compressorType);
    // inputData.lubricantType = this.suiteApiHelperService.getLubricantEnum(inputData.lubricantType);
    // inputData.stageType = this.suiteApiHelperService.getStageEnum(inputData.stageType);
    inputData.computeFrom = this.suiteApiHelperService.getComputeFromEnum(inputData.computeFrom);

    let instance;
    if (inputData.controlType == Module.ControlType.LoadUnload) {
      instance = this.compressorsCalcCentrifugalLoadUnload(inputData)
    }
    else if (inputData.controlType == Module.ControlType.ModulationUnload) {
      instance = this.compressorsCalcCentrifugalModulationUnload(inputData);
    } else if (inputData.controlType == Module.ControlType.BlowOff) {
      instance = this.compressorsCalcCentrifugalBlowoff(inputData);
    }

    //TODO: Blowoff results added
    let suiteOutput;
    if (inputData.controlType == Module.ControlType.BlowOff) {
      if (inputData.computeFrom == Module.ComputeFrom.PercentagePower) {
        suiteOutput = instance.calculateFromPerkW_BlowOff(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.PercentageCapacity) {
        suiteOutput = instance.calculateFromPerC_BlowOff(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.PowerMeasured) {
        suiteOutput = instance.calculateFromkWMeasured_BlowOff(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.CapacityMeasured) {
        suiteOutput = instance.calculateFromCMeasured_BlowOff(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.PowerFactor) {
        suiteOutput = instance.calculateFromVIPFMeasured_BlowOff(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps, inputData.percentageBlowOff);
      }
    }
    else {
      if (inputData.computeFrom == Module.ComputeFrom.PercentagePower) {
        suiteOutput = instance.calculateFromPerkW(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.PercentageCapacity) {
        suiteOutput = instance.calculateFromPerC(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.PowerMeasured) {
        suiteOutput = instance.calculateFromkWMeasured(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.CapacityMeasured) {
        suiteOutput = instance.calculateFromCMeasured(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == Module.ComputeFrom.PowerFactor) {
        suiteOutput = instance.calculateFromVIPFMeasured(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps);
      }
    }

    let results: CompressorCalcResult = {
      powerCalculated: suiteOutput.kW_Calc,
      capacityCalculated: suiteOutput.C_Calc,
      percentagePower: suiteOutput.PerkW,
      percentageCapacity: suiteOutput.C_Per
    };
    suiteOutput.delete();
    instance.delete();
    return results;

  }

  compressorsCalcCentrifugalLoadUnload(inputData: CentrifugalInput) {
    return new Module.Compressors_Centrifugal_LoadUnload(inputData.powerAtFullLoad, inputData.capacityAtFullLoad, inputData.powerAtNoLoad);
  }

  compressorsCalcCentrifugalModulationUnload(inputData: CentrifugalInput) {
    return new Module.Compressors_Centrifugal_ModulationUnload(inputData.powerAtFullLoad, inputData.capacityAtFullLoad,
      inputData.powerAtNoLoad, inputData.capacityAtMaxFullFlow, inputData.powerAtUnload, inputData.capacityAtUnload);
  }

  compressorsCalcCentrifugalBlowoff(inputData: CentrifugalInput) {
    return new Module.Compressors_Centrifugal_BlowOff(inputData.powerAtFullLoad, inputData.capacityAtFullLoad, inputData.powerAtBlowOff, inputData.surgeFlow);
  }
}
