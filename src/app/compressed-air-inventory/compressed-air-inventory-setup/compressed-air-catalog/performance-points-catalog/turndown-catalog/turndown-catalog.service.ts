import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';

@Injectable()
export class TurndownCatalogService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  setTurndown(selectedCompressor: CompressedAirItem, settings: Settings): PerformancePoint {
    selectedCompressor.compressedAirPerformancePointsProperties.turndown.airflow = this.getTurndownAirflow(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.turndown.isDefaultAirFlow, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.turndown.dischargePressure = this.getTurndownPressure(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.turndown.isDefaultPressure, settings);
    selectedCompressor.compressedAirPerformancePointsProperties.turndown.power = this.getTurndownPower(selectedCompressor, selectedCompressor.compressedAirPerformancePointsProperties.turndown.isDefaultPower);
    return selectedCompressor.compressedAirPerformancePointsProperties.turndown;
  }

  getTurndownPressure(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let modPressureRange: number = 6;
      if (settings.unitsOfMeasure == 'Metric') {
        modPressureRange = this.convertUnitsService.value(modPressureRange).from('psig').to('barg');
      }
      let defaultPressure: number = selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure + (modPressureRange * (1 - (selectedCompressor.compressedAirPerformancePointsProperties.turndown.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow)));
      //TODO: CA Inventory Conversion
      //return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure, settings);
      return defaultPressure;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.turndown.dischargePressure;
    }
  }

  getTurndownAirflow(selectedCompressor: CompressedAirItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number = (selectedCompressor.compressedAirControlsProperties.unloadPointCapacity / 100) * selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow;
      //TODO: CA Inventory Conversion return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
      return defaultAirflow;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.turndown.airflow;
    }
  }

  getTurndownPower(selectedCompressor: CompressedAirItem, isDefault: boolean): number {
    if (isDefault) {
      let LFFM: number = 15;
      let defaultPower: number = ((LFFM / 100) * (1 - Math.pow(selectedCompressor.compressedAirPerformancePointsProperties.turndown.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, 1)) + Math.pow(selectedCompressor.compressedAirPerformancePointsProperties.turndown.airflow / selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow, 1)) * selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power;
      //TODO: CA Inventory Conversion return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
      return defaultPower;
    } else {
      return selectedCompressor.compressedAirPerformancePointsProperties.turndown.power;
    }
  }
}
