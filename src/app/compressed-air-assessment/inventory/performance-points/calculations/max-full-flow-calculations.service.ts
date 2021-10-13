import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';
import { SharedPointCalculationsService } from './shared-point-calculations.service';
import * as regression from 'regression';
@Injectable()
export class MaxFullFlowCalculationsService {

  constructor(private sharedPointCalculationsService: SharedPointCalculationsService,
    private convertCompressedAirService: ConvertCompressedAirService
  ) { }

  setMaxFullFlow(selectedCompressor: CompressorInventoryItem): PerformancePoint {
    selectedCompressor.performancePoints.maxFullFlow.dischargePressure = this.getMaxFullFlowPressure(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure);
    selectedCompressor.performancePoints.maxFullFlow.airflow = this.getMaxFullFlowAirFlow(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow);
    selectedCompressor.performancePoints.maxFullFlow.power = this.getMaxFullFlowPower(selectedCompressor, selectedCompressor.performancePoints.maxFullFlow.isDefaultPower);
    return selectedCompressor.performancePoints.maxFullFlow;
  }

  getMaxFullFlowPressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      //all control types the same
      return this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.designDetails.maxFullFlowPressure);
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.dischargePressure;
    }
  }

  getMaxFullFlowAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultAirflow: number;
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        defaultAirflow = this.sharedPointCalculationsService.calculateAirFlow(selectedCompressor.performancePoints.fullLoad.airflow, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.performancePoints.fullLoad.dischargePressure);
      } else {
        //centrifugal
        defaultAirflow = this.calculateCentrifugalAirflow(selectedCompressor);
        // defaultAirflow = selectedCompressor.performancePoints.fullLoad.airflow;
      }
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow);
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.airflow;
    }
  }

  getMaxFullFlowPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultPower: number;
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        defaultPower = this.sharedPointCalculationsService.calculatePower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.performancePoints.fullLoad.dischargePressure, selectedCompressor.performancePoints.fullLoad.power);
      } else {
        //centrifugal
        defaultPower = selectedCompressor.performancePoints.fullLoad.power;
      }
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.performancePoints.maxFullFlow.power;
    }
  }


  calculateCentrifugalAirflow(selectedCompressor: CompressorInventoryItem): number {
    //y: MaxSurgePressure, x: MaxPressureSurgeFlow
    let maxSurgePoints: Array<number> = [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity];
    //y: RatedPressure, x: RatedCapacity
    let ratedPoints: Array<number> = [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity];
    //y: MinStonewallPressure, x: MinPressureStonewallFlow
    let minSurgePoints: Array<number> = [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity];
    let regressionData: Array<Array<number>> = [maxSurgePoints, ratedPoints, minSurgePoints];
    let result = regression.polynomial(regressionData, { precision: 5 });
    let prediction = result.predict(selectedCompressor.performancePoints.maxFullFlow.dischargePressure);
    //prediction = [x (dischargePressure), y(airflow)];
    return prediction[1];
  }
}
