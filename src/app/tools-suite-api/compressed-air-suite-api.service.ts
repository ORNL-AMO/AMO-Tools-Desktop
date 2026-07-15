import { Injectable } from '@angular/core';
import { CentrifugalInput, CompressorCalcResult, CompressorsCalcInput } from '../compressed-air-assessment/compressed-air-calculation.service';
import { CompressedAirPressureReductionInput, CompressedAirPressureReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type CompressorType,
  type Compressor_VFD,
  type Compressors_Centrifugal_BlowOff,
  type Compressors_Centrifugal_LoadUnload,
  type Compressors_Centrifugal_ModulationUnload,
  type Compressors_LoadUnload,
  type Compressors_ModulationWOUnload,
  type Compressors_ModulationWithUnload,
  type Compressors_StartStop,
  type CompressorsOutput,
  type CompressorsOutputBlowOff,
  type CompressedAirPressureReductionInput as SuiteCompressedAirPressureReductionInput,
  type CompressedAirPressureReductionInputV,
  type CompressedAirPressureReductionOutput,
  type ControlType,
  type Lubricant,
} from 'measur-tools-suite';

interface CompressorCalculator {
  calculateFromPerkW(perkW: number): CompressorsOutput;
  calculateFromPerC(cPer: number): CompressorsOutput;
  calculateFromkWMeasured(kW: number): CompressorsOutput;
  calculateFromCMeasured(c: number): CompressorsOutput;
  calculateFromVIPFMeasured(v: number, i: number, pf: number): CompressorsOutput;
  delete(): void;
}

interface BlowOffCompressorCalculator {
  calculateFromPerkW_BlowOff(perkW: number, blowPer: number): CompressorsOutputBlowOff;
  calculateFromPerC_BlowOff(cPer: number): CompressorsOutputBlowOff;
  calculateFromkWMeasured_BlowOff(kW: number, blowPer: number): CompressorsOutputBlowOff;
  calculateFromCMeasured_BlowOff(c: number): CompressorsOutputBlowOff;
  calculateFromVIPFMeasured_BlowOff(v: number, i: number, pf: number, blowPer: number): CompressorsOutputBlowOff;
  delete(): void;
}

