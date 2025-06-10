import { Injectable } from '@angular/core';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';
import { PerformancePointsCatalogService } from '../performance-points-catalog.service';
import * as regression from 'regression';

@Injectable()
export class FullLoadCatalogService {

  constructor(private performancePointsCatalogService: PerformancePointsCatalogService) { }

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
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
      return defaultAirflow
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
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
      return defaultPower
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power;
    }
  }

  getFullLoadDischargePressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.nameplateData.fullLoadOperatingPressure, settings);
      return selectedCompressor.nameplateData.fullLoadOperatingPressure
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure;
    }
  }





}
