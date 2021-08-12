import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';
import { UnloadPointCalculationsService } from './unload-point-calculations.service';

@Injectable()
export class BlowoffCalculationsService {

  constructor(private unloadPointCalculationsService: UnloadPointCalculationsService, private convertCompressedAirService: ConvertCompressedAirService) { }

  //inlet butterfly modulation with blowoff
  setBlowoff(selectedCompressor: CompressorInventoryItem): PerformancePoint {
    //blowoff
    selectedCompressor.performancePoints.blowoff.dischargePressure = this.getBlowoffDischargePressure(selectedCompressor, selectedCompressor.performancePoints.blowoff.isDefaultPressure);
    selectedCompressor.performancePoints.blowoff.airflow = this.getBlowoffAirFlow(selectedCompressor, selectedCompressor.performancePoints.blowoff.isDefaultAirFlow);
    selectedCompressor.performancePoints.blowoff.power = this.getBlowoffPower(selectedCompressor, selectedCompressor.performancePoints.blowoff.isDefaultPower);
    return selectedCompressor.performancePoints.blowoff;
  }

  getBlowoffDischargePressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultPressure: number = this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.performancePoints.fullLoad.dischargePressure);
      return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure);
    } else {
      return selectedCompressor.performancePoints.blowoff.dischargePressure;
    }
  }

  getBlowoffAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultAirflow: number = this.unloadPointCalculationsService.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.performancePoints.blowoff.dischargePressure);
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow);
    } else {
      return selectedCompressor.performancePoints.blowoff.airflow;
    }
  }

  getBlowoffPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let unloadPointCapacity: number = (selectedCompressor.performancePoints.blowoff.airflow / selectedCompressor.performancePoints.fullLoad.airflow) * 100;
      let defaultPower: number = this.unloadPointCalculationsService.calculateUnloadPointPower(selectedCompressor.designDetails.noLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.performancePoints.fullLoad.power);
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.performancePoints.blowoff.power;
    }

  }

}
