import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CompressedAirDayType, CompressorInventoryItem, ImproveEndUseEfficiency, MultiCompressorSystemControls, PerformancePoint, PerformancePoints, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntime, ReduceRuntimeData } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirSuiteApiService } from '../tools-suite-api/compressed-air-suite-api.service';
import { ConvertCompressedAirService } from './convert-compressed-air.service';
import { InventoryService } from './baseline-tab-content/inventory-setup/inventory/inventory.service';
import { CompressorTypeOptions, ControlTypes } from './baseline-tab-content/inventory-setup/inventory/inventoryOptions';
import { CompressorInventoryItemClass } from './calculations/CompressorInventoryItemClass';
import { InventoryFormService } from './baseline-tab-content/inventory-setup/inventory/inventory-form.service';
import { CompressedAirProfileSummary } from './calculations/CompressedAirProfileSummary';
import { getTotalAuxiliaryPower } from './calculations/caCalculationHelpers';
import * as _ from 'lodash';


// enum CompressorType {
//   Centrifugal,
//   Screw,
//   Reciprocating
// };

// enum ControlType {
//   LoadUnload,
//   ModulationUnload,
//   BlowOff,
//   ModulationWOUnload,
//   StartStop,
//   VariableDisplacementUnload,
//   MultiStepUnloading,
//   VFD
// };

// enum Stage {
//   Single,
//   Two,
//   Multiple
// };

// enum Lubricant {
//   Injected,
//   Free,
//   None
// };

// enum Modulation {
//   Throttle,
//   VariableDisplacement
// };

// enum ComputeFrom {
//   PercentagePower,
//   PercentageCapacity,
//   PowerMeasured,
//   CapacityMeasured,
//   PowerFactor
// };

interface SuitePerformancePoint {
  dischargePressurePsig: number;
  isDefaultPressure: boolean;
  airflowAcfm: number;
  isDefaultAirflow: boolean;
  powerKw: number;
  isDefaultPower: boolean;
}

interface SuitePerformancePoints {
  fullLoad: SuitePerformancePoint;
  maxFullFlow: SuitePerformancePoint;
  midTurndown: SuitePerformancePoint;
  turndown: SuitePerformancePoint;
  unloadPoint: SuitePerformancePoint;
  noLoad: SuitePerformancePoint;
  blowoff: SuitePerformancePoint;
}

interface SuiteProfileRow {
  compressorId: string;
  dayTypeId: string;
  timeIntervalHr: number;
  operatingOrder: number;
  powerKw: number;
  airflowAcfm: number;
  powerFraction: number;
  airflowFraction: number;
  systemPowerFraction: number;
  systemAirflowFraction: number;
  powerFactor: number;
  amps: number;
  volts: number;
}

interface SuiteProfileTotal {
  dayTypeId: string;
  timeIntervalHr: number;
  airflowAcfm: number;
  powerKw: number;
  totalPowerKw: number;
  airflowFraction: number;
  powerFraction: number;
  auxiliaryPowerKw: number;
}

interface SuiteProfileCompressor {
  compressorId: string;
  compressorType: number;
  control: number;
  stage: number;
  lubricant: number;
  automaticShutdown: boolean;
  performancePoints: SuitePerformancePoints;
  blowdownTimeSec: number;
  unloadSumpPressurePsig: number;
  noLoadPowerFractionForModulation: number;
  modulatingPressurePsig: number;
}

interface SuiteProfileOptions {
  dayTypeId: string;
  inputBasis: number;
  controlMode: number;
  atmosphericPressurePsia: number;
  totalAirStorageFt3: number;
  additionalReceiverVolumeFt3: number;
  canShutdown: boolean;
}

interface SuiteRuntimeState {
  compressorId: string;
  dayTypeId: string;
  timeIntervalHr: number;
  isCompressorOn: boolean;
  automaticShutdownTimer: boolean;
}

interface SuiteTrimSelection {
  dayTypeId: string;
  compressorId: string;
}


@Injectable()
export class CompressedAirCalculationService {

  constructor(
    private convertUnitsService: ConvertUnitsService, private convertCompressedAirService: ConvertCompressedAirService, private compressedAirSuiteApiService: CompressedAirSuiteApiService,
    private inventoryFormService: InventoryFormService) { }


  //computeFrom
  // 0 = PercentagePower,
  // 1 = PercentageCapacity,
  // 2 = PowerMeasured,
  // 3 = CapacityMeasured,
  // 4 = PowerFactor (Volt amps and powerfactor)

  compressorsCalc(compressor: CompressorInventoryItem | CompressorInventoryItemClass, settings: Settings, computeFrom: number, computeFromVal: number, atmosphericPressure: number, totalAirStorage: number, additionalRecieverVolume?: number, canShutdown?: boolean, powerFactorData?: { amps: number, volts: number }): CompressorCalcResult {
    let isShutdown: boolean = false;
    let hasShutdownTimer: boolean = this.inventoryFormService.checkDisplayAutomaticShutdown(compressor.compressorControls.controlType) && compressor.compressorControls.automaticShutdown;
    if (canShutdown && (computeFrom == 1 || computeFrom == 3) && computeFromVal == 0) {
      if (hasShutdownTimer) {
        isShutdown = true;
      }
    }
    //TODO: conversions
    //Removed validation for compressors when calling here. Tooo slow
    // let isValid: boolean = this.inventoryService.isCompressorValid(compressor);
    if (!isShutdown) {
      let results: CompressorCalcResult;
      if (compressor.nameplateData.compressorType == 6) {
        let inputData: CentrifugalInput = this.getCentrifugalInput(compressor, computeFrom, computeFromVal);
        if (settings.unitsOfMeasure == 'Metric') {
          inputData = this.convertCompressedAirService.convertCentrifugalInputObject(inputData);
        }
        //power factor/amps/volts
        if (computeFrom == 4) {
          inputData.computeFromPFVoltage = powerFactorData.volts;
          inputData.computeFromPFAmps = powerFactorData.amps;
        }
        results = this.suiteCompressorCalcCentrifugal(inputData);
        if (settings.unitsOfMeasure == 'Metric') {
          results = this.convertCompressedAirService.convertResults(results);
        }
        results.percentagePower = results.percentagePower * 100;
        results.percentageCapacity = results.percentageCapacity * 100;
        if (results.capacityCalculated < 0.001) {
          results.capacityCalculated = 0;
          results.percentageCapacity = 0;
        }
      } else {
        let inputData: CompressorsCalcInput = this.getInputFromInventoryItem(compressor, computeFrom, computeFromVal, atmosphericPressure, totalAirStorage, additionalRecieverVolume);
        if (settings.unitsOfMeasure == 'Metric') {
          inputData = this.convertCompressedAirService.convertInputObject(inputData, compressor.compressorControls.controlType);
        } else {
          inputData.receiverVolume = this.convertUnitsService.value(inputData.receiverVolume).from('gal').to('ft3');
        }
        //power factor/amps/volts
        if (computeFrom == 4) {
          inputData.computeFromPFVoltage = powerFactorData.volts;
          inputData.computeFromPFAmps = powerFactorData.amps;
        }
        results = this.suiteCompressorCalc(inputData);
        if (settings.unitsOfMeasure == 'Metric') {
          results = this.convertCompressedAirService.convertResults(results);
        }
        results.percentagePower = results.percentagePower * 100;
        results.percentageCapacity = results.percentageCapacity * 100;
        if (results.capacityCalculated < 0.001) {
          results.capacityCalculated = 0;
          results.percentageCapacity = 0;
        }
      }
      if (canShutdown && (computeFrom == 1 || computeFrom == 3) && results.capacityCalculated == 0) {
        if (hasShutdownTimer) {
          return this.getEmptyCalcResults();
        }
      }

      return results;
    } else {
      return this.getEmptyCalcResults();
    }
  }


