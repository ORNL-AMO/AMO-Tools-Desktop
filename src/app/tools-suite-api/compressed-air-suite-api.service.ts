import { Injectable } from '@angular/core';
import { CentrifugalInput, CompressorCalcResult, CompressorsCalcInput } from '../compressed-air-assessment/compressed-air-calculation.service';
import { CompressedAirPressureReductionInput, CompressedAirPressureReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type CentrifugalBlowOffCompressor,
  type CentrifugalLoadUnloadCompressor,
  type CentrifugalModulationUnloadCompressor,
  type CompressedAirPressureReductionInput as SuiteCompressedAirPressureReductionInput,
  type CompressedAirPressureReductionInputV,
  type CompressedAirPressureReductionOutput,
  type CompressorBlowOffResult,
  type CompressorControl,
  type CompressorInputBasis,
  type CompressorLubricant,
  type CompressorPerformanceResult,
  type CompressorType,
  type LoadUnloadCompressor,
  type ModulationWithUnloadCompressor,
  type ModulationWithoutUnloadCompressor,
  type StartStopCompressor,
  type VariableFrequencyDriveCompressor,
} from 'measur-tools-suite';

interface CompressorCalculator {
  calculateFromPowerFraction(powerFraction: number): CompressorPerformanceResult;
  calculateFromCapacityFraction(airflowFraction: number): CompressorPerformanceResult;
  calculateFromMeasuredPower(powerKw: number): CompressorPerformanceResult;
  calculateFromMeasuredCapacity(airflowAcfm: number): CompressorPerformanceResult;
  calculateFromElectrical(voltage: number, current: number, powerFactor: number): CompressorPerformanceResult;
  delete(): void;
}

interface BlowOffCompressorCalculator {
  calculateFromPowerFraction(powerFraction: number, blowOffFraction: number): CompressorBlowOffResult;
  calculateFromCapacityFraction(airflowFraction: number): CompressorBlowOffResult;
  calculateFromMeasuredPower(powerKw: number, blowOffFraction: number): CompressorBlowOffResult;
  calculateFromMeasuredCapacity(airflowAcfm: number): CompressorBlowOffResult;
  calculateFromElectrical(voltage: number, current: number, powerFactor: number, blowOffFraction: number): CompressorBlowOffResult;
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
    let controlType: CompressorControl = this.suiteApiHelperService.getControlTypeEnum(inputData.controlType);
    let computeFrom: CompressorInputBasis = this.suiteApiHelperService.getComputeFromEnum(inputData.computeFrom);

    inputData.controlType = controlType;
    inputData.compressorType = this.suiteApiHelperService.getCompressorTypeEnum(inputData.compressorType);
    inputData.lubricantType = this.suiteApiHelperService.getLubricantEnum(inputData.lubricantType);
    inputData.stageType = this.suiteApiHelperService.getStageEnum(inputData.stageType);
    inputData.computeFrom = computeFrom;