@Injectable()
export class CompressedAirSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }
  compressedAirPressureReduction(inputObj: CompressedAirPressureReductionInput): CompressedAirPressureReductionResult {
    let inputs: CompressedAirPressureReductionInputV = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirPressureReductionInputV();

    inputObj.compressedAirPressureReductionInputVec.forEach(item => {
      item.compressorPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.compressorPower);
      item.pressureRated = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.pressureRated);
      item.pressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.pressure);
      item.proposedPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.proposedPressure);
      item.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.atmosphericPressure);
      item.hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.hoursPerYear);
      item.electricityCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.electricityCost);

      let wasmInput: SuiteCompressedAirPressureReductionInput = {
        isBaseline: item.isBaseline,
        hoursPerYear: item.hoursPerYear,
        electricityCost: item.electricityCost,
        compressorPower: item.compressorPower,
        pressure: item.pressure,
        proposedPressure: item.proposedPressure,
        atmosphericPressure: item.atmosphericPressure,
        pressureRated: item.pressureRated
      };
      inputs.push_back(wasmInput);
    });

    let output: CompressedAirPressureReductionOutput = this.toolsSuiteApiService.ToolsSuiteModule.compressedAirPressureReduction(inputs);
    let results: CompressedAirPressureReductionResult = {
      energyUse: output.energyUse,
      energyCost: output.energyCost
    };
    inputs.delete();
    return results;
  }


  compressorCalc(inputData: CompressorsCalcInput): CompressorCalcResult {
    let instance: CompressorCalculator;
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

    let suiteOutput: CompressorsOutput;
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

  compressorsCalcModulationWOUnload(input: CompressorsCalcInput): Compressors_ModulationWOUnload {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_ModulationWOUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad
    );
  }

  compressorsCalcStartStop(input: CompressorsCalcInput): Compressors_StartStop {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let powerMaxPercentage: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMaxPercentage);
    let powerAtFullLoadPercentage: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoadPercentage);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_StartStop(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerMaxPercentage,
      powerAtFullLoadPercentage
    );
  }

  compressorsCalcVFD(input: CompressorsCalcInput): Compressor_VFD {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let midTurndownPower: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.midTurndownPower);
    let turndownPower: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.turndownPower);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let midTurndownAirflow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.midTurndownAirflow);
    let turndownAirflow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.turndownAirflow);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressor_VFD(
      powerAtFullLoad,
      midTurndownPower,
      turndownPower,
      powerAtNoLoad,
      capacityAtFullLoad,
      midTurndownAirflow,
      turndownAirflow);
  }

  compressorsCalcLoadUnload(input: CompressorsCalcInput): Compressors_LoadUnload {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let dischargePsiFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let loadFactorUnloaded: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.loadFactorUnloaded);
    let atmosphericPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let compressorType: CompressorType = input.compressorType;
    let lubricantType: Lubricant = input.lubricantType;
    let controlType: ControlType = input.controlType;
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let unloadPointCapacity: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);

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

  compressorsCalcModulationWithUnload(input: CompressorsCalcInput): Compressors_ModulationWithUnload {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let dischargePsiFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let atmosphericPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let unloadPointCapacity: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let controlType: ControlType = input.controlType;
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);
    let powerAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtUnload);
    let pressureAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.pressureAtUnload);
    let capacityAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtUnload);

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

  compressorsCalcVariableDisplacement(input: CompressorsCalcInput): Compressors_ModulationWithUnload {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad)
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad)
    let receiverVolume: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume)
    let powerMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax)
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad)
    let dischargePsiFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad)
    let dischargePsiMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax)
    let modulatingPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi)
    let atmosphericPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi)
    let unloadPointCapacity: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity)
    let controlType: ControlType = input.controlType;
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime)
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure)
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM)

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

  compressorsCalcMultiStepUnloading(input: CompressorsCalcInput): Compressors_LoadUnload {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let dischargePsiFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let loadFactorUnloaded: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.loadFactorUnloaded);
    let atmosphericPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let compressorType: CompressorType = input.compressorType;
    let lubricantType: Lubricant = input.lubricantType;
    let controlType: ControlType = input.controlType;
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let unloadPointCapacity: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);
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

    let instance: CompressorCalculator | BlowOffCompressorCalculator;
    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.LoadUnload) {
      instance = this.compressorsCalcCentrifugalLoadUnload(inputData)
    }
    else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.ModulationUnload) {
      instance = this.compressorsCalcCentrifugalModulationUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.BlowOff) {
      instance = this.compressorsCalcCentrifugalBlowoff(inputData);
    }

    //TODO: Blowoff results added
    let suiteOutput: CompressorsOutput | CompressorsOutputBlowOff;
    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.ControlType.BlowOff) {
      let blowOffInstance: BlowOffCompressorCalculator = instance as BlowOffCompressorCalculator;
      if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentagePower) {
        suiteOutput = blowOffInstance.calculateFromPerkW_BlowOff(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentageCapacity) {
        suiteOutput = blowOffInstance.calculateFromPerC_BlowOff(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerMeasured) {
        suiteOutput = blowOffInstance.calculateFromkWMeasured_BlowOff(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.CapacityMeasured) {
        suiteOutput = blowOffInstance.calculateFromCMeasured_BlowOff(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerFactor) {
        suiteOutput = blowOffInstance.calculateFromVIPFMeasured_BlowOff(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps, inputData.percentageBlowOff);
      }
    }
    else {
      let standardInstance: CompressorCalculator = instance as CompressorCalculator;
      if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentagePower) {
        suiteOutput = standardInstance.calculateFromPerkW(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentageCapacity) {
        suiteOutput = standardInstance.calculateFromPerC(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerMeasured) {
        suiteOutput = standardInstance.calculateFromkWMeasured(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.CapacityMeasured) {
        suiteOutput = standardInstance.calculateFromCMeasured(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerFactor) {
        suiteOutput = standardInstance.calculateFromVIPFMeasured(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps);
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

  compressorsCalcCentrifugalLoadUnload(inputData: CentrifugalInput): Compressors_Centrifugal_LoadUnload {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_Centrifugal_LoadUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad
    );
  }

  compressorsCalcCentrifugalModulationUnload(inputData: CentrifugalInput): Compressors_Centrifugal_ModulationUnload {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad)
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad)
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtNoLoad)
    let capacityAtMaxFullFlow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtMaxFullFlow)
    let powerAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtUnload)
    let capacityAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtUnload)
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_Centrifugal_ModulationUnload(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad,
      capacityAtMaxFullFlow,
      powerAtUnload,
      capacityAtUnload
    );
  }

  compressorsCalcCentrifugalBlowoff(inputData: CentrifugalInput): Compressors_Centrifugal_BlowOff {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad)
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad)
    let powerAtBlowOff: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtBlowOff)
    let surgeFlow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.surgeFlow)
    return new this.toolsSuiteApiService.ToolsSuiteModule.Compressors_Centrifugal_BlowOff(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtBlowOff,
      surgeFlow
    );
  }
}