  suiteCompressorCalcCentrifugal(inputData: CentrifugalInput): CompressorCalcResult {
    try {
      return this.compressedAirSuiteApiService.compressorCalcCentrifugal(inputData);
    } catch (err) {
      console.log(err);
      return this.getEmptyCalcResults();
    }
  }

  suiteCompressorCalc(inputData: CompressorsCalcInput): CompressorCalcResult {
    try {
      return this.compressedAirSuiteApiService.compressorCalc(inputData);
    } catch (err) {
      console.log(err);
      return this.getEmptyCalcResults();
    }
  }

  updatePerformancePoints(compressor: CompressorInventoryItem | CompressorInventoryItemClass, atmosphericPressure: number, settings: Settings): PerformancePoints {
    let input = this.getPerformancePointInput(compressor, atmosphericPressure, settings);
    let suitePoints: SuitePerformancePoints = this.compressedAirSuiteApiService.generatePerformancePoints(input) as SuitePerformancePoints;
    return this.getPerformancePointsFromSuite(suitePoints, settings);
  }

  adjustPerformancePointsForSequencer(
    compressor: CompressorInventoryItem | CompressorInventoryItemClass,
    targetPressure: number,
    variance: number,
    atmosphericPressure: number,
    settings: Settings
  ): PerformancePoints {
    let compressorInput = this.getPerformancePointInput(compressor, atmosphericPressure, settings);
    let suiteTargetPressure: number = this.getPressureForSuite(targetPressure, settings);
    let suiteVariance: number = this.getPressureVarianceForSuite(variance, settings);
    let suitePoints: SuitePerformancePoints = this.compressedAirSuiteApiService.adjustPerformancePointsForSequencer({
      compressor: compressorInput,
      targetPressurePsig: suiteTargetPressure,
      variancePsig: suiteVariance
    }) as SuitePerformancePoints;
    return this.getPerformancePointsFromSuite(suitePoints, settings);
  }

  reduceSystemPressurePerformancePoints(
    compressor: CompressorInventoryItem | CompressorInventoryItemClass,
    pressureReduction: number,
    atmosphericPressure: number,
    settings: Settings
  ): PerformancePoints {
    let compressorInput = this.getPerformancePointInput(compressor, atmosphericPressure, settings);
    let suitePressureReduction: number = this.getPressureVarianceForSuite(pressureReduction, settings);
    let suitePoints: SuitePerformancePoints = this.compressedAirSuiteApiService.reduceSystemPressurePerformancePoints({
      compressor: compressorInput,
      pressureReductionPsig: suitePressureReduction
    }) as SuitePerformancePoints;
    return this.getPerformancePointsFromSuite(suitePoints, settings);
  }

  adjustCascadingSetPointPerformancePoints(
    compressor: CompressorInventoryItem | CompressorInventoryItemClass,
    fullLoadPressure: number,
    maxFullFlowPressure: number,
    atmosphericPressure: number,
    settings: Settings
  ): PerformancePoints {
    let compressorInput = this.getPerformancePointInput(compressor, atmosphericPressure, settings);
    let suitePoints: SuitePerformancePoints = this.compressedAirSuiteApiService.adjustCascadingSetPointPerformancePoints({
      compressor: compressorInput,
      fullLoadPressurePsig: this.getPressureForSuite(fullLoadPressure, settings),
      maxFullFlowPressurePsig: this.getPressureForSuite(maxFullFlowPressure, settings)
    }) as SuitePerformancePoints;
    return this.getPerformancePointsFromSuite(suitePoints, settings);
  }

  getRatedSpecificPower(compressor: CompressorInventoryItem | CompressorInventoryItemClass, settings: Settings): number {
    let suiteCompressor: CompressorInventoryItem = this.getCompressorForSuite(compressor, settings);
    let ratedSpecificPower: number = this.compressedAirSuiteApiService.calculateRatedSpecificPower(
      suiteCompressor.nameplateData.totalPackageInputPower,
      suiteCompressor.nameplateData.fullLoadRatedCapacity
    );
    if (settings.unitsOfMeasure == 'Metric') {
      let conversionHelper: number = this.convertUnitsService.value(1).from('m3/min').to('ft3/min');
      ratedSpecificPower = ratedSpecificPower / conversionHelper;
    }
    return ratedSpecificPower;
  }

  getRatedIsentropicEfficiency(compressor: CompressorInventoryItem | CompressorInventoryItemClass, settings: Settings): number {
    let suiteCompressor: CompressorInventoryItem = this.getCompressorForSuite(compressor, settings);
    let ratedSpecificPower: number = this.compressedAirSuiteApiService.calculateRatedSpecificPower(
      suiteCompressor.nameplateData.totalPackageInputPower,
      suiteCompressor.nameplateData.fullLoadRatedCapacity
    );
    return this.compressedAirSuiteApiService.calculateRatedIsentropicEfficiency(
      ratedSpecificPower,
      suiteCompressor.nameplateData.fullLoadOperatingPressure
    );
  }

