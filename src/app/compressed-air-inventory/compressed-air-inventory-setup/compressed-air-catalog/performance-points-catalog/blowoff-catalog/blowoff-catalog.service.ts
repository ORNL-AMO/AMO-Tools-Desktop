import { Injectable } from '@angular/core';
import { CompressedAirItem } from '../../../../compressed-air-inventory';
import { UnloadPointCatalogService } from '../unload-point-catalog/unload-point-catalog.service';
import { Settings } from '../../../../../shared/models/settings';

@Injectable()
export class BlowoffCatalogService {

  constructor(private unloadPointCatalogService: UnloadPointCatalogService) { }

  getBlowoffDischargePressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
      if (isDefault) {
        //TODO: CA Inventory Conversion
        //let defaultPressure: number = this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure, settings);
        let defaultPressure: number = selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure;
        return defaultPressure;
      } else {
        return selectedCompressor.compressedAirPerformancePointsProperties.blowoff.dischargePressure;
      }
    }
  
    getBlowoffAirFlow(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
      if (isDefault) {
        let defaultAirflow: number = this.unloadPointCatalogService.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.blowoff.dischargePressure);
        //TODO: CA Inventory Conversion
        //return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
        return defaultAirflow;
      } else {
        return selectedCompressor.compressedAirPerformancePointsProperties.blowoff.airflow;
      }
    }
  
    getBlowoffPower(selectedCompressor: CompressedAirItem, isDefault: boolean): number {
      if (isDefault) {
        let unloadPointCapacity: number = (selectedCompressor.compressedAirPerformancePointsProperties.blowoff.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow) * 100;
        let defaultPower: number = this.unloadPointCatalogService.calculateUnloadPointPower(selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power);
        //TODO: CA Inventory Conversion
        //return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
        return defaultPower;
      } else {
        return selectedCompressor.compressedAirPerformancePointsProperties.blowoff.power;
      }
  
    }
}
