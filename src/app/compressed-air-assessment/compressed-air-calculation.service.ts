import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressorInventoryItem } from '../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
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

  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private convertUnitsService: ConvertUnitsService) { }

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


  //computeFrom
  // 0 = PercentagePower,
  // 1 = PercentageCapacity,
  // 2 = PowerMeasured,
  // 3 = CapacityMeasured,
  // 4 = PowerFactor (Volt amps and powerfactor)

  compressorsCalc(compressor: CompressorInventoryItem, computeFrom: number, computeFromVal: number, additionalRecieverVolume?: number, canShutdown?: boolean): CompressorCalcResult {
    let isShutdown: boolean = false;
    if (canShutdown && compressor.compressorControls.automaticShutdown == true && (computeFrom == 1 || computeFrom == 3) && computeFromVal == 0) {
      isShutdown = true;
    }
    //TODO: conversions
    let isValid: boolean = this.inventoryService.isCompressorValid(compressor);
    if (isValid && !isShutdown) {
      if (compressor.nameplateData.compressorType == 6) {
        let inputData: CentrifugalInput = this.getCentrifugalInput(compressor, computeFrom, computeFromVal);
        let results: CompressorCalcResult = compressorAddon.CompressorsCalc(inputData);
        results.percentagePower = results.percentagePower * 100;
        results.percentageCapacity = results.percentageCapacity * 100;
        return results;
      } else {
        let inputData: CompressorsCalcInput = this.getInputFromInventoryItem(compressor, computeFrom, computeFromVal, additionalRecieverVolume);
        let results: CompressorCalcResult = compressorAddon.CompressorsCalc(inputData);
        results.percentagePower = results.percentagePower * 100;
        results.percentageCapacity = results.percentageCapacity * 100;
        return results;
      }
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
  getCentrifugalInput(compressor: CompressorInventoryItem, computeFrom: number, computeFromVal: number): CentrifugalInput {
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

  getInputFromInventoryItem(compressor: CompressorInventoryItem, computeFrom: number, computeFromVal: number, additionalRecieverVolume?: number): CompressorsCalcInput {
    let compressorEnumVal: number = this.getCompressorTypeEnumValue(compressor);
    let controlTypeEnumVal: number = this.getControlTypeEnumValue(compressor);
    let stageTypeEnumVal: number = this.getStageTypeEnumVal(compressor);
    let lubricantTypeEnumValue: number = this.getLubricantTypeEnumVal(compressor);

    if (computeFrom == 0 || computeFrom == 1) {
      computeFromVal = computeFromVal / 100;
    }

    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let receiverVolume: number = compressedAirAssessment.systemInformation.totalAirStorage;
    if (additionalRecieverVolume) {
      receiverVolume = receiverVolume + additionalRecieverVolume;
    }
    receiverVolume = this.convertUnitsService.value(receiverVolume).from('gal').to('ft3');

    //lubricant free
    if (lubricantTypeEnumValue == 1) {
      compressor.designDetails.blowdownTime = .0003;
      compressor.compressorControls.unloadSumpPressure = 15;
    }

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

      capacityAtUnload: compressor.performancePoints.unloadPoint.airflow,


      //base on use default selection in performance points
      adjustForDischargePressure: true,
      applyPressureInletCorrection: false,

      powerMax: compressor.performancePoints.maxFullFlow.power,
      dischargePsiMax: compressor.performancePoints.maxFullFlow.dischargePressure,

      modulatingPsi: compressor.designDetails.modulatingPressureRange,


      //TODO: Sort out correct pressure mapping 
      atmosphericPsi: compressor.inletConditions.atmosphericPressure,

      //design details inlet pressure

      //Modulation w/ unload
      powerAtNolLoad: compressor.performancePoints.noLoad.power,

      //TODO: VFD, Multi step unloading

      //Start stop
      // max power / full load power
      powerMaxPercentage: (compressor.performancePoints.maxFullFlow.power / compressor.performancePoints.fullLoad.power),

      powerAtFullLoadPercentage: 1,


      receiverVolume: receiverVolume,
      loadFactorUnloaded: 1,

      unloadPointCapacity: compressor.compressorControls.unloadPointCapacity,
      blowdownTime: compressor.designDetails.blowdownTime,
      unloadSumpPressure: compressor.compressorControls.unloadSumpPressure

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
  unloadSumpPressure: number
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