  getAdjustedIsentropicEfficiency(
    compressor: CompressorInventoryItem | CompressorInventoryItemClass,
    adjustedPressure: number,
    atmosphericPressure: number,
    settings: Settings
  ): number {
    let suiteCompressor: CompressorInventoryItem = this.getCompressorForSuite(compressor, settings);
    let suiteAdjustedPressure: number = this.getPressureForSuite(adjustedPressure, settings);
    let suiteAtmosphericPressure: number = this.getAtmosphericPressureForSuite(atmosphericPressure, settings);
    let inletPressure: number = suiteCompressor.designDetails.inputPressure || suiteAtmosphericPressure;
    let adjustedPower: number = this.compressedAirSuiteApiService.calculatePressureAdjustedPower(
      this.getCompressorTypeEnumValue(suiteCompressor),
      inletPressure,
      suiteAdjustedPressure,
      suiteCompressor.performancePoints.fullLoad.dischargePressure,
      suiteCompressor.performancePoints.fullLoad.power,
      suiteAtmosphericPressure
    );
    let adjustedAirflow: number = this.compressedAirSuiteApiService.calculatePressureAdjustedAirflow(
      suiteCompressor.performancePoints.fullLoad.airflow,
      suiteAdjustedPressure,
      suiteCompressor.performancePoints.fullLoad.dischargePressure,
      suiteAtmosphericPressure
    );
    let adjustedSpecificPower: number = this.compressedAirSuiteApiService.calculateRatedSpecificPower(adjustedPower, adjustedAirflow);
    return this.compressedAirSuiteApiService.calculateRatedIsentropicEfficiency(adjustedSpecificPower, suiteAdjustedPressure);
  }

  reduceAirLeaksAirflow(fullLoadAirflow: number, useAirflow: number, leakAirflow: number, leakReductionPercent: number, settings: Settings): number {
    let result = this.compressedAirSuiteApiService.reduceAirLeaks(
      this.getAirflowForSuite(fullLoadAirflow, settings),
      this.getAirflowForSuite(useAirflow, settings),
      this.getAirflowForSuite(leakAirflow, settings),
      leakReductionPercent / 100
    );
    return this.getAirflowFromSuite(result.adjustedUseAirflowAcfm, settings);
  }

  improveEndUseEfficiencyAirflow(fullLoadAirflow: number, useAirflow: number, reducedAverageAirflow: number, settings: Settings): number {
    let result = this.compressedAirSuiteApiService.improveEndUseEfficiency(
      this.getAirflowForSuite(fullLoadAirflow, settings),
      this.getAirflowForSuite(useAirflow, settings),
      this.getAirflowForSuite(reducedAverageAirflow, settings)
    );
    return this.getAirflowFromSuite(result.reducedAirflowAcfm, settings);
  }

  calculatePressureReducedAirflow(
    useAirflow: number,
    adjustedFullLoadPressure: number,
    atmosphericPressure: number,
    originalFullLoadPressure: number,
    settings: Settings
  ): number {
    let suiteAtmosphericPressure: number = this.getAtmosphericPressureForSuite(atmosphericPressure, settings);
    let result: number = this.compressedAirSuiteApiService.calculatePressureReducedAirflow(
      this.getAirflowForSuite(useAirflow, settings),
      this.getPressureForSuite(adjustedFullLoadPressure, settings),
      suiteAtmosphericPressure,
      this.getPressureForSuite(originalFullLoadPressure, settings),
      suiteAtmosphericPressure
    );
    return this.getAirflowFromSuite(result, settings);
  }

  calculateBaselineProfileSummary(
    inventoryItems: Array<CompressorInventoryItemClass>,
    baselineProfileSummary: Array<CompressedAirProfileSummary>,
    dayType: CompressedAirDayType,
    settings: Settings,
    atmosphericPressure: number,
    totalAirStorage: number,
    systemControlMode: MultiCompressorSystemControls,
    additionalReceiverVolume: number = 0,
    canShutdown: boolean = true
  ): Array<CompressedAirProfileSummary> {
    
    let compressors: Array<SuiteProfileCompressor> = this.getSuiteProfileCompressors(inventoryItems, settings);
    let profileRows: Array<SuiteProfileRow> = this.getSuiteRowsFromProfileSummaries(baselineProfileSummary, settings);
    let options: SuiteProfileOptions = this.getSuiteProfileOptions(
      dayType.dayTypeId,
      this.getComputeFromForProfileDataType(dayType.profileDataType),
      systemControlMode,
      atmosphericPressure,
      totalAirStorage,
      additionalReceiverVolume,
      canShutdown,
      settings
    );
    let suiteRows: Array<SuiteProfileRow> = this.compressedAirSuiteApiService.calculateBaselineProfile(compressors, profileRows, options) as Array<SuiteProfileRow>;
    return this.getProfileSummariesFromSuiteRows(baselineProfileSummary, suiteRows, settings);
  }

  calculateProfileSummaryTotals(
    selectedHourInterval: number,
    profileSummary: Array<CompressedAirProfileSummary>,
    selectedDayType: CompressedAirDayType,
    improveEndUseEfficiency: ImproveEndUseEfficiency,
    inventoryItems: Array<CompressorInventoryItemClass>,
    settings: Settings
  ): Array<ProfileSummaryTotal> {
    let compressors: Array<SuiteProfileCompressor> = this.getSuiteProfileCompressors(inventoryItems, settings);
    let profileRows: Array<SuiteProfileRow> = this.getSuiteRowsFromProfileSummaries(profileSummary, settings);
    let suiteTotals: Array<SuiteProfileTotal> = this.compressedAirSuiteApiService.calculateProfileTotals(
      compressors,
      profileRows,
      selectedHourInterval
    ) as Array<SuiteProfileTotal>;
    return suiteTotals
      .filter((total: SuiteProfileTotal) => total.dayTypeId == selectedDayType.dayTypeId)
      .map((total: SuiteProfileTotal) => {
        let auxiliaryPower: number = getTotalAuxiliaryPower(selectedDayType, total.timeIntervalHr, improveEndUseEfficiency);
        return this.getProfileSummaryTotalFromSuite(total, settings, auxiliaryPower);
      });
  }

