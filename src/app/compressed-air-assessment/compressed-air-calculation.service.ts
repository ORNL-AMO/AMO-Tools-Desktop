import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CompressorInventoryItem } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirSuiteApiService } from '../tools-suite-api/compressed-air-suite-api.service';
import { ConvertCompressedAirService } from './convert-compressed-air.service';
import { InventoryService } from './baseline-tab-content/inventory-setup/inventory/inventory.service';
import { CompressorTypeOptions, ControlTypes } from './baseline-tab-content/inventory-setup/inventory/inventoryOptions';
import { CompressorInventoryItemClass } from './calculations/CompressorInventoryItemClass';


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


@Injectable()
export class CompressedAirCalculationService {

  constructor(private inventoryService: InventoryService,
    private convertUnitsService: ConvertUnitsService, private convertCompressedAirService: ConvertCompressedAirService, private compressedAirSuiteApiService: CompressedAirSuiteApiService) { }


  //computeFrom
  // 0 = PercentagePower,
  // 1 = PercentageCapacity,
  // 2 = PowerMeasured,
  // 3 = CapacityMeasured,
  // 4 = PowerFactor (Volt amps and powerfactor)

  compressorsCalc(compressor: CompressorInventoryItem | CompressorInventoryItemClass, settings: Settings, computeFrom: number, computeFromVal: number, atmosphericPressure: number, totalAirStorage: number, additionalRecieverVolume?: number, canShutdown?: boolean, powerFactorData?: { amps: number, volts: number }): CompressorCalcResult {
    let isShutdown: boolean = false;
    let hasShutdownTimer: boolean = this.inventoryService.checkDisplayAutomaticShutdown(compressor.compressorControls.controlType) && compressor.compressorControls.automaticShutdown;
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