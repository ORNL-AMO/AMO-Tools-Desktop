import { Injectable } from '@angular/core';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertCompressedAirInventoryService } from '../../../../convert-compressed-air-inventory.service';

@Injectable()
export class UnloadPointCatalogService {

  constructor(private convertCompressedAirService: ConvertCompressedAirInventoryService) { }

  setUnload(selectedCompressor: CompressedAirItem, settings: Settings): PerformancePoint {
    if (selectedCompressor.nameplateData.compressorType == 6) {
      selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.dischargePressure = this.getUnloadPressure(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultPressure, settings);
      selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.airflow = this.getUnloadAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultAirFlow, settings);
    } else {
      //non centrifugal calcs need airflow calc first, discharge pressure uses value
      selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.airflow = this.getUnloadAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultAirFlow, settings);
      selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.dischargePressure = this.getUnloadPressure(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultPressure, settings);
    }
    selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.power = this.getUnloadPower(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultPower);
    return selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint;
  }

  getUnloadAirFlow(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        defaultAirflow = this.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.dischargePressure);
      } else {
        defaultAirflow = this.calculateUnloadPointAirFlow(selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, selectedCompressor.compressedAirControlsProperties.unloadPointCapacity);
      }
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
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
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
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
      return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure, settings);
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
