import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import * as regression from 'regression';
import { SharedPointCalculationsService } from './shared-point-calculations.service';

@Injectable()
export class MaxFullFlowCalculationsService {

  constructor(private sharedPointCalculationsService: SharedPointCalculationsService) { }

  setMaxFullFlow(selectedCompressor: CompressorInventoryItem): PerformancePoint {
    selectedCompressor.performancePoints.maxFullFlow.dischargePressure = this.getMaxFullFlowPressure(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure);
    selectedCompressor.performancePoints.maxFullFlow.airflow = this.getMaxFullFlowAirFlow(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow);
    selectedCompressor.performancePoints.maxFullFlow.power = this.getMaxFullFlowPower(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPower);
    return selectedCompressor.performancePoints.maxFullFlow;
  }

  getMaxFullFlowPressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      //all control types the same
      return selectedCompressor.designDetails.maxFullFlowPressure;
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.dischargePressure;
    }
  }

  getMaxFullFlowAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        return this.sharedPointCalculationsService.calculateAirFlow(selectedCompressor.performancePoints.fullLoad.airflow, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.performancePoints.fullLoad.dischargePressure);
      } else {
        //centrifugal
        return selectedCompressor.performancePoints.fullLoad.power;
      }
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.airflow;
    }
  }

  getMaxFullFlowPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        return this.sharedPointCalculationsService.calculatePower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.performancePoints.fullLoad.dischargePressure, selectedCompressor.nameplateData.totalPackageInputPower);
      } else {
        //centrifugal
        return selectedCompressor.performancePoints.fullLoad.power;
      }
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.power;
    }
  }

  // getCentrifugalMaxFullFlowAirFlow(selectedCompressor: CompressorInventoryItem): number {
  //   //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
  //   //y2 = RatedCapacity, x2 = RatedPressure
  //   //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
  //   let regressionData: Array<Array<number>> = [
  //     [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
  //     [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
  //     [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
  //   ];
  //   let regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
  //   let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.maxFullFlow.dischargePressure);
  //   return regressionValue[1];
  // }
}
