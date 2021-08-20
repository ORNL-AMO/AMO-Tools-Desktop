import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';

@Injectable()
export class UnloadPointCalculationsService {

  constructor(private convertCompressedAirService: ConvertCompressedAirService) { }

  setUnload(selectedCompressor: CompressorInventoryItem): PerformancePoint {
    selectedCompressor.performancePoints.unloadPoint.dischargePressure = this.getUnloadPressure(selectedCompressor,selectedCompressor.performancePoints.unloadPoint.isDefaultPressure);
    selectedCompressor.performancePoints.unloadPoint.airflow = this.getUnloadAirFlow(selectedCompressor, selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow);
    selectedCompressor.performancePoints.unloadPoint.power = this.getUnloadPower(selectedCompressor, selectedCompressor.performancePoints.unloadPoint.isDefaultPower);
    return selectedCompressor.performancePoints.unloadPoint;
  }

  getUnloadPressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultPressure: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        defaultPressure = selectedCompressor.performancePoints.maxFullFlow.dischargePressure;
      } else {
        defaultPressure =  this.calculateUnloadPointDischargePressure(selectedCompressor.performancePoints.maxFullFlow.dischargePressure, selectedCompressor.designDetails.modulatingPressureRange, selectedCompressor.compressorControls.unloadPointCapacity);
      }
      return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure);
    } else {
      return selectedCompressor.performancePoints.unloadPoint.dischargePressure;
    }
  }

  getUnloadAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultAirflow: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        defaultAirflow = this.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.performancePoints.unloadPoint.dischargePressure);
      } else {
        defaultAirflow = this.calculateUnloadPointAirFlow(selectedCompressor.performancePoints.fullLoad.airflow, selectedCompressor.compressorControls.unloadPointCapacity);
      }
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow);
    } else {
      return selectedCompressor.performancePoints.unloadPoint.airflow;
    }
  }

  getUnloadPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      //centrifugal
      let defaultPower: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        let unloadPointCapacity: number = (selectedCompressor.performancePoints.unloadPoint.airflow / selectedCompressor.performancePoints.maxFullFlow.airflow) * 100;
        defaultPower = this.calculateUnloadPointPower(selectedCompressor.designDetails.noLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.performancePoints.maxFullFlow.power);
      } else if (selectedCompressor.compressorControls.controlType == 2) {
        //with unloading
        defaultPower = this.calculateUnloadPointPower(selectedCompressor.designDetails.noLoadPowerFM, selectedCompressor.compressorControls.unloadPointCapacity, 1, selectedCompressor.performancePoints.maxFullFlow.power);
      } else if (selectedCompressor.compressorControls.controlType == 3) {
        //variable displacement
        defaultPower = this.calculateUnloadPointPower(selectedCompressor.designDetails.noLoadPowerFM, selectedCompressor.compressorControls.unloadPointCapacity, 2, selectedCompressor.performancePoints.maxFullFlow.power);
      }
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    }
    else {
      return selectedCompressor.performancePoints.unloadPoint.power;
    }
  }
  
  calculateUnloadPointPower(NoLoadPowerFM: number, unloadPointCapacity: number, exponent: number, maxFullFlowPower: number): number {
    let unloadPointPower: number = ((NoLoadPowerFM / 100) * (1 - Math.pow((unloadPointCapacity / 100), exponent)) + Math.pow((unloadPointCapacity / 100), exponent)) * maxFullFlowPower;
    return Number(unloadPointPower.toFixed(1));
  }

  calculateUnloadPointAirFlow(fullLoadRatedCapacity: number, unloadPointCapacity: number): number {
    let unloadPointAirFlow: number = fullLoadRatedCapacity * (unloadPointCapacity / 100);
    return Number(unloadPointAirFlow.toFixed(0));
  }

  calculateUnloadPointDischargePressure(maxFullFlowPressure: number, modulatingPressureRange: number, unloadPointCapacity: number): number {
    let unloadPointDischargePressure: number = maxFullFlowPressure + (modulatingPressureRange * (1 - (unloadPointCapacity / 100)));
    return Number(unloadPointDischargePressure.toFixed(0));
  }

  calculateCentrifugalUnloadPointAirFlow(selectedCompressor: CompressorInventoryItem, pressure: number): number {
    let C37: number = pressure;
    let C24: number = selectedCompressor.centrifugalSpecifics.minFullLoadPressure;
    let C22: number = selectedCompressor.centrifugalSpecifics.maxFullLoadPressure;
    let C23: number = selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity;
    let C26: number = selectedCompressor.centrifugalSpecifics.surgeAirflow;
    let result: number =  (C37 - (C24 - (((C22 - C24) / (C23 - C26)) * C26))) / ((C22 - C24) / (C23 - C26));
    return Number(result.toFixed(0));
  }
}