    if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.LoadUnload) {
      instance = this.compressorsCalcLoadUnload(inputData);
    } else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.ModulationWithoutUnload) {
      instance = this.compressorsCalcModulationWOUnload(inputData);
    } else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.ModulationUnload) {
      instance = this.compressorsCalcModulationWithUnload(inputData);
    } else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.VariableDisplacementUnload) {
      instance = this.compressorsCalcVariableDisplacement(inputData);
    } else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.MultiStepUnloading) {
      instance = this.compressorsCalcMultiStepUnloading(inputData);
    } else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.StartStop) {
      instance = this.compressorsCalcStartStop(inputData);
    } else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.Vfd) {
      instance = this.compressorsCalcVFD(inputData);
    } else {
      throw new Error('Unsupported compressor control type.');
    }

    let suiteOutput: CompressorPerformanceResult = this.calculateCompressorPerformance(instance, computeFrom, inputData);
    let results: CompressorCalcResult = this.getCompressorCalcResult(suiteOutput);
    instance.delete();
    return results;
  }

  compressorsCalcModulationWOUnload(input: CompressorsCalcInput): ModulationWithoutUnloadCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.ModulationWithoutUnloadCompressor(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad
    );
  }

  compressorsCalcStartStop(input: CompressorsCalcInput): StartStopCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let powerMaxPercentage: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMaxPercentage);
    let powerAtFullLoadPercentage: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoadPercentage);
    return new this.toolsSuiteApiService.ToolsSuiteModule.StartStopCompressor(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerMaxPercentage,
      powerAtFullLoadPercentage
    );
  }

  compressorsCalcVFD(input: CompressorsCalcInput): VariableFrequencyDriveCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let midTurndownPower: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.midTurndownPower);
    let turndownPower: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.turndownPower);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let midTurndownAirflow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.midTurndownAirflow);
    let turndownAirflow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.turndownAirflow);
    return new this.toolsSuiteApiService.ToolsSuiteModule.VariableFrequencyDriveCompressor(
      powerAtFullLoad,
      midTurndownPower,
      turndownPower,
      powerAtNoLoad,
      capacityAtFullLoad,
      midTurndownAirflow,
      turndownAirflow);
  }

  compressorsCalcLoadUnload(input: CompressorsCalcInput): LoadUnloadCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let dischargePsiFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let loadFactorUnloaded: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.loadFactorUnloaded);
    let atmosphericPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let compressorType: CompressorType = input.compressorType as CompressorType;
    let lubricantType: CompressorLubricant = input.lubricantType as CompressorLubricant;
    let controlType: CompressorControl = input.controlType as CompressorControl;
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let unloadPointCapacity: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);

    return new this.toolsSuiteApiService.ToolsSuiteModule.LoadUnloadCompressor(powerAtFullLoad,
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

  compressorsCalcModulationWithUnload(input: CompressorsCalcInput): ModulationWithUnloadCompressor {
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
    let controlType: CompressorControl = input.controlType as CompressorControl;
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);
    let powerAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtUnload);
    let pressureAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.pressureAtUnload);
    let capacityAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtUnload);

    return new this.toolsSuiteApiService.ToolsSuiteModule.ModulationWithUnloadCompressor(
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

  compressorsCalcVariableDisplacement(input: CompressorsCalcInput): ModulationWithUnloadCompressor {
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
    let controlType: CompressorControl = input.controlType as CompressorControl;
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);

    return new this.toolsSuiteApiService.ToolsSuiteModule.ModulationWithUnloadCompressor(
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

  compressorsCalcMultiStepUnloading(input: CompressorsCalcInput): LoadUnloadCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let receiverVolume: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.receiverVolume);
    let powerMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerMax);
    let dischargePsiFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiFullLoad);
    let dischargePsiMax: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargePsiMax);
    let modulatingPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.modulatingPsi);
    let loadFactorUnloaded: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.loadFactorUnloaded);
    let atmosphericPsi: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPsi);
    let compressorType: CompressorType = input.compressorType as CompressorType;
    let lubricantType: CompressorLubricant = input.lubricantType as CompressorLubricant;
    let controlType: CompressorControl = input.controlType as CompressorControl;
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    let unloadPointCapacity: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPointCapacity);
    let blowdownTime: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.blowdownTime);
    let unloadSumpPressure: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadSumpPressure);
    let noLoadPowerFM: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.noLoadPowerFM);
    return new this.toolsSuiteApiService.ToolsSuiteModule.LoadUnloadCompressor(
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
    let controlType: CompressorControl = this.suiteApiHelperService.getControlTypeEnum(inputData.controlType);
    let computeFrom: CompressorInputBasis = this.suiteApiHelperService.getComputeFromEnum(inputData.computeFrom);

    inputData.controlType = controlType;
    inputData.compressorType = this.suiteApiHelperService.getCompressorTypeEnum(inputData.compressorType);
    inputData.computeFrom = computeFrom;

    let instance: CompressorCalculator | BlowOffCompressorCalculator;
    if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.LoadUnload) {
      instance = this.compressorsCalcCentrifugalLoadUnload(inputData);
    }
    else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.ModulationUnload) {
      instance = this.compressorsCalcCentrifugalModulationUnload(inputData);
    } else if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.BlowOff) {
      instance = this.compressorsCalcCentrifugalBlowoff(inputData);
    } else {
      throw new Error('Unsupported centrifugal compressor control type.');
    }

    let suiteOutput: CompressorPerformanceResult | CompressorBlowOffResult;
    if (controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.BlowOff) {
      suiteOutput = this.calculateBlowOffCompressorPerformance(instance as BlowOffCompressorCalculator, computeFrom, inputData);
    } else {
      suiteOutput = this.calculateCompressorPerformance(instance as CompressorCalculator, computeFrom, inputData);
    }

    let results: CompressorCalcResult = this.getCompressorCalcResult(suiteOutput);
    instance.delete();
    return results;
  }

  compressorsCalcCentrifugalLoadUnload(inputData: CentrifugalInput): CentrifugalLoadUnloadCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.CentrifugalLoadUnloadCompressor(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad
    );
  }

  compressorsCalcCentrifugalModulationUnload(inputData: CentrifugalInput): CentrifugalModulationUnloadCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad);
    let powerAtNoLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtNoLoad);
    let capacityAtMaxFullFlow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtMaxFullFlow);
    let powerAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtUnload);
    let capacityAtUnload: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtUnload);
    return new this.toolsSuiteApiService.ToolsSuiteModule.CentrifugalModulationUnloadCompressor(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtNoLoad,
      capacityAtMaxFullFlow,
      powerAtUnload,
      capacityAtUnload
    );
  }

  compressorsCalcCentrifugalBlowoff(inputData: CentrifugalInput): CentrifugalBlowOffCompressor {
    let powerAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad);
    let capacityAtFullLoad: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad);
    let powerAtBlowOff: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtBlowOff);
    let surgeFlow: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.surgeFlow);
    return new this.toolsSuiteApiService.ToolsSuiteModule.CentrifugalBlowOffCompressor(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtBlowOff,
      surgeFlow
    );
  }

  private calculateCompressorPerformance(instance: CompressorCalculator, computeFrom: CompressorInputBasis, inputData: CompressorsCalcInput | CentrifugalInput): CompressorPerformanceResult {
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFraction) {
      return instance.calculateFromPowerFraction(inputData.computeFromVal);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.CapacityFraction) {
      return instance.calculateFromCapacityFraction(inputData.computeFromVal);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredPower) {
      return instance.calculateFromMeasuredPower(inputData.computeFromVal);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredCapacity) {
      return instance.calculateFromMeasuredCapacity(inputData.computeFromVal);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.Electrical) {
      return instance.calculateFromElectrical(inputData.computeFromPFVoltage, inputData.computeFromPFAmps, inputData.computeFromVal);
    }
    throw new Error('Unsupported compressor input basis.');
  }

  private calculateBlowOffCompressorPerformance(instance: BlowOffCompressorCalculator, computeFrom: CompressorInputBasis, inputData: CentrifugalInput): CompressorBlowOffResult {
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFraction) {
      return instance.calculateFromPowerFraction(inputData.computeFromVal, inputData.percentageBlowOff);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.CapacityFraction) {
      return instance.calculateFromCapacityFraction(inputData.computeFromVal);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredPower) {
      return instance.calculateFromMeasuredPower(inputData.computeFromVal, inputData.percentageBlowOff);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredCapacity) {
      return instance.calculateFromMeasuredCapacity(inputData.computeFromVal);
    }
    if (computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.Electrical) {
      return instance.calculateFromElectrical(inputData.computeFromPFVoltage, inputData.computeFromPFAmps, inputData.computeFromVal, inputData.percentageBlowOff);
    }
    throw new Error('Unsupported compressor input basis.');
  }

  private getCompressorCalcResult(suiteOutput: CompressorPerformanceResult | CompressorBlowOffResult): CompressorCalcResult {
    return {
      powerCalculated: suiteOutput.powerKw,
      capacityCalculated: suiteOutput.airflowAcfm,
      percentagePower: suiteOutput.powerFraction,
      percentageCapacity: suiteOutput.airflowFraction
    };
  }
}
