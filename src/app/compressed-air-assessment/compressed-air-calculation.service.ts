import { Injectable } from '@angular/core';
import { CompressorInventoryItem } from '../shared/models/compressed-air-assessment';
import { InventoryService } from './inventory/inventory.service';
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


@Injectable()
export class CompressedAirCalculationService {

  constructor(private inventoryService: InventoryService) { }

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

  compressorsCalc(compressor: CompressorInventoryItem, computeFrom: number, computeFromVal: number): CompressorCalcResult {
    //TODO: conversions
    let isValid: boolean = this.inventoryService.isCompressorValid(compressor);
    if (isValid) {
      let inputData: CompressorsCalcInput = this.getInputFromInventoryItem(compressor, computeFrom, computeFromVal);
      let results: CompressorCalcResult = compressorAddon.CompressorCalc(inputData);
      return results;
    } else {
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
  }

  getInputFromInventoryItem(compressor: CompressorInventoryItem, computeFrom: number, computeFromVal: number): CompressorsCalcInput {
    //TODO: double check input mapping
    //TODO: figure out computeFrom meaning...
    let compressorEnumVal: number = this.getCompressorTypeEnumValue(compressor);
    let controlTypeEnumVal: number = this.getControlTypeEnumValue(compressor);
    let stageTypeEnumVal: number = this.getStageTypeEnumVal(compressor);
    let lubricantTypeEnumValue: number = this.getLubricantTypeEnumVal(compressor);
    //TODO: number should come from DB
    let ratedDischargePressure: number = 0;
    let ratedInletPressure: number = 0;
    return {
      //TODO: Figure out compute stuff
      computeFrom: computeFrom,
      computeFromVal: computeFromVal,
      computeFromPFVoltage: 0,
      computeFromPFAmps: 0,

      compressorType: compressorEnumVal,
      controlType: controlTypeEnumVal,
      fullLoadPressure: compressor.nameplateData.fullLoadOperatingPressure,
      powerAtFullLoad: compressor.nameplateData.ratedLoadPower,
      capacityAtFullLoad: compressor.nameplateData.fullLoadRatedCapacity,
      capacityAtMinFullLoadPressure: compressor.centrifugalSpecifics.minFullLoadCapacity,
      capacityAtMaxFullLoadPressure: compressor.centrifugalSpecifics.maxFullLoadCapacity,
      minFullLoadPressure: compressor.centrifugalSpecifics.minFullLoadPressure,
      maxFullLoadPressure: compressor.centrifugalSpecifics.maxFullLoadPressure,
      powerAtNoLoad: compressor.performancePoints.noLoad.power,
      capacityAtMaxFullFlow: compressor.performancePoints.maxFullFlow.airflow,
      powerAtUnload: compressor.performancePoints.unloadPoint.power,
      capacityAtUnload: compressor.performancePoints.unloadPoint.airflow,
      lubricantType: lubricantTypeEnumValue,
      stageType: stageTypeEnumVal,
      //base on use default selection in performance points
      adjustForDischargePressure: false,
      applyPressureInletCorrection: false,

      powerMax: compressor.performancePoints.maxFullFlow.power,
      dischargePsiFullLoad: compressor.performancePoints.fullLoad.dischargePressure,
      dischargePsiMax: compressor.performancePoints.maxFullFlow.dischargePressure,
      modulatingPsi: compressor.designDetails.modulatingPressureRange,

      
      capacity: compressor.compressorControls.unloadPointCapacity,
      fullLoadPower: compressor.performancePoints.fullLoad.power,
      polyExponent: compressor.nameplateData.ploytropicCompressorExponent,
      ratedDischargePressure: ratedDischargePressure,
      ratedInletPressure: ratedInletPressure,
      motorEfficiency: compressor.designDetails.designEfficiency,
      fullLoadDischargePressure: compressor.performancePoints.fullLoad.dischargePressure,
      maxDischargePressure: compressor.performancePoints.maxFullFlow.dischargePressure,
      
      //TODO: Sort out correct pressure mapping
      atmosphericPsi: compressor.inletConditions.atmosphericPressure,
      inletPressure: 0,
      atmosphericPressure: compressor.inletConditions.atmosphericPressure,
    
      //centrifugal
      powerAtBlowOff: compressor.performancePoints.blowoff.power,
      surgeFlow: compressor.centrifugalSpecifics.surgeAirflow,
      //TODO: percentageBlowOff
      percentageBlowOff: 0,
      maxPressure: compressor.performancePoints.maxFullFlow.dischargePressure,
    
      //Modulation w/ unload
      powerAtNolLoad: compressor.performancePoints.noLoad.power,
    
      //TODO: VFD, Multi step unloading
    
      //Start stop
      powerMaxPercentage: compressor.performancePoints.maxFullFlow.power,
      powerAtFullLoadPercentage: compressor.performancePoints.fullLoad.power

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

  getStageTypeEnumVal(compressor: CompressorInventoryItem): number {
    let selectedOption = CompressorTypeOptions.find(option => { return option.value == compressor.nameplateData.compressorType });
    if (selectedOption) {
      return selectedOption.stageTypeEnumValue;
    } else {
      return;
    }
  }

  getLubricantTypeEnumVal(compressor: CompressorInventoryItem): number {
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
  capacity: number
  fullLoadPower: number
  polyExponent: number
  ratedDischargePressure: number
  ratedInletPressure: number
  motorEfficiency: number
  fullLoadDischargePressure: number
  maxDischargePressure: number
  inletPressure: number
  atmosphericPressure: number

  //centrifugal
  powerAtBlowOff: number
  surgeFlow: number
  percentageBlowOff: number
  maxPressure: number

  //Modulation w/ unload
  powerAtNolLoad: number

  //TODO: VFD, Multi step unloading

  //Start stop
  powerMaxPercentage: number
  powerAtFullLoadPercentage: number


}