  reallocateProfileSummary(
    dayType: CompressedAirDayType,
    previousProfileSummary: Array<CompressedAirProfileSummary>,
    adjustedCompressors: Array<CompressorInventoryItemClass>,
    additionalReceiverVolume: number,
    totals: Array<ProfileSummaryTotal>,
    atmosphericPressure: number,
    totalAirStorage: number,
    systemControlMode: MultiCompressorSystemControls,
    reduceRuntime: ReduceRuntime,
    trimSelections: Array<{ dayTypeId: string, compressorId: string }>,
    settings: Settings
  ): Array<CompressedAirProfileSummary> {
    let compressors: Array<SuiteProfileCompressor> = this.getSuiteProfileCompressors(adjustedCompressors, settings);
    let previousRows: Array<SuiteProfileRow> = this.getSuiteRowsFromProfileSummaries(previousProfileSummary, settings);
    let demandRows: Array<SuiteProfileTotal> = this.getSuiteTotalsFromProfileTotals(totals, dayType.dayTypeId, settings);
    let runtimeStates: Array<SuiteRuntimeState> = this.getSuiteRuntimeStates(reduceRuntime);
    let suiteTrimSelections: Array<SuiteTrimSelection> = (trimSelections || [])
      .filter((selection: { dayTypeId: string, compressorId: string }) => {
        return Boolean(selection?.dayTypeId && selection?.compressorId);
      })
      .map((selection: { dayTypeId: string, compressorId: string }) => {
        return {
          dayTypeId: selection.dayTypeId,
          compressorId: selection.compressorId
        };
      });
    let options: SuiteProfileOptions = this.getSuiteProfileOptions(
      dayType.dayTypeId,
      3,
      systemControlMode,
      atmosphericPressure,
      totalAirStorage,
      additionalReceiverVolume,
      true,
      settings
    );
    let suiteRows: Array<SuiteProfileRow> = this.compressedAirSuiteApiService.reallocateProfileFlow(
      compressors,
      previousRows,
      demandRows,
      options,
      runtimeStates,
      suiteTrimSelections
    ) as Array<SuiteProfileRow>;
    return this.getProfileSummariesFromSuiteRows(previousProfileSummary, suiteRows, settings);
  }

  calculateProfileSavings(
    profileSummary: Array<ProfileSummary>,
    adjustedProfileSummary: Array<ProfileSummary>,
    dayType: CompressedAirDayType,
    costKwh: number,
    implementationCost: number,
    summaryDataInterval: number,
    auxiliaryPowerUsage: { cost: number, energyUse: number },
    salvageValue: number,
    settings: Settings
  ): {
    baselineEnergyKwh: number,
    baselineCost: number,
    adjustedEnergyKwh: number,
    adjustedCost: number,
    energySavingsKwh: number,
    costSavings: number,
    percentSavings: number,
    paybackMonths: number
  } {
    let baselineRows: Array<SuiteProfileRow> = this.getSuiteRowsFromProfileSummaries(profileSummary, settings);
    let adjustedRows: Array<SuiteProfileRow> = this.getSuiteRowsFromProfileSummaries(adjustedProfileSummary, settings);
    let auxiliaryEnergyKwh: number = auxiliaryPowerUsage ? auxiliaryPowerUsage.energyUse : 0;
    let result = this.compressedAirSuiteApiService.calculateProfileSavings(baselineRows, adjustedRows, {
      dayTypeId: dayType.dayTypeId,
      electricityCostPerKwh: costKwh,
      intervalHours: summaryDataInterval,
      operatingDays: dayType.numberOfDays,
      auxiliaryEnergyKwh: auxiliaryEnergyKwh,
      implementationCost: implementationCost,
      salvageValue: salvageValue
    });
    return {
      baselineEnergyKwh: result.baselineEnergyKwh,
      baselineCost: result.baselineCost,
      adjustedEnergyKwh: result.adjustedEnergyKwh,
      adjustedCost: result.adjustedCost,
      energySavingsKwh: result.energySavingsKwh,
      costSavings: result.costSavings,
      percentSavings: result.percentSavings,
      paybackMonths: result.paybackMonths
    };
  }

  getEmptyCalcResults(): CompressorCalcResult {
    return {
      powerCalculated: 0,
      capacityCalculated: 0,
      percentagePower: 0,
      percentageCapacity: 0,
      //Load/Unload, Modulation w/o unload, Start/stop
      reRatedFlow: 0,
      reRatedPower: 0,
      reRatedFlowMax: 0,
      reRatedPowerMax: 0,
      //centrifugal
      capacityAtFullLoadAdjusted: 0,
      capacityAtMaxFullFlowAdjusted: 0,
      percentageBlowOff: 0,
      surgeFlow: 0
    }
  }

  private getPerformancePointInput(compressor: CompressorInventoryItem | CompressorInventoryItemClass, atmosphericPressure: number, settings: Settings) {
    let suiteCompressor: CompressorInventoryItem = this.getCompressorForSuite(compressor, settings);
    return {
      nameplate: {
        compressorType: this.getCompressorTypeEnumValue(suiteCompressor),
        stage: this.getStageTypeEnumVal(suiteCompressor),
        lubricant: this.getLubricantTypeEnumVal(suiteCompressor),
        motorPowerHp: this.getNumberOrZero(suiteCompressor.nameplateData.motorPower),
        fullLoadOperatingPressurePsig: this.getNumberOrZero(suiteCompressor.nameplateData.fullLoadOperatingPressure),
        fullLoadRatedCapacityAcfm: this.getNumberOrZero(suiteCompressor.nameplateData.fullLoadRatedCapacity),
        ratedLoadPowerKw: this.getNumberOrZero(suiteCompressor.nameplateData.ratedLoadPower),
        polytropicCompressorExponent: this.getNumberOrZero(suiteCompressor.nameplateData.ploytropicCompressorExponent),
        fullLoadAmps: this.getNumberOrZero(suiteCompressor.nameplateData.fullLoadAmps),
        totalPackageInputPowerKw: this.getNumberOrZero(suiteCompressor.nameplateData.totalPackageInputPower)
      },
      controls: {
        control: this.getControlTypeEnumValue(suiteCompressor),
        unloadPointCapacityPct: this.getNumberOrZero(suiteCompressor.compressorControls.unloadPointCapacity),
        numberOfUnloadSteps: this.getNumberOrZero(suiteCompressor.compressorControls.numberOfUnloadSteps),
        automaticShutdown: suiteCompressor.compressorControls.automaticShutdown,
        unloadSumpPressurePsig: this.getNumberOrZero(suiteCompressor.compressorControls.unloadSumpPressure)
      },
      design: {
        blowdownTimeSec: this.getNumberOrZero(suiteCompressor.designDetails.blowdownTime),
        modulatingPressurePsig: this.getNumberOrZero(suiteCompressor.designDetails.modulatingPressureRange),
        inputPressurePsia: this.getNumberOrZero(suiteCompressor.designDetails.inputPressure),
        designEfficiencyPct: this.getNumberOrZero(suiteCompressor.designDetails.designEfficiency),
        serviceFactor: this.getNumberOrZero(suiteCompressor.designDetails.serviceFactor),
        noLoadPowerFMPercent: this.getNumberOrZero(suiteCompressor.designDetails.noLoadPowerFM),
        noLoadPowerULPercent: this.getNumberOrZero(suiteCompressor.designDetails.noLoadPowerUL),
        maxFullFlowPressurePsig: this.getNumberOrZero(suiteCompressor.designDetails.maxFullFlowPressure)
      },
      centrifugal: {
        surgeAirflowAcfm: this.getNumberOrZero(suiteCompressor.centrifugalSpecifics.surgeAirflow),
        maxFullLoadPressurePsig: this.getNumberOrZero(suiteCompressor.centrifugalSpecifics.maxFullLoadPressure),
        maxFullLoadCapacityAcfm: this.getNumberOrZero(suiteCompressor.centrifugalSpecifics.maxFullLoadCapacity),
        minFullLoadPressurePsig: this.getNumberOrZero(suiteCompressor.centrifugalSpecifics.minFullLoadPressure),
        minFullLoadCapacityAcfm: this.getNumberOrZero(suiteCompressor.centrifugalSpecifics.minFullLoadCapacity)
      },
      points: this.getPerformancePointsForSuite(suiteCompressor.performancePoints),
      atmosphericPressurePsia: this.getAtmosphericPressureForSuite(atmosphericPressure, settings)
    };
  }

