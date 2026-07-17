import { Injectable } from '@angular/core';
import { CentrifugalInput, CompressorCalcResult, CompressorsCalcInput } from '../compressed-air-assessment/compressed-air-calculation.service';
import { CompressedAirPressureReductionInput, CompressedAirPressureReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

@Injectable()
export class CompressedAirSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }
  compressedAirPressureReduction(inputObj: CompressedAirPressureReductionInput): CompressedAirPressureReductionResult {
    let inputs = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirPressureReductionInputV();

    inputObj.compressedAirPressureReductionInputVec.forEach(item => {
      item.compressorPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.compressorPower);
      item.pressureRated = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.pressureRated);
      item.pressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.pressure);
      item.proposedPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.proposedPressure);
      item.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.atmosphericPressure);
      item.hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.hoursPerYear);
      item.electricityCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(item.electricityCost);

      let wasmInput = {
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

    let output = this.toolsSuiteApiService.ToolsSuiteModule.compressedAirPressureReduction(inputs);
    let results: CompressedAirPressureReductionResult = {
      energyUse: output.energyUse,
      energyCost: output.energyCost
    };
    inputs.delete();
    return results;
  }


  compressorCalc(inputData: CompressorsCalcInput): CompressorCalcResult {
    let instance;
    inputData.controlType = this.suiteApiHelperService.getControlTypeEnum(inputData.controlType);
    inputData.compressorType = this.suiteApiHelperService.getCompressorTypeEnum(inputData.compressorType);
    inputData.lubricantType = this.suiteApiHelperService.getCompressorLubricantEnum(inputData.lubricantType);
    inputData.stageType = this.suiteApiHelperService.getCompressorStageEnum(inputData.stageType);
    inputData.computeFrom = this.suiteApiHelperService.getCompressorInputBasisEnum(inputData.computeFrom);

    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.LoadUnload) {
      instance = this.compressorsCalcLoadUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.ModulationWithoutUnload) {
      instance = this.compressorsCalcModulationWOUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.ModulationUnload) {
      instance = this.compressorsCalcModulationWithUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.VariableDisplacementUnload) {
      instance = this.compressorsCalcVariableDisplacement(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.MultiStepUnloading) {
      instance = this.compressorsCalcMultiStepUnloading(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.StartStop) {
      instance = this.compressorsCalcStartStop(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.Vfd) {
      instance = this.compressorsCalcVFD(inputData);
    }

    let suiteOutput;
    if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFraction) {
      suiteOutput = instance.calculateFromPowerFraction(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.CapacityFraction) {
      suiteOutput = instance.calculateFromCapacityFraction(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredPower) {
      suiteOutput = instance.calculateFromMeasuredPower(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredCapacity) {
      suiteOutput = instance.calculateFromMeasuredCapacity(inputData.computeFromVal);
    }
    else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFactor) {
      suiteOutput = instance.calculateFromElectrical(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps);
    }

    let results: CompressorCalcResult = {
      powerCalculated: suiteOutput.powerKw,
      capacityCalculated: suiteOutput.airflowAcfm,
      percentagePower: suiteOutput.powerFraction,
      percentageCapacity: suiteOutput.airflowFraction
    };
    suiteOutput.delete();
    instance.delete();
    return results;
  }

  compressorsCalcModulationWOUnload(input: CompressorsCalcInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.capacityAtFullLoad);
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.ModulationWithoutUnloadCompressor(
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
    return new this.toolsSuiteApiService.ToolsSuiteModule.StartStopCompressor(
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
    return new this.toolsSuiteApiService.ToolsSuiteModule.VariableFrequencyDriveCompressor(
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

    return new this.toolsSuiteApiService.ToolsSuiteModule.ModulationWithUnloadCompressorModulationWithUnloadCompressor(
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
    inputData.controlType = this.suiteApiHelperService.getControlTypeEnum(inputData.controlType);
    inputData.compressorType = this.suiteApiHelperService.getCompressorTypeEnum(inputData.compressorType);
    // inputData.lubricantType = this.suiteApiHelperService.getCompressorLubricantEnum(inputData.lubricantType);
    // inputData.stageType = this.suiteApiHelperService.getCompressorStageEnum(inputData.stageType);
    inputData.computeFrom = this.suiteApiHelperService.getCompressorInputBasisEnum(inputData.computeFrom);

    let instance;
    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.LoadUnload) {
      instance = this.compressorsCalcCentrifugalLoadUnload(inputData)
    }
    else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.ModulationUnload) {
      instance = this.compressorsCalcCentrifugalModulationUnload(inputData);
    } else if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.BlowOff) {
      instance = this.compressorsCalcCentrifugalBlowoff(inputData);
    }

    //TODO: Blowoff results added
    let suiteOutput;
    if (inputData.controlType == this.toolsSuiteApiService.ToolsSuiteModule.CompressorControl.BlowOff) {
      if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFraction) {
        suiteOutput = instance.calculateFromPowerFraction(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.CapacityFraction) {
        suiteOutput = instance.calculateFromCapacityFraction(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredPower) {
        suiteOutput = instance.calculateFromMeasuredPower(inputData.computeFromVal, inputData.percentageBlowOff);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredCapacity) {
        suiteOutput = instance.calculateFromMeasuredCapacity(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFactor) {
        suiteOutput = instance.calculateFromElectrical(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps, inputData.percentageBlowOff);
      }
    }
    else {
      if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFraction) {
        suiteOutput = instance.calculateFromPowerFraction(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.CapacityFraction) {
        suiteOutput = instance.calculateFromCapacityFraction(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredPower) {
        suiteOutput = instance.calculateFromMeasuredPower(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.MeasuredCapacity) {
        suiteOutput = instance.calculateFromMeasuredCapacity(inputData.computeFromVal);
      }
      else if (inputData.computeFrom == this.toolsSuiteApiService.ToolsSuiteModule.CompressorInputBasis.PowerFactor) {
        suiteOutput = instance.calculateFromElectrical(inputData.computeFromVal, inputData.computeFromPFVoltage, inputData.computeFromPFAmps);
      }
    }

    let results: CompressorCalcResult = {
      powerCalculated: suiteOutput.powerKw,
      capacityCalculated: suiteOutput.airflowAcfm,
      percentagePower: suiteOutput.powerFraction,
      percentageCapacity: suiteOutput.airflowFraction
    };
    suiteOutput.delete();
    instance.delete();
    return results;

  }

  compressorsCalcCentrifugalLoadUnload(inputData: CentrifugalInput) {
    let powerAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtFullLoad);
    let capacityAtFullLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.capacityAtFullLoad);
    let powerAtNoLoad = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerAtNoLoad);
    return new this.toolsSuiteApiService.ToolsSuiteModule.CentrifugalLoadUnloadCompressor(
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
    return new this.toolsSuiteApiService.ToolsSuiteModule.CentrifugalModulationUnloadCompressor(
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
    return new this.toolsSuiteApiService.ToolsSuiteModule.CentrifugalBlowOffCompressor(
      powerAtFullLoad,
      capacityAtFullLoad,
      powerAtBlowOff,
      surgeFlow
    );
  }
}
