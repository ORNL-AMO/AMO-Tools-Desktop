import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { GenericCompressor } from '../../../generic-compressor-db.service';
import { UnloadPointCalculationsService } from './unload-point-calculations.service';

@Injectable()
export class BlowoffCalculationsService {

  constructor(private unloadPointCalculationsService: UnloadPointCalculationsService) { }

  //inlet butterfly modulation with blowoff
  setBlowoff(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
    //blowoff
    selectedCompressor.performancePoints.blowoff.dischargePressure = this.getBlowoffDischargePressure(selectedCompressor, selectedCompressor.performancePoints.blowoff.isDefaultPressure);
    selectedCompressor.performancePoints.blowoff.airflow = this.getBlowoffAirFlow(selectedCompressor, selectedCompressor.performancePoints.blowoff.isDefaultAirFlow);
    selectedCompressor.performancePoints.blowoff.power = this.getBlowoffPower(selectedCompressor, genericCompressor, selectedCompressor.performancePoints.blowoff.isDefaultPower);
    return selectedCompressor.performancePoints.blowoff;
  }

  getBlowoffDischargePressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      return selectedCompressor.performancePoints.fullLoad.dischargePressure;
    } else {
      return selectedCompressor.performancePoints.blowoff.dischargePressure;
    }
  }

  getBlowoffAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      return this.unloadPointCalculationsService.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.performancePoints.blowoff.dischargePressure);
    } else {
      return selectedCompressor.performancePoints.blowoff.airflow;
    }
  }

  getBlowoffPower(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor, isDefault: boolean): number {
    if (isDefault) {
      let unloadPointCapacity: number = (selectedCompressor.performancePoints.blowoff.airflow / selectedCompressor.performancePoints.fullLoad.airflow) * 100;
      return this.unloadPointCalculationsService.calculateUnloadPointPower(genericCompressor.NoLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.performancePoints.fullLoad.power);
    } else {
      return selectedCompressor.performancePoints.blowoff.power;
    }

  }

}
