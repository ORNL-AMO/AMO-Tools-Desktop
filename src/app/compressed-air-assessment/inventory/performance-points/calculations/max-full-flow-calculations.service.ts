import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { GenericCompressor } from '../../../generic-compressor-db.service';
import * as regression from 'regression';
import { SharedPointCalculationsService } from './shared-point-calculations.service';

@Injectable()
export class MaxFullFlowCalculationsService {

  constructor(private sharedPointCalculationsService: SharedPointCalculationsService) { }

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
        return this.sharedPointCalculationsService.calculateAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
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
        return this.sharedPointCalculationsService.calculatePower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.performancePoints.fullLoad.dischargePressure, genericCompressor.TotPackageInputPower);
      } else {
        //centrifugal
        return selectedCompressor.performancePoints.fullLoad.power;
      }
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.power;
    }
  }

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
}