  private getCompressorForSuite(compressor: CompressorInventoryItem | CompressorInventoryItemClass, settings: Settings): CompressorInventoryItem {
    let compressorModel: CompressorInventoryItem = _.cloneDeep(compressor instanceof CompressorInventoryItemClass ? compressor.toModel() : compressor);
    if (settings.unitsOfMeasure == 'Metric') {
      compressorModel = this.convertCompressedAirService.convertCompressorInventoryItems([compressorModel], settings, this.getImperialSettings(settings))[0];
      compressorModel.centrifugalSpecifics = {
        surgeAirflow: this.convertUnitsService.value(compressor.centrifugalSpecifics.surgeAirflow).from('m3/min').to('ft3/min'),
        maxFullLoadPressure: this.convertUnitsService.value(compressor.centrifugalSpecifics.maxFullLoadPressure).from('barg').to('psig'),
        maxFullLoadCapacity: this.convertUnitsService.value(compressor.centrifugalSpecifics.maxFullLoadCapacity).from('m3/min').to('ft3/min'),
        minFullLoadPressure: this.convertUnitsService.value(compressor.centrifugalSpecifics.minFullLoadPressure).from('barg').to('psig'),
        minFullLoadCapacity: this.convertUnitsService.value(compressor.centrifugalSpecifics.minFullLoadCapacity).from('m3/min').to('ft3/min')
      };
    }
    return compressorModel;
  }

  private getPerformancePointsForSuite(points: PerformancePoints): SuitePerformancePoints {
    return {
      fullLoad: this.getPerformancePointForSuite(points.fullLoad),
      maxFullFlow: this.getPerformancePointForSuite(points.maxFullFlow),
      midTurndown: this.getPerformancePointForSuite(points.midTurndown),
      turndown: this.getPerformancePointForSuite(points.turndown),
      unloadPoint: this.getPerformancePointForSuite(points.unloadPoint),
      noLoad: this.getPerformancePointForSuite(points.noLoad),
      blowoff: this.getPerformancePointForSuite(points.blowoff)
    };
  }

  private getPerformancePointForSuite(point: PerformancePoint): SuitePerformancePoint {
    return {
      dischargePressurePsig: this.getNumberOrZero(point?.dischargePressure),
      isDefaultPressure: point?.isDefaultPressure == true,
      airflowAcfm: this.getNumberOrZero(point?.airflow),
      isDefaultAirflow: point?.isDefaultAirFlow == true,
      powerKw: this.getNumberOrZero(point?.power),
      isDefaultPower: point?.isDefaultPower == true
    };
  }

  private getPerformancePointsFromSuite(points: SuitePerformancePoints, settings: Settings): PerformancePoints {
    let performancePoints: PerformancePoints = {
      fullLoad: this.getPerformancePointFromSuite(points.fullLoad),
      maxFullFlow: this.getPerformancePointFromSuite(points.maxFullFlow),
      midTurndown: this.getPerformancePointFromSuite(points.midTurndown),
      turndown: this.getPerformancePointFromSuite(points.turndown),
      unloadPoint: this.getPerformancePointFromSuite(points.unloadPoint),
      noLoad: this.getPerformancePointFromSuite(points.noLoad),
      blowoff: this.getPerformancePointFromSuite(points.blowoff)
    };
    if (settings.unitsOfMeasure == 'Metric') {
      performancePoints = this.convertCompressedAirService.convertPerformancePoints(performancePoints, this.getImperialSettings(settings), settings);
    }
    return performancePoints;
  }

  private getPerformancePointFromSuite(point: SuitePerformancePoint): PerformancePoint {
    return {
      dischargePressure: point.dischargePressurePsig,
      isDefaultPressure: point.isDefaultPressure,
      airflow: point.airflowAcfm,
      isDefaultAirFlow: point.isDefaultAirflow,
      power: point.powerKw,
      isDefaultPower: point.isDefaultPower
    };
  }

  private getSuiteProfileCompressors(compressors: Array<CompressorInventoryItem | CompressorInventoryItemClass>, settings: Settings): Array<SuiteProfileCompressor> {
    return compressors.map((compressor: CompressorInventoryItem | CompressorInventoryItemClass) => {
      let suiteCompressor: CompressorInventoryItem = this.getCompressorForSuite(compressor, settings);
      return {
        compressorId: suiteCompressor.itemId,
        compressorType: this.getCompressorTypeEnumValue(suiteCompressor),
        control: this.getControlTypeEnumValue(suiteCompressor),
        stage: this.getStageTypeEnumVal(suiteCompressor),
        lubricant: this.getLubricantTypeEnumVal(suiteCompressor),
        automaticShutdown: suiteCompressor.compressorControls.automaticShutdown,
        performancePoints: this.getPerformancePointsForSuite(suiteCompressor.performancePoints),
        blowdownTimeSec: this.getNumberOrZero(suiteCompressor.designDetails.blowdownTime),
        unloadSumpPressurePsig: this.getNumberOrZero(suiteCompressor.compressorControls.unloadSumpPressure),
        noLoadPowerFractionForModulation: this.getNumberOrZero(suiteCompressor.designDetails.noLoadPowerFM) / 100,
        modulatingPressurePsig: this.getNumberOrZero(suiteCompressor.designDetails.modulatingPressureRange)
      };
    });
  }

