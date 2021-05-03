import { Injectable } from '@angular/core';
import { CompressorInventoryItem } from '../shared/models/compressed-air-assessment';
import { CompressorTypeOptions, ControlTypes } from './inventory/inventoryOptions';


declare var compressorAddon: any;

enum CompressorType {
  Centrifugal,
  Screw,
  Reciprocating
};

enum ControlType {
  LoadUnload,
  ModulationUnload,
  BlowOff,
  ModulationWOUnload,
  StartStop,
  VariableDisplacementUnload,
  MultiStepUnloading,
  VFD
};

enum Stage {
  Single,
  Two,
  Multiple
};

enum Lubricant {
  Injected,
  Free,
  None
};

enum Modulation {
  Throttle,
  VariableDisplacement
};

enum ComputeFrom {
  PercentagePower,
  PercentageCapacity,
  PowerMeasured,
  CapacityMeasured,
  PowerFactor
};


@Injectable({
  providedIn: 'root'
})
export class CompressedAirCalculationService {

  constructor() { }

  test() {
    console.log(compressorAddon);
    // var input = {
    //   compressorType: 0,
    //   controlType: 0,
    //   computeFrom: 0,

    //   fullLoadPressure: 100,

    //   powerAtFullLoad: 452.3,
    //   capacityAtFullLoad: 3138,

    //   capacityAtMinFullLoadPressure: 3200,
    //   capacityAtMaxFullLoadPressure: 2885,
    //   minFullLoadPressure: 91,
    //   maxFullLoadPressure: 117,

    //   computeFromVal: 0.36,
    //   computeFromPFVoltage: 0,
    //   computeFromPFAmps: 0,

    //   powerAtNoLoad: 71.3,
    //   capacityAtMaxFullFlow: 3005,
    //   powerAtUnload: 411.9,
    //   capacityAtUnload: 2731,
    //   adjustForDischargePressure: false
    // };
    // let testCalc = compressorAddon.CompressorsCalc(input);
    // console.log(testCalc);
  }

  compressorsCalc(compressor: CompressorInventoryItem): CompressorCalcResult {
    //TODO: validation and conversions
    let inputData: CompressorsCalcInput = this.getInputFromInventoryItem(compressor);
    let results: CompressorCalcResult = compressorAddon.CompressorCalc(inputData);
    return results;
  }

  getInputFromInventoryItem(compressor: CompressorInventoryItem): CompressorsCalcInput {
    //TODO: double check input mapping
    //TODO: figure oout computeFrom meaning...
    let compressorEnumVal: number = this.getCompressorTypeEnumValue(compressor);
    let controlTypeEnumVal: number = this.getControlTypeEnumValue(compressor);
    return {
      compressorType: compressorEnumVal,
      controlType: controlTypeEnumVal,
      computeFrom: 0,
      fullLoadPressure: compressor.nameplateData.fullLoadOperatingPressure,
      powerAtFullLoad: compressor.nameplateData.ratedLoadPower,
      capacityAtFullLoad: compressor.nameplateData.fullLoadRatedCapacity,
      capacityAtMinFullLoadPressure: compressor.centrifugalSpecifics.minFullLoadCapacity,
      capacityAtMaxFullLoadPressure: compressor.centrifugalSpecifics.maxFullLoadCapacity,
      minFullLoadPressure: compressor.centrifugalSpecifics.minFullLoadPressure,
      maxFullLoadPressure: compressor.centrifugalSpecifics.maxFullLoadPressure,
      computeFromVal: 0,
      computeFromPFVoltage: 0,
      computeFromPFAmps: 0,
      powerAtNoLoad: compressor.performancePoints.noLoad.power,
      capacityAtMaxFullFlow: compressor.performancePoints.maxFullFlow.airflow,
      powerAtUnload: compressor.performancePoints.unloadPoint.power,
      capacityAtUnload: compressor.performancePoints.unloadPoint.airflow,
      adjustForDischargePressure: false

    }
  }

  getCompressorTypeEnumValue(compressor: CompressorInventoryItem): number {
    let selectedOption = CompressorTypeOptions.find(option => { return option.value == compressor.nameplateData.compressorType });
    if (selectedOption) {
      return selectedOption.enumValue;
    } else {
      return;
    }
  }
  
  getControlTypeEnumValue(compressor: CompressorInventoryItem): number {
    let selectedOption = ControlTypes.find(option => { return option.value == compressor.compressorControls.controlType });
    if (selectedOption) {
      return selectedOption.enumValue;
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
}

export interface CompressorsCalcInput {
  compressorType: number,
  controlType: number,
  computeFrom: number,

  fullLoadPressure: number,

  powerAtFullLoad: number,
  capacityAtFullLoad: number,

  capacityAtMinFullLoadPressure: number,
  capacityAtMaxFullLoadPressure: number,
  minFullLoadPressure: number,
  maxFullLoadPressure: number,

  computeFromVal: number,
  computeFromPFVoltage: number,
  computeFromPFAmps: number,

  powerAtNoLoad: number,
  capacityAtMaxFullFlow: number,
  powerAtUnload: number,
  capacityAtUnload: number,
  adjustForDischargePressure: boolean,

  lubricantType?: number,
  stageType?: number
}