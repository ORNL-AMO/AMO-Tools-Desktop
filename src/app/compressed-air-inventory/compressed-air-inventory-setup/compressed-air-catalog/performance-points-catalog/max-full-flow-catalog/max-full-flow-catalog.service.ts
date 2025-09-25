import { Injectable } from '@angular/core';
import { PerformancePointsCatalogService } from '../performance-points-catalog.service';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import * as regression from 'regression';
import { ConvertCompressedAirInventoryService } from '../../../../convert-compressed-air-inventory.service';

@Injectable()
export class MaxFullFlowCatalogService {

  constructor(private performancePointsCatalogService: PerformancePointsCatalogService, private convertCompressedAirService: ConvertCompressedAirInventoryService) { }

  setMaxFullFlow(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): PerformancePoint {
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure = this.getMaxFullFlowPressure(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultPressure, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.airflow = this.getMaxFullFlowAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultAirFlow, atmosphericPressure, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.power = this.getMaxFullFlowPower(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultPower, atmosphericPressure, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow;
  }


  getMaxFullFlowAirFlow(selectedCompressor: CompressedAirItem, isDefault: boolean, atmosphericPressure: number, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number;
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        defaultAirflow = this.performancePointsCatalogService.calculateAirFlow(selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure, atmosphericPressure, settings);
      } else {
        //centrifugal
        defaultAirflow = this.calculateCentrifugalAirflow(selectedCompressor);
        // defaultAirflow = selectedCompressor.performancePoints.fullLoad.airflow;
      }
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.airflow;
    }
  }

  getMaxFullFlowPower(selectedCompressor: CompressedAirItem, isDefault: boolean, atmosphericPressure: number, settings: Settings): number {
    if (isDefault) {
      let defaultPower: number;
      if (selectedCompressor.nameplateData.compressorType != 6) {
        //non centrifugal
        defaultPower = this.performancePointsCatalogService.calculatePower(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressedAirDesignDetailsProperties.inputPressure, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power, atmosphericPressure, settings);
      } else {
        //centrifugal
        defaultPower = selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power;
      }
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.power;
    }
  }

  getMaxFullFlowPressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      return this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.compressedAirDesignDetailsProperties.maxFullFlowPressure, settings);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure;
    }
  }

  calculateCentrifugalAirflow(selectedCompressor: CompressedAirItem): number {
    //y: MaxSurgePressure, x: MaxPressureSurgeFlow
    let maxSurgePoints: Array<number> = [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity];
    //y: RatedPressure, x: RatedCapacity
    let ratedPoints: Array<number> = [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity];
    //y: MinStonewallPressure, x: MinPressureStonewallFlow
    let minSurgePoints: Array<number> = [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity];
    let regressionData: Array<Array<number>> = [maxSurgePoints, ratedPoints, minSurgePoints];
    let result = regression.polynomial(regressionData, { precision: 5 });
    let prediction = result.predict(selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure);
    //prediction = [x (dischargePressure), y(airflow)];
    return prediction[1];
  }
}