  private getSuiteRowsFromProfileSummaries(profileSummary: Array<ProfileSummary>, settings: Settings): Array<SuiteProfileRow> {
    return _.flatMap(profileSummary, (summary: ProfileSummary) => {
      return summary.profileSummaryData.map((data: ProfileSummaryData) => {
        return this.getSuiteProfileRow(summary.compressorId, summary.dayTypeId, data, settings);
      });
    });
  }

  private getSuiteProfileRow(compressorId: string, dayTypeId: string, data: ProfileSummaryData, settings: Settings): SuiteProfileRow {
    return {
      compressorId: compressorId,
      dayTypeId: dayTypeId,
      timeIntervalHr: data.timeInterval,
      operatingOrder: data.order || 0,
      powerKw: this.getNumberOrZero(data.power),
      airflowAcfm: this.getAirflowForSuite(this.getNumberOrZero(data.airflow), settings),
      powerFraction: this.getNumberOrZero(data.percentPower) / 100,
      airflowFraction: this.getNumberOrZero(data.percentCapacity) / 100,
      systemPowerFraction: this.getNumberOrZero(data.percentSystemPower) / 100,
      systemAirflowFraction: this.getNumberOrZero(data.percentSystemCapacity) / 100,
      powerFactor: this.getNumberOrZero(data.powerFactor),
      amps: this.getNumberOrZero(data.amps),
      volts: this.getNumberOrZero(data.volts)
    };
  }

  private getProfileSummariesFromSuiteRows(
    profileSummary: Array<ProfileSummary>,
    suiteRows: Array<SuiteProfileRow>,
    settings: Settings
  ): Array<CompressedAirProfileSummary> {
    return profileSummary.map((summary: ProfileSummary) => {
      let profile: CompressedAirProfileSummary = new CompressedAirProfileSummary(summary, false);
      profile.profileSummaryData = _.orderBy(suiteRows.filter((row: SuiteProfileRow) => {
        return row.compressorId == summary.compressorId && row.dayTypeId == summary.dayTypeId;
      }), (row: SuiteProfileRow) => row.timeIntervalHr).map((row: SuiteProfileRow) => {
        return this.getProfileSummaryDataFromSuite(row, settings);
      });
      profile.setAvgAirflow();
      profile.setAvgPower();
      profile.setAvgPercentPower();
      profile.setAvgPercentCapacity();
      return profile;
    });
  }

  private getProfileSummaryDataFromSuite(row: SuiteProfileRow, settings: Settings): ProfileSummaryData {
    let airflow: number = this.getAirflowFromSuite(row.airflowAcfm, settings);
    if (airflow < 0.001) {
      airflow = 0;
    }
    return {
      power: row.powerKw,
      airflow: airflow,
      percentCapacity: row.airflowFraction * 100,
      timeInterval: row.timeIntervalHr,
      percentPower: row.powerFraction * 100,
      percentSystemCapacity: row.systemAirflowFraction * 100,
      percentSystemPower: row.systemPowerFraction * 100,
      order: row.operatingOrder,
      powerFactor: row.powerFactor,
      amps: row.amps,
      volts: row.volts
    };
  }

  private getSuiteTotalsFromProfileTotals(totals: Array<ProfileSummaryTotal>, dayTypeId: string, settings: Settings): Array<SuiteProfileTotal> {
    return totals.map((total: ProfileSummaryTotal) => {
      return {
        dayTypeId: dayTypeId,
        timeIntervalHr: total.timeInterval,
        airflowAcfm: this.getAirflowForSuite(total.airflow, settings),
        powerKw: total.power,
        totalPowerKw: total.totalPower,
        airflowFraction: this.getNumberOrZero(total.percentCapacity) / 100,
        powerFraction: this.getNumberOrZero(total.percentPower) / 100,
        auxiliaryPowerKw: total.auxiliaryPower || 0
      };
    });
  }

  private getProfileSummaryTotalFromSuite(total: SuiteProfileTotal, settings: Settings, auxiliaryPower: number): ProfileSummaryTotal {
    return {
      auxiliaryPower: auxiliaryPower,
      airflow: this.getAirflowFromSuite(total.airflowAcfm, settings),
      power: total.powerKw,
      totalPower: total.totalPowerKw,
      percentCapacity: total.airflowFraction * 100,
      percentPower: total.powerFraction * 100,
      timeInterval: total.timeIntervalHr
    };
  }

  private getSuiteRuntimeStates(reduceRuntime: ReduceRuntime): Array<SuiteRuntimeState> {
    if (!reduceRuntime) {
      return [];
    }
    return _.flatMap(reduceRuntime.runtimeData, (runtimeData: ReduceRuntimeData) => {
      return runtimeData.intervalData.map((intervalData: { isCompressorOn: boolean, timeInterval: number }) => {
        return {
          compressorId: runtimeData.compressorId,
          dayTypeId: runtimeData.dayTypeId,
          timeIntervalHr: intervalData.timeInterval,
          isCompressorOn: intervalData.isCompressorOn,
          automaticShutdownTimer: runtimeData.automaticShutdownTimer
        };
      });
    });
  }

  private getSuiteProfileOptions(
    dayTypeId: string,
    computeFrom: number,
    controlMode: MultiCompressorSystemControls,
    atmosphericPressure: number,
    totalAirStorage: number,
    additionalReceiverVolume: number,
    canShutdown: boolean,
    settings: Settings
  ): SuiteProfileOptions {
    return {
      dayTypeId: dayTypeId,
      inputBasis: computeFrom,
      controlMode: this.getSystemControlModeEnumValue(controlMode),
      atmosphericPressurePsia: this.getAtmosphericPressureForSuite(atmosphericPressure, settings),
      totalAirStorageFt3: this.getReceiverVolumeForSuite(totalAirStorage, settings),
      additionalReceiverVolumeFt3: this.getReceiverVolumeForSuite(additionalReceiverVolume || 0, settings),
      canShutdown: canShutdown
    };
  }

  private getComputeFromForProfileDataType(profileDataType: string): 0 | 1 | 2 | 3 | 4 {
    if (profileDataType == 'power') {
      return 2;
    } else if (profileDataType == 'percentCapacity') {
      return 1;
    } else if (profileDataType == 'airflow') {
      return 3;
    } else if (profileDataType == 'percentPower') {
      return 0;
    } else if (profileDataType == 'powerFactor') {
      return 4;
    }
  }

