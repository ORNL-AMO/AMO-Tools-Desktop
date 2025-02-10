import { Injectable } from '@angular/core';
import { CompressedAirItem } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';

@Injectable()
export class UnloadPointCatalogService {

  constructor() { }

  getUnloadAirFlow(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        defaultAirflow = this.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.dischargePressure);
      } else {
        defaultAirflow = this.calculateUnloadPointAirFlow(selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, selectedCompressor.compressedAirControlsProperties.unloadPointCapacity);
      }
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
      return defaultAirflow;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.airflow;
    }
  }

  getUnloadPower(selectedCompressor: CompressedAirItem, isDefault: boolean): number {
    if (isDefault) {
      //centrifugal
      let defaultPower: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        let unloadPointCapacity: number = (selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.airflow / selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.airflow) * 100;
        defaultPower = this.calculateUnloadPointPower(selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.power);
      } else if (selectedCompressor.compressedAirControlsProperties.controlType == 2) {
        //with unloading
        let unloadPointCapacity: number = (selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow) * 100;
        defaultPower = this.calculateUnloadPointPower(selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.power);
      } else if (selectedCompressor.compressedAirControlsProperties.controlType == 3) {
        //variable displacement
        defaultPower = this.calculateUnloadPointPower(selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM, selectedCompressor.compressedAirControlsProperties.unloadPointCapacity, 2, selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.power);
      }
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
      return defaultPower;
    }
    else {
      return selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.power;
    }
  }

  getUnloadPressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultPressure: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        defaultPressure = selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure;
      } else {
        defaultPressure = this.calculateUnloadPointDischargePressure(selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure, selectedCompressor.compressedAirDesignDetailsProperties.modulatingPressureRange, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.airflow);
      }
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure, settings);
      return defaultPressure;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.dischargePressure;
    }
  }

  calculateUnloadPointDischargePressure(maxFullFlowPressure: number, modulatingPressureRange: number, fullLoadAirFlow: number, unloadPointAirFlow: number): number {
    let unloadPointDischargePressure: number = maxFullFlowPressure + (modulatingPressureRange * (1 - (unloadPointAirFlow / fullLoadAirFlow)));
    return unloadPointDischargePressure;
  }

  calculateUnloadPointPower(NoLoadPowerFM: number, unloadPointCapacity: number, exponent: number, maxFullFlowPower: number): number {
    let unloadPointPower: number = ((NoLoadPowerFM / 100) * (1 - Math.pow((unloadPointCapacity / 100), exponent)) + Math.pow((unloadPointCapacity / 100), exponent)) * maxFullFlowPower;
    return Number(unloadPointPower.toFixed(1));
  }


  calculateUnloadPointAirFlow(fullLoadRatedCapacity: number, unloadPointCapacity: number): number {
    let unloadPointAirFlow: number = fullLoadRatedCapacity * (unloadPointCapacity / 100);
    return unloadPointAirFlow;
  }

  calculateCentrifugalUnloadPointAirFlow(selectedCompressor: CompressedAirItem, pressure: number): number {
    let C37: number = pressure;
    let C24: number = selectedCompressor.centrifugalSpecifics.minFullLoadPressure;
    let C22: number = selectedCompressor.centrifugalSpecifics.maxFullLoadPressure;
    let C23: number = selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity;
    let C26: number = selectedCompressor.centrifugalSpecifics.surgeAirflow;
    let result: number = (C37 - (C24 - (((C22 - C24) / (C23 - C26)) * C26))) / ((C22 - C24) / (C23 - C26));
    return result;
  }
}
