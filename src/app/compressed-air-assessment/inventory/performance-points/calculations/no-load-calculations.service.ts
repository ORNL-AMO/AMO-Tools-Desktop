import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';
import { GenericCompressor } from '../../../generic-compressor-db.service';

@Injectable()
export class NoLoadCalculationsService {

  constructor(private convertCompressedAirService: ConvertCompressedAirService) { }

  setNoLoad(selectedCompressor: CompressorInventoryItem): PerformancePoint {
    selectedCompressor.performancePoints.noLoad.dischargePressure = this.getNoLoadPressure(selectedCompressor, selectedCompressor.performancePoints.noLoad.isDefaultPressure);
    selectedCompressor.performancePoints.noLoad.airflow = this.getNoLoadAirFlow(selectedCompressor, selectedCompressor.performancePoints.noLoad.isDefaultAirFlow);
    selectedCompressor.performancePoints.noLoad.power = this.getNoLoadPower(selectedCompressor, selectedCompressor.performancePoints.noLoad.isDefaultPower);
    return selectedCompressor.performancePoints.noLoad;
  }

  getNoLoadPressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultPressure: number;
      if (selectedCompressor.nameplateData.compressorType == 6 || selectedCompressor.compressorControls.controlType == 5) {
        //centrifugal or start/stop
        defaultPressure = 0
      } else if (selectedCompressor.compressorControls.controlType == 1) {
        //without unloading
        defaultPressure = selectedCompressor.performancePoints.fullLoad.dischargePressure + selectedCompressor.designDetails.modulatingPressureRange;
      } else {
        //rest of options
        defaultPressure = selectedCompressor.compressorControls.unloadSumpPressure;
      }
      return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure);
    } else {
      return selectedCompressor.performancePoints.noLoad.dischargePressure;
    }
  }

  getNoLoadAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      return 0;
    } else {
      return selectedCompressor.performancePoints.noLoad.airflow;
    }
  }

  getNoLoadPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultPower: number;
      if (selectedCompressor.compressorControls.controlType == 1) {
        //without unloading
        defaultPower = this.calculateNoLoadPowerWithoutUnloading(selectedCompressor);
      } else if (selectedCompressor.compressorControls.controlType == 5) {
        //start stop
        defaultPower = 0
      } else {
        defaultPower = this.calculateNoLoadPower(selectedCompressor.designDetails.noLoadPowerUL, selectedCompressor.nameplateData.totalPackageInputPower, selectedCompressor.designDetails.designEfficiency);
      }
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.performancePoints.noLoad.power;
    }
  }
  
  calculateNoLoadPower(NoLoadPowerUL: number, TotPackageInputPower: number, designEfficiency: number): number {
    if (NoLoadPowerUL < 25) {
      let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / (NoLoadPowerUL / (NoLoadPowerUL - 25 + 2521.834 / designEfficiency) / designEfficiency) / 10000;
      return Number(noLoadPower.toFixed(1));
    } else {
      let noLoadPower: number = NoLoadPowerUL * TotPackageInputPower / 1 / 10000;
      return Number(noLoadPower.toFixed(1));
    }
  }

  //Without unloading
  calculateNoLoadPowerWithoutUnloading(selectedCompressor: CompressorInventoryItem): number {
    return selectedCompressor.designDetails.noLoadPowerFM / 100 * selectedCompressor.performancePoints.fullLoad.power;
  }
}