  private getSystemControlModeEnumValue(controlMode: MultiCompressorSystemControls): number {
    if (controlMode == 'cascading') {
      return 0;
    } else if (controlMode == 'isentropicEfficiency') {
      return 1;
    } else if (controlMode == 'loadSharing') {
      return 2;
    } else if (controlMode == 'targetPressureSequencer') {
      return 3;
    } else if (controlMode == 'baseTrim') {
      return 4;
    }
  }

  private getPressureForSuite(pressure: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(pressure).from('barg').to('psig');
    }
    return pressure;
  }

  private getPressureVarianceForSuite(pressure: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(pressure).from('bara').to('psia');
    }
    return pressure;
  }

  private getAtmosphericPressureForSuite(atmosphericPressure: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(atmosphericPressure).from('kPaa').to('psia');
    }
    return atmosphericPressure;
  }

  private getAirflowForSuite(airflow: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(airflow).from('m3/min').to('ft3/min');
    }
    return airflow;
  }

  private getAirflowFromSuite(airflow: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(airflow).from('ft3/min').to('m3/min');
    }
    return airflow;
  }

  private getReceiverVolumeForSuite(receiverVolume: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(receiverVolume).from('m3').to('ft3');
    }
    return this.convertUnitsService.value(receiverVolume).from('gal').to('ft3');
  }

  private getImperialSettings(settings: Settings): Settings {
    return {
      ...settings,
      unitsOfMeasure: 'Imperial'
    };
  }

  private getNumberOrZero(value: number): number {
    if (value == undefined || isNaN(value)) {
      return 0;
    }
    return value;
  }

  getCentrifugalInput(compressor: CompressorInventoryItem | CompressorInventoryItemClass, computeFrom: number, computeFromVal: number): CentrifugalInput {
    let compressorEnumVal: number = this.getCompressorTypeEnumValue(compressor);
    let controlTypeEnumVal: number = this.getControlTypeEnumValue(compressor);
    if (computeFrom == 0 || computeFrom == 1) {
      computeFromVal = computeFromVal / 100;
    }


    return {
      computeFrom: computeFrom,
      computeFromVal: computeFromVal,
      computeFromPFVoltage: 0,
      computeFromPFAmps: 0,

      compressorType: compressorEnumVal,
      controlType: controlTypeEnumVal,

      fullLoadPressure: compressor.performancePoints.fullLoad.dischargePressure,
      powerAtFullLoad: compressor.performancePoints.fullLoad.power,
      capacityAtFullLoad: compressor.performancePoints.fullLoad.airflow,

      capacityAtMinFullLoadPressure: compressor.centrifugalSpecifics.minFullLoadCapacity,
      capacityAtMaxFullLoadPressure: compressor.centrifugalSpecifics.maxFullLoadCapacity,

      minFullLoadPressure: compressor.centrifugalSpecifics.minFullLoadPressure,
      maxFullLoadPressure: compressor.centrifugalSpecifics.maxFullLoadPressure,
      //base on use default selection in performance points
      adjustForDischargePressure: true,
      // applyPressureInletCorrection: true,
      //centrifugal
      powerAtBlowOff: compressor.performancePoints.blowoff.power,
      surgeFlow: compressor.performancePoints.blowoff.airflow,
      //TODO: percentageBlowOff
      percentageBlowOff: 100 / 100,

      powerAtNoLoad: compressor.performancePoints.noLoad.power,
      maxPressure: compressor.performancePoints.maxFullFlow.dischargePressure,
      capacityAtMaxFullFlow: compressor.performancePoints.maxFullFlow.airflow,
      capacityAtUnload: compressor.performancePoints.unloadPoint.airflow,
      powerAtUnload: compressor.performancePoints.unloadPoint.power
    }
  }

  getInputFromInventoryItem(compressor: CompressorInventoryItem | CompressorInventoryItemClass, computeFrom: number, computeFromVal: number, atmosphericPressure: number, totalAirStorage: number, additionalRecieverVolume?: number): CompressorsCalcInput {
    let compressorEnumVal: number = this.getCompressorTypeEnumValue(compressor);
    let controlTypeEnumVal: number = this.getControlTypeEnumValue(compressor);
    let stageTypeEnumVal: number = this.getStageTypeEnumVal(compressor);
    let lubricantTypeEnumValue: number = this.getLubricantTypeEnumVal(compressor);

    if (computeFrom == 0 || computeFrom == 1) {
      computeFromVal = computeFromVal / 100;
    }

    // let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let receiverVolume: number = totalAirStorage;
    if (additionalRecieverVolume) {
      receiverVolume = receiverVolume + additionalRecieverVolume;
    }
    // receiverVolume = this.convertUnitsService.value(receiverVolume).from('gal').to('ft3');

    //lubricant free
    if (lubricantTypeEnumValue == 1) {
      compressor.designDetails.blowdownTime = .0003;
      compressor.compressorControls.unloadSumpPressure = 15;
    }
    let loadFactorUnloaded: number = compressor.performancePoints.noLoad.power / compressor.performancePoints.fullLoad.power;
    return {
      computeFrom: computeFrom,
      computeFromVal: computeFromVal,
      computeFromPFVoltage: 0,
      computeFromPFAmps: 0,

      compressorType: compressorEnumVal,
      controlType: controlTypeEnumVal,
      lubricantType: lubricantTypeEnumValue,
      stageType: stageTypeEnumVal,

      // fullLoadPressure: compressor.performancePoints.fullLoad.dischargePressure,
      dischargePsiFullLoad: compressor.performancePoints.fullLoad.dischargePressure,


      powerAtFullLoad: compressor.performancePoints.fullLoad.power,

      capacityAtFullLoad: compressor.performancePoints.fullLoad.airflow,

      powerAtNoLoad: compressor.performancePoints.noLoad.power,

      capacityAtMaxFullFlow: compressor.performancePoints.maxFullFlow.airflow,

      powerAtUnload: compressor.performancePoints.unloadPoint.power,
      pressureAtUnload: compressor.performancePoints.unloadPoint.dischargePressure,

      capacityAtUnload: compressor.performancePoints.unloadPoint.airflow,


      //base on use default selection in performance points
      adjustForDischargePressure: false,
      applyPressureInletCorrection: false,

      powerMax: compressor.performancePoints.maxFullFlow.power,
      dischargePsiMax: compressor.performancePoints.maxFullFlow.dischargePressure,

      modulatingPsi: compressor.designDetails.modulatingPressureRange || 0,


      //TODO: Sort out correct pressure mapping 
      atmosphericPsi: atmosphericPressure,

      //design details inlet pressure

      //Modulation w/ unload
      powerAtNolLoad: compressor.performancePoints.noLoad.power,

      //TODO: VFD, Multi step unloading

      //Start stop
      // max power / full load power
      powerMaxPercentage: (compressor.performancePoints.maxFullFlow.power / compressor.performancePoints.fullLoad.power),

      powerAtFullLoadPercentage: 1,


      receiverVolume: receiverVolume,
      loadFactorUnloaded: loadFactorUnloaded,

      unloadPointCapacity: compressor.compressorControls.unloadPointCapacity,
      blowdownTime: compressor.designDetails.blowdownTime || 0,
      unloadSumpPressure: compressor.compressorControls.unloadSumpPressure || 0,
      noLoadPowerFM: compressor.designDetails.noLoadPowerFM / 100,
      noLoadDischargePressure: compressor.performancePoints.noLoad.dischargePressure,

      turndownAirflow: compressor.performancePoints.turndown?.airflow,
      turndownDischargePressure: compressor.performancePoints.turndown?.dischargePressure,
      turndownPower: compressor.performancePoints.turndown?.power,

      midTurndownAirflow: compressor.performancePoints.midTurndown?.airflow,
      midTurndownDischargePressure: compressor.performancePoints.midTurndown?.dischargePressure,
      midTurndownPower: compressor.performancePoints.midTurndown?.power

    }
  }

  getCompressorTypeEnumValue(compressor: CompressorInventoryItem | CompressorInventoryItemClass): number {
    let selectedOption = CompressorTypeOptions.find(option => { return option.value == compressor.nameplateData.compressorType });
    if (selectedOption) {
      return selectedOption.enumValue;
    } else {
      return;
    }
  }

  getControlTypeEnumValue(compressor: CompressorInventoryItem | CompressorInventoryItemClass): number {
    let selectedOption = ControlTypes.find(option => { return option.value == compressor.compressorControls.controlType });
    if (selectedOption) {
      return selectedOption.enumValue;
    } else {
      return;
    }
  }

  getStageTypeEnumVal(compressor: CompressorInventoryItem | CompressorInventoryItemClass): number {
    let selectedOption = CompressorTypeOptions.find(option => { return option.value == compressor.nameplateData.compressorType });
    if (selectedOption) {
      return selectedOption.stageTypeEnumValue;
    } else {
      return;
    }
  }

  getLubricantTypeEnumVal(compressor: CompressorInventoryItem | CompressorInventoryItemClass): number {
    let selectedOption = CompressorTypeOptions.find(option => { return option.value == compressor.nameplateData.compressorType });
    if (selectedOption) {
      return selectedOption.lubricantTypeEnumValue;
    } else {
      return;
    }

  }
}

