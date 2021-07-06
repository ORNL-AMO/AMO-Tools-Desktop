import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { GenericCompressor } from '../../../generic-compressor-db.service';
import * as regression from 'regression';

@Injectable()
export class MaxFullFlowCalculationsService {

  constructor() { }

  setMaxFullFlow(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
    selectedCompressor.performancePoints.maxFullFlow.dischargePressure = this.getMaxFullFlowPressure(selectedCompressor, genericCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure);
    selectedCompressor.performancePoints.maxFullFlow.airflow = this.getMaxFullFlowAirFlow(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow);
    selectedCompressor.performancePoints.maxFullFlow.power = this.getMaxFullFlowPower(selectedCompressor, genericCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPower);
    return selectedCompressor.performancePoints.maxFullFlow;
  }

  getMaxFullFlowPressure(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor, isDefault: boolean): number {
    if (isDefault) {
      //all control types the same
      return genericCompressor.MaxFullFlowPressure;
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.dischargePressure;
    }
  }

  getMaxFullFlowAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        return this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
      } else {
        //centrifugal
        return this.getCentrifugalMaxFullFlowAirFlow(selectedCompressor);
      }
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.airflow;
    }
  }

  getMaxFullFlowPower(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor, isDefault: boolean): number {
    if (isDefault) {
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        return this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
      } else {
        //centrifugal
        return selectedCompressor.performancePoints.fullLoad.power;
      }
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.power;
    }
  }

  // setWithUnloadingMaxFullFlow(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //maxFullFlow
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
  //     selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
  //     selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
  //   }
  //   return selectedCompressor.performancePoints.maxFullFlow;
  // }

  // //VARIABLE DISPLACMENT
  // setVariableDisplacementPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //maxFullFlow
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
  //     selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
  //     selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
  //   }
  //   return selectedCompressor.performancePoints.maxFullFlow;
  // }

  // //LOAD/UNLOAD
  // setLubricatedLoadUnloadPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //maxFullFlow
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
  //     selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
  //     selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
  //   }
  //   return selectedCompressor.performancePoints.maxFullFlow;
  // }

  // //START STOP
  // setStartStopPerformancePoints(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //maxFullFlow
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
  //     selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
  //     selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
  //   }
  //   return selectedCompressor.performancePoints.maxFullFlow;
  // }

  // //MULTI STEP UNLOADING
  // setMultiStepUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //maxFullFlow
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
  //     selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
  //     selectedCompressor.performancePoints.maxFullFlow.airflow = this.calculateMaxFullFlowAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
  //     selectedCompressor.performancePoints.maxFullFlow.power = this.calculateMaxFullFlowPower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, genericCompressor.TotPackageInputPower);
  //   }
  //   return selectedCompressor.performancePoints.maxFullFlow;
  // }

  // //CENTRIFUGAL
  // //inlet buterfly modulation with unloading
  // setInletButterflyModulationWithUnloading(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //maxFullFlow
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
  //     selectedCompressor.performancePoints.maxFullFlow.dischargePressure = genericCompressor.MaxFullFlowPressure;
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
  //     //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
  //     //y2 = RatedCapacity, x2 = RatedPressure
  //     //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
  //     let regressionData: Array<Array<number>> = [
  //       [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
  //       [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
  //       [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
  //     ];
  //     let regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
  //     let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.maxFullFlow.dischargePressure);
  //     selectedCompressor.performancePoints.maxFullFlow.airflow = regressionValue[1];
  //   }
  //   if (selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
  //     selectedCompressor.performancePoints.maxFullFlow.power = selectedCompressor.performancePoints.fullLoad.power;
  //   }
  //   return selectedCompressor.performancePoints.maxFullFlow;
  // }

  getCentrifugalMaxFullFlowAirFlow(selectedCompressor: CompressorInventoryItem): number {
    //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
    //y2 = RatedCapacity, x2 = RatedPressure
    //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
    let regressionData: Array<Array<number>> = [
      [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
      [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
      [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
    ];
    let regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
    let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.maxFullFlow.dischargePressure);
    return regressionValue[1];
  }

  calculateMaxFullFlowAirFlow(fullLoadRatedCapacity: number, maxFullFlowPressure: number, fullLoadOperatingPressure: number): number {
    let atmosphericPressure: number = 14.7;
    let maxFullFlowAirFlow: number = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * fullLoadRatedCapacity * (1 - 0.00075 * (maxFullFlowPressure - fullLoadOperatingPressure));
    return Number(maxFullFlowAirFlow.toFixed(3));
  }

  calculateMaxFullFlowPower(compressorType: number, inputPressure: number, maxFullFlowPressure: number, fullLoadOperatingPressure: number, TotPackageInputPower: number): number {
    let atmosphericPressure: number = 14.7;
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
    if (compressorType == 1 || compressorType == 2 || compressorType == 3) {
      //screw
      p1 = -.0000577 * Math.pow(atmosphericPressure, 3) + 0.000251 * Math.pow(atmosphericPressure, 2) + .0466 * atmosphericPressure + .4442;
      p2 = (maxFullFlowPressure + inputPressure) / inputPressure;
    } else {
      p1 = (atmosphericPressure / inputPressure);
      p2 = (maxFullFlowPressure + atmosphericPressure) / atmosphericPressure;
    }
    let p3: number = Math.pow(((fullLoadOperatingPressure + inputPressure) / inputPressure), polytropicExponent) - 1;
    let maxFullFlowPower: number = p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
    return Number(maxFullFlowPower.toFixed(3));
  }
}
