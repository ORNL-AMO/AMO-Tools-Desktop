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
  type AdjustCascadingSetPointResult,
  type AutomaticSequencerSetPointResult,
  type CascadingSetPointInput,
  type CompressorBlowOffResult,
  type CompressorControl,
  type CompressorInputBasis,
  type CompressorLubricant,
  type CompressorPerformancePoint,
  type CompressorPerformancePointInput,
  type CompressorPerformancePoints,
  type CompressorPerformanceResult,
  type CompressorProfileCompressor,
  type CompressorProfileCompressorV,
  type CompressorProfileOptions,
  type CompressorProfileRow,
  type CompressorProfileRowV,
  type CompressorProfileSavingsInput,
  type CompressorProfileSavingsResult,
  type CompressorProfileTotal,
  type CompressorProfileTotalV,
  type CompressorRuntimeState,
  type CompressorRuntimeStateV,
  type CompressorTrimSelection,
  type CompressorTrimSelectionV,
  type ImproveEndUseEfficiencyResult,
  type CompressorType,
  type LoadUnloadCompressor,
  type ModulationWithUnloadCompressor,
  type ModulationWithoutUnloadCompressor,
  type PressureReductionPointInput,
  type ReceiverVolumeResult,
  type ReduceAirLeaksResult,
  type ReduceSystemAirPressureResult,
  type SequencerSetPointInput,
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

  generatePerformancePoints(input: CompressorPerformancePointInput): CompressorPerformancePoints {
    let points: CompressorPerformancePoints = this.toolsSuiteApiService.ToolsSuiteModule.generatePerformancePoints(this.getCompressorPerformancePointInput(input));
    return this.fillDefaultPerformancePoints(input, points);
  }

  adjustPerformancePointsForSequencer(input: SequencerSetPointInput): CompressorPerformancePoints {
    return this.toolsSuiteApiService.ToolsSuiteModule.adjustPerformancePointsForSequencer({
      ...input,
      compressor: this.getCompressorPerformancePointInput(input.compressor)
    });
  }

  reduceSystemPressurePerformancePoints(input: PressureReductionPointInput): CompressorPerformancePoints {
    return this.toolsSuiteApiService.ToolsSuiteModule.reduceSystemPressurePerformancePoints({
      ...input,
      compressor: this.getCompressorPerformancePointInput(input.compressor)
    });
  }

  adjustCascadingSetPointPerformancePoints(input: CascadingSetPointInput): CompressorPerformancePoints {
    return this.toolsSuiteApiService.ToolsSuiteModule.adjustCascadingSetPointPerformancePoints({
      ...input,
      compressor: this.getCompressorPerformancePointInput(input.compressor)
    });
  }

  calculateRatedSpecificPower(totalPackageInputPowerKw: number, fullLoadRatedCapacityAcfm: number): number {
    return this.toolsSuiteApiService.ToolsSuiteModule.calculateRatedSpecificPower(totalPackageInputPowerKw, fullLoadRatedCapacityAcfm);
  }

  calculateRatedIsentropicEfficiency(ratedSpecificPower: number, fullLoadOperatingPressurePsig: number): number {
    return this.toolsSuiteApiService.ToolsSuiteModule.calculateRatedIsentropicEfficiency(ratedSpecificPower, fullLoadOperatingPressurePsig);
  }

  calculatePressureAdjustedAirflow(capacityAcfm: number, pointPressurePsig: number, ratedPressurePsig: number, atmosphericPressurePsia: number): number {
    return this.toolsSuiteApiService.ToolsSuiteModule.calculatePressureAdjustedAirflow(
      capacityAcfm,
      pointPressurePsig,
      ratedPressurePsig,
      atmosphericPressurePsia
    );
  }

  calculatePressureAdjustedPower(
    compressorType: number,
    inletPressurePsia: number,
    pointPressurePsig: number,
    ratedFullLoadPressurePsig: number,
    packagePowerKw: number,
    atmosphericPressurePsia: number
  ): number {
    return this.toolsSuiteApiService.ToolsSuiteModule.calculatePressureAdjustedPower(
      this.suiteApiHelperService.getCompressorTypeEnum(compressorType),
      inletPressurePsia,
      pointPressurePsig,
      ratedFullLoadPressurePsig,
      packagePowerKw,
      atmosphericPressurePsia
    );
  }

  calculateBaselineProfile(
    compressors: Array<CompressorProfileCompressor>,
    profileRows: Array<CompressorProfileRow>,
    options: CompressorProfileOptions
  ): Array<CompressorProfileRow> {
    let compressorVector: CompressorProfileCompressorV = this.getCompressorProfileCompressorVector(compressors);
    let rowVector: CompressorProfileRowV = this.getCompressorProfileRowVector(profileRows);
    let resultsVector: CompressorProfileRowV;
    try {
      const _options = this.getCompressorProfileOptions(options);
      resultsVector = this.toolsSuiteApiService.ToolsSuiteModule.calculateBaselineProfile(compressorVector, rowVector, _options);
      return this.copyCompressorProfileRows(resultsVector);
    } finally {
      if (resultsVector) {
        resultsVector.delete();
      }
      rowVector.delete();
      compressorVector.delete();
    }
  }

  calculateProfileTotals(
    compressors: Array<CompressorProfileCompressor>,
    profileRows: Array<CompressorProfileRow>,
    intervalHours: number
  ): Array<CompressorProfileTotal> {
    let compressorVector: CompressorProfileCompressorV = this.getCompressorProfileCompressorVector(compressors);
    let rowVector: CompressorProfileRowV = this.getCompressorProfileRowVector(profileRows);
    let resultsVector: CompressorProfileTotalV;
    try {
      resultsVector = this.toolsSuiteApiService.ToolsSuiteModule.calculateProfileTotals(compressorVector, rowVector);
      return this.copyCompressorProfileTotals(resultsVector);
    } finally {
      if (resultsVector) {
        resultsVector.delete();
      }
      rowVector.delete();
      compressorVector.delete();
    }
  }

  reallocateProfileFlow(
    compressors: Array<CompressorProfileCompressor>,
    previousProfileRows: Array<CompressorProfileRow>,
    demandRows: Array<CompressorProfileTotal>,
    options: CompressorProfileOptions,
    runtimeStates: Array<CompressorRuntimeState>,
    trimSelections: Array<CompressorTrimSelection>
  ): Array<CompressorProfileRow> {
    let compressorVector: CompressorProfileCompressorV = this.getCompressorProfileCompressorVector(compressors);
    let previousRowVector: CompressorProfileRowV = this.getCompressorProfileRowVector(previousProfileRows);
    let demandRowVector: CompressorProfileTotalV = this.getCompressorProfileTotalVector(demandRows);
    let runtimeStateVector: CompressorRuntimeStateV = this.getCompressorRuntimeStateVector(runtimeStates || []);
    let trimSelectionVector: CompressorTrimSelectionV = this.getCompressorTrimSelectionVector(trimSelections || []);
    let resultsVector: CompressorProfileRowV;
    try {
      resultsVector = this.toolsSuiteApiService.ToolsSuiteModule.reallocateProfileFlow(
        compressorVector,
        previousRowVector,
        demandRowVector,
        this.getCompressorProfileOptions(options),
        runtimeStateVector,
        trimSelectionVector
      );
      return this.copyCompressorProfileRows(resultsVector);
    } finally {
      if (resultsVector) {
        resultsVector.delete();
      }
      trimSelectionVector.delete();
      runtimeStateVector.delete();
      demandRowVector.delete();
      previousRowVector.delete();
      compressorVector.delete();
    }
  }

  calculateProfileSavings(
    baselineRows: Array<CompressorProfileRow>,
    adjustedRows: Array<CompressorProfileRow>,
    input: CompressorProfileSavingsInput
  ): CompressorProfileSavingsResult {
    let baselineRowVector: CompressorProfileRowV = this.getCompressorProfileRowVector(baselineRows);
    let adjustedRowVector: CompressorProfileRowV = this.getCompressorProfileRowVector(adjustedRows);
    try {
      return this.toolsSuiteApiService.ToolsSuiteModule.calculateProfileSavings(baselineRowVector, adjustedRowVector, input);
    } finally {
      adjustedRowVector.delete();
      baselineRowVector.delete();
    }
  }

  calculatePressureReducedAirflow(
    useAirflowAcfm: number,
    adjustedFullLoadPressurePsig: number,
    altitudePressurePsia: number,
    originalFullLoadPressurePsig: number,
    atmosphericPressurePsia: number
  ): number {
    return this.toolsSuiteApiService.ToolsSuiteModule.calculatePressureReducedAirflow(
      useAirflowAcfm,
      adjustedFullLoadPressurePsig,
      altitudePressurePsia,
      originalFullLoadPressurePsig,
      atmosphericPressurePsia
    );
  }

  reduceAirLeaks(fullLoadAirflowAcfm: number, useAirflowAcfm: number, leakAirflowAcfm: number, leakReductionFraction: number): ReduceAirLeaksResult {
    return this.toolsSuiteApiService.ToolsSuiteModule.reduceAirLeaks(fullLoadAirflowAcfm, useAirflowAcfm, leakAirflowAcfm, leakReductionFraction);
  }

  improveEndUseEfficiency(fullLoadAirflowAcfm: number, useAirflowAcfm: number, reducedAverageAirflowAcfm: number): ImproveEndUseEfficiencyResult {
    return this.toolsSuiteApiService.ToolsSuiteModule.improveEndUseEfficiency(fullLoadAirflowAcfm, useAirflowAcfm, reducedAverageAirflowAcfm);
  }

  reduceSystemAirPressure(
    fullLoadAirflowAcfm: number,
    useAirflowAcfm: number,
    fullLoadPressurePsig: number,
    fullLoadPowerKw: number,
    pressureReductionPsig: number,
    altitudePressurePsia: number,
    atmosphericPressurePsia: number
  ): ReduceSystemAirPressureResult {
    return this.toolsSuiteApiService.ToolsSuiteModule.reduceSystemAirPressure(
      fullLoadAirflowAcfm,
      useAirflowAcfm,
      fullLoadPressurePsig,
      fullLoadPowerKw,
      pressureReductionPsig,
      altitudePressurePsia,
      atmosphericPressurePsia
    );
  }

  adjustCascadingSetPoint(
    fullLoadAirflowAcfm: number,
    useAirflowAcfm: number,
    fullLoadPressurePsig: number,
    fullLoadPowerKw: number,
    adjustedFullLoadPressurePsig: number,
    altitudePressurePsia: number,
    atmosphericPressurePsia: number
  ): AdjustCascadingSetPointResult {
    return this.toolsSuiteApiService.ToolsSuiteModule.adjustCascadingSetPoint(
      fullLoadAirflowAcfm,
      useAirflowAcfm,
      fullLoadPressurePsig,
      fullLoadPowerKw,
      adjustedFullLoadPressurePsig,
      altitudePressurePsia,
      atmosphericPressurePsia
    );
  }

  pressureReducedAirflow(
    useAirflowAcfm: number,
    adjustedFullLoadPressurePsig: number,
    altitudePressurePsia: number,
    originalFullLoadPressurePsig: number,
    atmosphericPressurePsia: number
  ): number {
    return this.toolsSuiteApiService.ToolsSuiteModule.pressureReducedAirflow(
      useAirflowAcfm,
      adjustedFullLoadPressurePsig,
      altitudePressurePsia,
      originalFullLoadPressurePsig,
      atmosphericPressurePsia
    );
  }

  addReceiverVolume(currentReceiverVolumeFt3: number, addedReceiverVolumeFt3: number): ReceiverVolumeResult {
    return this.toolsSuiteApiService.ToolsSuiteModule.addReceiverVolume(currentReceiverVolumeFt3, addedReceiverVolumeFt3);
  }

  automaticSequencerSetPoints(targetPressurePsig: number, variancePsig: number): AutomaticSequencerSetPointResult {
    return this.toolsSuiteApiService.ToolsSuiteModule.automaticSequencerSetPoints(targetPressurePsig, variancePsig);
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

  private getCompressorPerformancePointInput(input: CompressorPerformancePointInput): CompressorPerformancePointInput {
    return {
      ...input,
      nameplate: {
        ...input.nameplate,
        compressorType: this.suiteApiHelperService.getCompressorTypeEnum(this.getSuiteEnumNumber(input.nameplate.compressorType)),
        stage: this.suiteApiHelperService.getStageEnum(this.getSuiteEnumNumber(input.nameplate.stage)),
        lubricant: this.suiteApiHelperService.getLubricantEnum(this.getSuiteEnumNumber(input.nameplate.lubricant))
      },
      controls: {
        ...input.controls,
        control: this.suiteApiHelperService.getControlTypeEnum(this.getSuiteEnumNumber(input.controls.control))
      }
    };
  }

  private fillDefaultPerformancePoints(input: CompressorPerformancePointInput, points: CompressorPerformancePoints): CompressorPerformancePoints {
    if (input.points.fullLoad.isDefaultPressure) {
      points.fullLoad.dischargePressurePsig = this.roundPressure(input.nameplate.fullLoadOperatingPressurePsig);
    }
    if (input.points.fullLoad.isDefaultAirflow) {
      points.fullLoad.airflowAcfm = this.roundAirflow(this.calculatePressureAdjustedAirflow(
        input.nameplate.fullLoadRatedCapacityAcfm,
        points.fullLoad.dischargePressurePsig,
        input.nameplate.fullLoadOperatingPressurePsig,
        input.atmosphericPressurePsia
      ));
    }
    if (input.points.fullLoad.isDefaultPower) {
      points.fullLoad.powerKw = this.roundPower(this.calculatePressureAdjustedPower(
        input.nameplate.compressorType,
        input.design.inputPressurePsia,
        points.fullLoad.dischargePressurePsig,
        input.nameplate.fullLoadOperatingPressurePsig,
        input.nameplate.totalPackageInputPowerKw,
        input.atmosphericPressurePsia
      ));
    }

    if (this.needsMaxFullFlow(input)) {
      if (input.points.maxFullFlow.isDefaultPressure) {
        points.maxFullFlow.dischargePressurePsig = this.roundPressure(input.design.maxFullFlowPressurePsig);
      }
      if (input.points.maxFullFlow.isDefaultAirflow) {
        points.maxFullFlow.airflowAcfm = this.roundAirflow(this.calculatePressureAdjustedAirflow(
          points.fullLoad.airflowAcfm,
          points.maxFullFlow.dischargePressurePsig,
          points.fullLoad.dischargePressurePsig,
          input.atmosphericPressurePsia
        ));
      }
      if (input.points.maxFullFlow.isDefaultPower) {
        points.maxFullFlow.powerKw = this.roundPower(this.calculatePressureAdjustedPower(
          input.nameplate.compressorType,
          input.design.inputPressurePsia,
          points.maxFullFlow.dischargePressurePsig,
          points.fullLoad.dischargePressurePsig,
          points.fullLoad.powerKw,
          input.atmosphericPressurePsia
        ));
      }
    }

    this.fillDefaultUnloadPoint(input, points);
    this.fillDefaultVfdPoints(input, points);
    this.fillDefaultNoLoadPoint(input, points);
    return points;
  }

  private fillDefaultUnloadPoint(input: CompressorPerformancePointInput, points: CompressorPerformancePoints): void {
    let control: number = this.getSuiteEnumNumber(input.controls.control);
    let isUnloadControl: boolean = control == 1 || control == 5;
    if (!isUnloadControl) {
      return;
    }

    if (input.points.unloadPoint.isDefaultAirflow) {
      points.unloadPoint.airflowAcfm = this.roundAirflow(this.toolsSuiteApiService.ToolsSuiteModule.calculateUnloadPointAirflow(
        points.fullLoad.airflowAcfm,
        input.controls.unloadPointCapacityPct
      ));
    }
    if (input.points.unloadPoint.isDefaultPressure) {
      points.unloadPoint.dischargePressurePsig = this.roundPressure(this.toolsSuiteApiService.ToolsSuiteModule.calculateUnloadPointDischargePressure(
        points.maxFullFlow.dischargePressurePsig,
        input.design.modulatingPressurePsig,
        points.fullLoad.airflowAcfm,
        points.unloadPoint.airflowAcfm
      ));
    }
    if (input.points.unloadPoint.isDefaultPower) {
      let unloadCapacity: number = points.fullLoad.airflowAcfm == 0
        ? 0
        : (points.unloadPoint.airflowAcfm / points.fullLoad.airflowAcfm) * 100;
      let exponent: number = control == 5 ? 2 : 1;
      points.unloadPoint.powerKw = this.toolsSuiteApiService.ToolsSuiteModule.calculateUnloadPointPower(
        input.design.noLoadPowerFMPercent,
        unloadCapacity,
        exponent,
        points.maxFullFlow.powerKw
      );
    }
  }

  private fillDefaultVfdPoints(input: CompressorPerformancePointInput, points: CompressorPerformancePoints): void {
    if (this.getSuiteEnumNumber(input.controls.control) != 7) {
      return;
    }

    if (input.points.midTurndown.isDefaultAirflow) {
      let capacityFraction: number = input.controls.unloadPointCapacityPct / 100;
      points.midTurndown.airflowAcfm = this.roundAirflow(((1 - capacityFraction) / 2 + capacityFraction) * points.fullLoad.airflowAcfm);
    }
    this.fillDefaultVfdPoint(input.points.midTurndown, points.midTurndown, points.fullLoad);

    if (input.points.turndown.isDefaultAirflow) {
      points.turndown.airflowAcfm = this.roundAirflow((input.controls.unloadPointCapacityPct / 100) * points.fullLoad.airflowAcfm);
    }
    this.fillDefaultVfdPoint(input.points.turndown, points.turndown, points.fullLoad);
  }

  private fillDefaultVfdPoint(inputPoint: CompressorPerformancePoint, point: CompressorPerformancePoint, fullLoadPoint: CompressorPerformancePoint): void {
    let loadFraction: number = fullLoadPoint.airflowAcfm == 0 ? 0 : point.airflowAcfm / fullLoadPoint.airflowAcfm;
    if (inputPoint.isDefaultPressure) {
      point.dischargePressurePsig = this.roundPressure(fullLoadPoint.dischargePressurePsig + 6 * (1 - loadFraction));
    }
    if (inputPoint.isDefaultPower) {
      point.powerKw = this.roundPower(((15 / 100) * (1 - loadFraction) + loadFraction) * fullLoadPoint.powerKw);
    }
  }

  private fillDefaultNoLoadPoint(input: CompressorPerformancePointInput, points: CompressorPerformancePoints): void {
    let control: number = this.getSuiteEnumNumber(input.controls.control);
    if (input.points.noLoad.isDefaultPressure) {
      if (this.isNoLoadPressureZero(input)) {
        points.noLoad.dischargePressurePsig = 0;
      } else if (control == 3) {
        points.noLoad.dischargePressurePsig = this.roundPressure(points.fullLoad.dischargePressurePsig + input.design.modulatingPressurePsig);
      } else {
        points.noLoad.dischargePressurePsig = this.roundPressure(input.controls.unloadSumpPressurePsig);
      }
    }
    if (input.points.noLoad.isDefaultAirflow) {
      points.noLoad.airflowAcfm = 0;
    }
    if (input.points.noLoad.isDefaultPower) {
      if (control == 3) {
        points.noLoad.powerKw = this.roundPower(this.toolsSuiteApiService.ToolsSuiteModule.calculateNoLoadPowerWithoutUnloading(
          input.design.noLoadPowerFMPercent,
          points.fullLoad.powerKw
        ));
      } else if (control == 4) {
        points.noLoad.powerKw = 0;
      } else {
        points.noLoad.powerKw = this.roundPower(this.toolsSuiteApiService.ToolsSuiteModule.calculateNoLoadPower(
          input.design.noLoadPowerULPercent,
          input.nameplate.totalPackageInputPowerKw,
          input.design.designEfficiencyPct
        ));
      }
    }
  }

  private needsMaxFullFlow(input: CompressorPerformancePointInput): boolean {
    let control: number = this.getSuiteEnumNumber(input.controls.control);
    return control == 1 || control == 5 || control == 0 || control == 4 || control == 6;
  }

  private isNoLoadPressureZero(input: CompressorPerformancePointInput): boolean {
    let compressorType: number = this.getSuiteEnumNumber(input.nameplate.compressorType);
    let control: number = this.getSuiteEnumNumber(input.controls.control);
    let lubricant: number = this.getSuiteEnumNumber(input.nameplate.lubricant);
    return compressorType == 0 || control == 4 || compressorType == 2 || lubricant == 1;
  }

  private getSuiteEnumNumber(value: any): number {
    if (value && typeof value == 'object' && value.value != undefined) {
      return value.value;
    }
    return value;
  }

  private roundPressure(value: number): number {
    return this.roundSuiteValue(value, 1);
  }

  private roundAirflow(value: number): number {
    return this.roundSuiteValue(value, 0);
  }

  private roundPower(value: number): number {
    return this.roundSuiteValue(value, 1);
  }

  private roundSuiteValue(value: number, digits: number): number {
    let scale: number = Math.pow(10, digits);
    return Math.round(value * scale) / scale;
  }

  private getCompressorProfileOptions(options: CompressorProfileOptions): CompressorProfileOptions {
    return {
      ...options,
      inputBasis: this.suiteApiHelperService.getComputeFromEnum(options.inputBasis as number),
      controlMode: this.suiteApiHelperService.getCompressorSystemControlModeEnum(options.controlMode as number)
    };
  }

  private getCompressorProfileCompressorVector(compressors: Array<CompressorProfileCompressor>): CompressorProfileCompressorV {
    let compressorVector: CompressorProfileCompressorV = new this.toolsSuiteApiService.ToolsSuiteModule.CompressorProfileCompressorV();
    compressors.forEach((compressor: CompressorProfileCompressor) => {
      compressorVector.push_back(this.getCompressorProfileCompressor(compressor));
    });
    return compressorVector;
  }

  private getCompressorProfileCompressor(compressor: CompressorProfileCompressor): CompressorProfileCompressor {
    return {
      ...compressor,
      compressorType: this.suiteApiHelperService.getCompressorTypeEnum(this.getSuiteEnumNumber(compressor.compressorType)),
      control: this.suiteApiHelperService.getControlTypeEnum(this.getSuiteEnumNumber(compressor.control)),
      stage: this.suiteApiHelperService.getStageEnum(this.getSuiteEnumNumber(compressor.stage)),
      lubricant: this.suiteApiHelperService.getLubricantEnum(this.getSuiteEnumNumber(compressor.lubricant))
    };
  }

  private getCompressorProfileRowVector(profileRows: Array<CompressorProfileRow>): CompressorProfileRowV {
    let rowVector: CompressorProfileRowV = new this.toolsSuiteApiService.ToolsSuiteModule.CompressorProfileRowV();
    profileRows.forEach((profileRow: CompressorProfileRow) => {
      rowVector.push_back(profileRow);
    });
    return rowVector;
  }

  private getCompressorProfileTotalVector(profileTotals: Array<CompressorProfileTotal>): CompressorProfileTotalV {
    let totalVector: CompressorProfileTotalV = new this.toolsSuiteApiService.ToolsSuiteModule.CompressorProfileTotalV();
    profileTotals.forEach((profileTotal: CompressorProfileTotal) => {
      totalVector.push_back(profileTotal);
    });
    return totalVector;
  }

  private getCompressorRuntimeStateVector(runtimeStates: Array<CompressorRuntimeState>): CompressorRuntimeStateV {
    let runtimeStateVector: CompressorRuntimeStateV = new this.toolsSuiteApiService.ToolsSuiteModule.CompressorRuntimeStateV();
    runtimeStates.forEach((runtimeState: CompressorRuntimeState) => {
      runtimeStateVector.push_back(runtimeState);
    });
    return runtimeStateVector;
  }

  private getCompressorTrimSelectionVector(trimSelections: Array<CompressorTrimSelection>): CompressorTrimSelectionV {
    let trimSelectionVector: CompressorTrimSelectionV = new this.toolsSuiteApiService.ToolsSuiteModule.CompressorTrimSelectionV();
    trimSelections.forEach((trimSelection: CompressorTrimSelection) => {
      trimSelectionVector.push_back(trimSelection);
    });
    return trimSelectionVector;
  }

  private copyCompressorProfileRows(rowVector: CompressorProfileRowV): Array<CompressorProfileRow> {
    let rows: Array<CompressorProfileRow> = [];
    for (let index: number = 0; index < rowVector.size(); index++) {
      let row: CompressorProfileRow = rowVector.get(index);
      rows.push({
        compressorId: row.compressorId,
        dayTypeId: row.dayTypeId,
        timeIntervalHr: row.timeIntervalHr,
        operatingOrder: row.operatingOrder,
        powerKw: row.powerKw,
        airflowAcfm: row.airflowAcfm,
        powerFraction: row.powerFraction,
        airflowFraction: row.airflowFraction,
        systemPowerFraction: row.systemPowerFraction,
        systemAirflowFraction: row.systemAirflowFraction,
        powerFactor: row.powerFactor,
        amps: row.amps,
        volts: row.volts
      });
    }
    return rows;
  }

  private copyCompressorProfileTotals(totalVector: CompressorProfileTotalV): Array<CompressorProfileTotal> {
    let totals: Array<CompressorProfileTotal> = [];
    for (let index: number = 0; index < totalVector.size(); index++) {
      let total: CompressorProfileTotal = totalVector.get(index);
      totals.push({
        dayTypeId: total.dayTypeId,
        timeIntervalHr: total.timeIntervalHr,
        airflowAcfm: total.airflowAcfm,
        powerKw: total.powerKw,
        totalPowerKw: total.totalPowerKw,
        airflowFraction: total.airflowFraction,
        powerFraction: total.powerFraction,
        auxiliaryPowerKw: total.auxiliaryPowerKw
      });
    }
    return totals;
  }
}