export interface CompressorCalcResult {
  powerCalculated: number,
  capacityCalculated: number,
  percentagePower: number,
  percentageCapacity: number
  //Load/Unload, Modulation w/o unload, Start/stop
  reRatedFlow?: number
  reRatedPower?: number
  reRatedFlowMax?: number
  reRatedPowerMax?: number
  //centrifugal
  capacityAtFullLoadAdjusted?: number
  capacityAtMaxFullFlowAdjusted?: number
  percentageBlowOff?: number
  surgeFlow?: number

}

export interface CompressorsCalcInput {
  compressorType: number,
  controlType: number,
  computeFrom: number,

  // fullLoadPressure: number,

  powerAtFullLoad: number,
  capacityAtFullLoad: number,

  // capacityAtMinFullLoadPressure: number,
  // capacityAtMaxFullLoadPressure: number,
  // minFullLoadPressure: number,
  // maxFullLoadPressure: number,

  computeFromVal: number,
  computeFromPFVoltage: number,
  computeFromPFAmps: number,

  powerAtNoLoad: number,
  capacityAtMaxFullFlow: number,
  powerAtUnload: number,
  capacityAtUnload: number,
  adjustForDischargePressure: boolean,

  //not centfrigual
  lubricantType: number,
  stageType: number,

  //Load/Unload, Modulation w/o unload
  applyPressureInletCorrection: boolean
  powerMax: number
  dischargePsiFullLoad: number
  dischargePsiMax: number
  modulatingPsi: number
  atmosphericPsi: number


  receiverVolume: number,
  loadFactorUnloaded: number

  //centrifugal
  // powerAtBlowOff: number
  // surgeFlow: number
  // percentageBlowOff: number
  // maxPressure: number

  //Modulation w/ unload
  powerAtNolLoad: number

  //TODO: VFD, Multi step unloading

  //Start stop
  powerMaxPercentage: number
  powerAtFullLoadPercentage: number,
  unloadPointCapacity: number,
  blowdownTime: number,
  unloadSumpPressure: number,
  noLoadPowerFM: number,
  pressureAtUnload: number,
  noLoadDischargePressure: number,

  midTurndownDischargePressure: number,
  midTurndownAirflow: number,
  midTurndownPower: number,

  turndownDischargePressure: number,
  turndownAirflow: number,
  turndownPower: number

}


export interface CentrifugalInput {
  compressorType: number,
  controlType: number,
  computeFrom: number;
  adjustForDischargePressure: boolean;
  powerAtFullLoad: number;
  capacityAtFullLoad: number;
  capacityAtMinFullLoadPressure: number;
  capacityAtMaxFullLoadPressure: number;
  fullLoadPressure: number;
  minFullLoadPressure: number;
  maxFullLoadPressure: number;
  computeFromVal: number;
  computeFromPFVoltage: number;
  computeFromPFAmps: number;
  powerAtBlowOff: number;
  surgeFlow: number;
  percentageBlowOff: number;
  powerAtNoLoad: number;
  maxPressure: number,
  capacityAtMaxFullFlow: number
  powerAtUnload: number,
  capacityAtUnload: number
}

export interface ModulationWithUnloadInput {
  compressorType: number;
  controlType: number;

  computeFrom: number;
  computeFromVal: number;

  stageType: number;
  lubricantType: number;


  applyPressureInletCorrection: boolean;
  powerAtFullLoad: number;
  capacityAtFullLoad: number;
  powerMax: number;
  powerAtNolLoad: number;
  dischargePsiMax: number;
  modulatingPsi: number;
  atmosphericPsi: number;

  //applyPressureInletCorrection
  capacity: number;
  fullLoadPower: number;
  polyExponent: number;
  ratedDischargePressure: number;
  ratedInletPressure: number;
  motorEfficiency: number;
  fullLoadDischargePressure: number;
  maxDischargePressure: number;
  inletPressure: number;
  atmosphericPressure: number;
}
