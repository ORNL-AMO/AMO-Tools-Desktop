import { Injectable } from '@angular/core';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';
import { PerformancePointsCatalogService } from '../performance-points-catalog.service';
import * as regression from 'regression';
import { ConvertCompressedAirInventoryService } from '../../../../convert-compressed-air-inventory.service';

@Injectable()
export class FullLoadCatalogService {

  constructor(private performancePointsCatalogService: PerformancePointsCatalogService, private convertCompressedAirService: ConvertCompressedAirInventoryService) { }

  setFullLoad(selectedCompressor: CompressedAirItem, atmosphericPressure: number, settings: Settings): PerformancePoint {
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure = this.getFullLoadDischargePressure(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultPressure, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow = this.getFullLoadAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultAirFlow, atmosphericPressure, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power = this.getFullLoadPower(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultPower, atmosphericPressure, settings);
    return selectedCompressor.compressedAirPerformancePointsProperties.fullLoad;
  }

  getFullLoadAirFlow(selectedCompressor: CompressedAirItem, isDefault: boolean, atmosphericPressure: number, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
        //y2 = RatedCapacity, x2 = RatedPressure
        //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
        let regressionData: Array<Array<number>> = [
          [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
          [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
          [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
        ];
        let regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
        let regressionValue = regressionEquation.predict(selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure);
        defaultAirflow = regressionValue[1];
      } else {
        defaultAirflow = this.performancePointsCatalogService.calculateAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, atmosphericPressure, settings);
      }
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow;
    }
  }

  getFullLoadPower(selectedCompressor: CompressedAirItem, isDefault: boolean, atmosphericPressure: number, settings: Settings): number {
    if (isDefault) {
      let defaultPower: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        defaultPower = selectedCompressor.nameplateData.totalPackageInputPower;
      } else {
        defaultPower = this.performancePointsCatalogService.calculatePower(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressedAirDesignDetailsProperties.inputPressure, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.totalPackageInputPower, atmosphericPressure, settings);
      }
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power;
    }
  }

  getFullLoadDischargePressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      return this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.nameplateData.fullLoadOperatingPressure, settings);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure;
    }
  }





}
