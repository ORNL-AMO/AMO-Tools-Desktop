import { Injectable } from '@angular/core';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { UnloadPointCatalogService } from '../unload-point-catalog/unload-point-catalog.service';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertCompressedAirInventoryService } from '../../../../convert-compressed-air-inventory.service';

@Injectable()
export class BlowoffCatalogService {

  constructor(private unloadPointCatalogService: UnloadPointCatalogService, private convertCompressedAirService: ConvertCompressedAirInventoryService) { }

  setBlowoff(selectedCompressor: CompressedAirItem, settings: Settings): PerformancePoint {
    //blowoff
    selectedCompressor.compressedAirPerformancePointsProperties.blowoff.dischargePressure = this.getBlowoffDischargePressure(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.blowoff.isDefaultPressure, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.blowoff.airflow = this.getBlowoffAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.blowoff.isDefaultAirFlow, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.blowoff.power = this.getBlowoffPower(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.blowoff.isDefaultPower);
    return selectedCompressor.compressedAirPerformancePointsProperties.blowoff;
  }

  getBlowoffDischargePressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      return this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure, settings);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.blowoff.dischargePressure;
    }
  }

  getBlowoffAirFlow(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number = this.unloadPointCatalogService.calculateCentrifugalUnloadPointAirFlow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.blowoff.dischargePressure);
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.blowoff.airflow;
    }
  }

  getBlowoffPower(selectedCompressor: CompressedAirItem, isDefault: boolean): number {
    if (isDefault) {
      let unloadPointCapacity: number = (selectedCompressor.compressedAirPerformancePointsProperties.blowoff.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow) * 100;
      let defaultPower: number = this.unloadPointCatalogService.calculateUnloadPointPower(selectedCompressor.compressedAirDesignDetailsProperties.noLoadPowerFM, unloadPointCapacity, 1, selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power);
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.blowoff.power;
    }

  }
}
