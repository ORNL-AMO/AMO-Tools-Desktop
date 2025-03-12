import { Injectable } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';

@Injectable()
export class NoLoadCatalogService {

  constructor() { }

  setNoLoad(selectedCompressor: CompressedAirItem, settings: Settings): PerformancePoint {
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad.dischargePressure = this.getNoLoadPressure(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultPressure, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad.airflow = this.getNoLoadAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultAirFlow);
    selectedCompressor.compressedAirPerformancePointsProperties.noLoad.power = this.getNoLoadPower(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultPower);
    return selectedCompressor.compressedAirPerformancePointsProperties.noLoad;
  }

  getNoLoadPressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultPressure: number;
      if (selectedCompressor.nameplateData.compressorType == 6 || selectedCompressor.compressedAirControlsProperties.controlType == 6
        || selectedCompressor.nameplateData.compressorType == 4 || selectedCompressor.nameplateData.compressorType == 5 ||
        selectedCompressor.nameplateData.compressorType == 3) {
        //centrifugal or start/stop or reciprocating or lubricant free
        defaultPressure = 0
      } else if (selectedCompressor.compressedAirControlsProperties.controlType == 1) {
        //without unloading
        defaultPressure = selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure + selectedCompressor.compressedAirDesignDetailsProperties.modulatingPressureRange;
      } else {
        //rest of options
        defaultPressure = selectedCompressor.compressedAirControlsProperties.unloadSumpPressure;
      }
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure, settings);
      return defaultPressure;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.noLoad.dischargePressure;
    }
  }

  getNoLoadAirFlow(selectedCompressor: CompressedAirItem, isDefault: boolean): number {
    if (isDefault) {
      return 0;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.noLoad.airflow;
    }
  }

  getNoLoadPower(selectedCompressor: CompressedAirItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultPower: number;
      if (selectedCompressor.compressedAirControlsProperties.controlType == 1) {
        //without unloading
        defaultPower = this.calculateNoLoadPowerWithoutUnloading(selectedCompressor);
      } else if (selectedCompressor.compressedAirControlsProperties.controlType == 6) {
        //start stop
        defaultPower = 0
      } else {
        defaultPower = this.calculateNoLoadPower(selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerUL, selectedCompressor.nameplateData.totalPackageInputPower, selectedCompressor.compressedAirDesignDetailsProperties.designEfficiency);
      }
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
      return defaultPower;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.noLoad.power;
    }
  }

  calculateNoLoadPower(NoLoadPowerUL: number, TotPackageInputPower: number, designEfficiency: number): number {
    if (NoLoadPowerUL < 25) {
      let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / (NoLoadPowerUL / (NoLoadPowerUL - 25 + 2521.834 / designEfficiency) / designEfficiency) / 10000;
      return noLoadPower;
    } else {
      let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / 100;
      return noLoadPower;
    }
  }

  //Without unloading
  calculateNoLoadPowerWithoutUnloading(selectedCompressor: CompressedAirItem): number {
    return selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM / 100 * selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power;
  }
}
