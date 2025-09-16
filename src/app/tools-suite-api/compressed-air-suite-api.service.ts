import { Injectable } from '@angular/core';
import { CentrifugalInput, CompressorCalcResult, CompressorsCalcInput } from '../compressed-air-assessment/compressed-air-calculation.service';
import { CompEEM_kWAdjustedInput, CompressedAirPressureReductionInput, CompressedAirPressureReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

@Injectable()
export class CompressedAirSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }
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
      let kW_adjusted: number = this.toolsSuiteApiService.ToolsSuiteModule.kWAdjusted(input.kW_fl_rated, input.P_fl_rated, input.P_discharge, input.P_alt, input.P_atm);
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

    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.LoadUnload) {
      instance = this.compressorsCalcLoadUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.ModulationWOUnload) {
      instance = this.compressorsCalcModulationWOUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.ModulationUnload) {
      instance = this.compressorsCalcModulationWithUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.VariableDisplacementUnload) {
      instance = this.compressorsCalcVariableDisplacement(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.MultiStepUnloading) {
      instance = this.compressorsCalcMultiStepUnloading(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.StartStop) {
      instance = this.compressorsCalcStartStop(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.VFD) {
      instance = this.compressorsCalcVFD(inputData);
    }

    let suiteOutput;
    if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentagePower) {
      suiteOutput = instance.calculateFromPerkW(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentageCapacity) {
      suiteOutput = instance.calculateFromPerC(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerMeasured) {
      suiteOutput = instance.calculateFromkWMeasured(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.CapacityMeasured) {
      suiteOutput = instance.calculateFromCMeasured(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerFactor) {
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
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_ModulationWOUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad
    );
  }

  compressorsCalcStartStop(input: CompressorsCalcInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let powerMaxPercentage = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMaxPercentage);
    let powerAtFullLoadPercentage = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoadPercentage);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_StartStop(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerMaxPercentage,
      powerAtFullLoadPercentage
    );
  }

  compressorsCalcVFD(input: CompressorsCalcInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let midTurndownPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.midTurndownPower);
    let turndownPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.turndownPower);
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let midTurndownAirflow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.midTurndownAirflow);
    let turndownAirflow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.turndownAirflow);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressor_VFD(
      powerAtFullLoad,
      midTurndownPower,
      turndownPower,
      powerAtNoLoad,
      capacityAtFullLoad,
      midTurndownAirflow,
      turndownAirflow);
  }

  compressorsCalcLoadUnload(input: CompressorsCalcInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let dischargePsiFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let loadFactorUnloaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.loadFactorUnloaded);
    let atmosphericPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let compressorType = input.compressorType;
    let lubricantType = input.lubricantType;
    let controlType = input.controlType;
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let unloadPointCapacity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let blowdownTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);

    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_LoadUnload(powerAtFullLoad,
      capacityAtFullLoad,
      receiverVolume,
      powerMax,
      dischargePsiFullLoad,
      dischargePsiMax,
      modulatingPsi,
      loadFactorUnloaded,
      atmosphericPsi,
      compressorType,
      lubricantType,
      controlType,
      powerAtNoLoad,
      unloadPointCapacity,
      blowdownTime,
      unloadSumpPressure,
      noLoadPowerFM
    );
  }

  compressorsCalcModulationWithUnload(input: CompressorsCalcInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let dischargePsiFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let atmosphericPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let unloadPointCapacity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let controlType = input.controlType;
    let blowdownTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);
    let powerAtUnload = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtUnload);
    let pressureAtUnload = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.pressureAtUnload);
    let capacityAtUnload = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtUnload);

    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_ModulationWithUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      receiverVolume,
      powerMax,
      powerAtNoLoad,
      dischargePsiFullLoad,
      dischargePsiMax,
      modulatingPsi,
      atmosphericPsi,
      unloadPointCapacity,
      controlType,
      blowdownTime,
      unloadSumpPressure,
      noLoadPowerFM,
      powerAtUnload,
      pressureAtUnload,
      capacityAtUnload
    );
  }

  compressorsCalcVariableDisplacement(input: CompressorsCalcInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad)
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad)
    let receiverVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume)
    let powerMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax)
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad)
    let dischargePsiFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad)
    let dischargePsiMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax)
    let modulatingPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi)
    let atmosphericPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi)
    let unloadPointCapacity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity)
    let controlType = input.controlType;
    let blowdownTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime)
    let unloadSumpPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure)
    let noLoadPowerFM = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM)

    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_ModulationWithUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      receiverVolume,
      powerMax,
      powerAtNoLoad,
      dischargePsiFullLoad,
      dischargePsiMax,
      modulatingPsi,
      atmosphericPsi,
      unloadPointCapacity,
      controlType,
      blowdownTime,
      unloadSumpPressure,
      noLoadPowerFM,
      0,
      0,
      0
    );
  }

  compressorsCalcMultiStepUnloading(input: CompressorsCalcInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let dischargePsiFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let loadFactorUnloaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.loadFactorUnloaded);
    let atmosphericPsi = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let compressorType = input.compressorType;
    let lubricantType = input.lubricantType;
    let controlType = input.controlType;
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let unloadPointCapacity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let blowdownTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_LoadUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      receiverVolume,
      powerMax,
      dischargePsiFullLoad,
      dischargePsiMax,
      modulatingPsi,
      loadFactorUnloaded,
      atmosphericPsi,
      compressorType,
      lubricantType,
      controlType,
      powerAtNoLoad,
      unloadPointCapacity,
      blowdownTime,
      unloadSumpPressure,
      noLoadPowerFM
    );
  }

  compressorCalcCentrifugal(inputData: CentrifugalInput): CompressorCalcResult {
    inputData.controlType = this.suiteApiHelperService.getControlTypeEnum(inputData.controlType);
    inputData.compressorType = this.suiteApiHelperService.getCompressorTypeEnum(inputData.compressorType);
    // inputData.lubricantType = this.suiteApiHelperService.getLubricantEnum(inputData.lubricantType);
    // inputData.stageType = this.suiteApiHelperService.getStageEnum(inputData.stageType);
    inputData.computeFrom = this.suiteApiHelperService.getComputeFromEnum(inputData.computeFrom);

    let instance;
    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.LoadUnload) {
      instance = this.compressorsCalcCentrifugalLoadUnload(inputData)
    }
    else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.ModulationUnload) {
      instance = this.compressorsCalcCentrifugalModulationUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.BlowOff) {
      instance = this.compressorsCalcCentrifugalBlowoff(inputData);
    }

    //TODO: Blowoff results added
    let suiteOutput;
    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.BlowOff) {
      if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentagePower) {
        suiteOutput = instance.calculateFromPerkW_BlowOff(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentageCapacity) {
        suiteOutput = instance.calculateFromPerC_BlowOff(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerMeasured) {
        suiteOutput = instance.calculateFromkWMeasured_BlowOff(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.CapacityMeasured) {
        suiteOutput = instance.calculateFromCMeasured_BlowOff(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerFactor) {
        suiteOutput = instance.calculateFromVIPFMeasured_BlowOff(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps, inputData.percentageBlowOff);
      }
    }
    else {
      if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentagePower) {
        suiteOutput = instance.calculateFromPerkW(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentageCapacity) {
        suiteOutput = instance.calculateFromPerC(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerMeasured) {
        suiteOutput = instance.calculateFromkWMeasured(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.CapacityMeasured) {
        suiteOutput = instance.calculateFromCMeasured(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerFactor) {
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
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad);
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_Centrifugal_LoadUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad
    );
  }

  compressorsCalcCentrifugalModulationUnload(inputData: CentrifugalInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad)
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad)
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtNoLoad)
    let capacityAtMaxFullFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtMaxFullFlow)
    let powerAtUnload = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtUnload)
    let capacityAtUnload = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtUnload)
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_Centrifugal_ModulationUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad,
      capacityAtMaxFullFlow,
      powerAtUnload,
      capacityAtUnload
    );
  }

  compressorsCalcCentrifugalBlowoff(inputData: CentrifugalInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad)
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad)
    let powerAtBlowOff = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtBlowOff)
    let surgeFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.surgeFlow)
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_Centrifugal_BlowOff(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtBlowOff,
      surgeFlow
    );
  }
}
