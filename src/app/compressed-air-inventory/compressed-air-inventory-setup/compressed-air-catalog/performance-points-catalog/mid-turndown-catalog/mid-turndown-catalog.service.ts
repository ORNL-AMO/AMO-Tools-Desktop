import { Injectable } from '@angular/core';
import { CompressedAirItem } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';

@Injectable()
export class MidTurndownCatalogService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  getMidTurndownAirflow(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number = ((1 - (selectedCompressor.compressedAirControlsProperties.unloadPointCapacity / 100)) / 2 + (selectedCompressor.compressedAirControlsProperties.unloadPointCapacity / 100)) * selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow;
      //TODO: CA Inventory Conversion
      // return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
      return defaultAirflow;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.midTurndown.airflow;
    }
  }

  getMidTurndownPressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let modPressureRange: number = 6;
      if (settings.unitsOfMeasure == 'Metric') {
        modPressureRange = this.convertUnitsService.value(modPressureRange).from('psig').to('barg');
      }
      let defaultPressure: number = selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure + (modPressureRange * (1 - (selectedCompressor.compressedAirPerformancePointsProperties.midTurndown.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow)));
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure, settings);
      return defaultPressure;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.midTurndown.dischargePressure;
    }
  }

  getMidTurndownPower(selectedCompressor: CompressedAirItem, isDefault: boolean): number {
    if (isDefault) {
      let LFFM: number = 15;
      let defaultPower: number = ((LFFM / 100) * (1 - Math.pow(selectedCompressor.compressedAirPerformancePointsProperties.midTurndown.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, 1)) + Math.pow(selectedCompressor.compressedAirPerformancePointsProperties.midTurndown.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, 1)) * selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power;
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
      return defaultPower;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.midTurndown.power;
    }
  }
}
