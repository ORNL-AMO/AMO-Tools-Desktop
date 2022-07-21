import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';

@Injectable({
  providedIn: 'root'
})
export class TurndownCalculationService {

  constructor(private convertUnitsService: ConvertUnitsService, private convertCompressedAirService: ConvertCompressedAirService) { }

  setTurndown(selectedCompressor: CompressorInventoryItem, settings: Settings): PerformancePoint {
    selectedCompressor.performancePoints.turndown.airflow = this.getTurndownAirflow(selectedCompressor, selectedCompressor.performancePoints.turndown.isDefaultAirFlow, settings);
    selectedCompressor.performancePoints.turndown.dischargePressure = this.getTurndownPressure(selectedCompressor, selectedCompressor.performancePoints.turndown.isDefaultPressure, settings);
    selectedCompressor.performancePoints.turndown.power = this.getTurndownPower(selectedCompressor, selectedCompressor.performancePoints.turndown.isDefaultPower);
    return selectedCompressor.performancePoints.turndown;
  }

  getTurndownPressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let modPressureRange: number = 6;
      if (settings.unitsOfMeasure == 'Metric') {
        modPressureRange = this.convertUnitsService.value(modPressureRange).from('psig').to('barg');
      } 
      let defaultPressure: number = selectedCompressor.performancePoints.fullLoad.dischargePressure + (modPressureRange * (1-(selectedCompressor.performancePoints.turndown.airflow/selectedCompressor.performancePoints.fullLoad.airflow)));
      return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure, settings);
    } else {
      return selectedCompressor.performancePoints.turndown.dischargePressure;
    }
  }

  getTurndownAirflow(selectedCompressor: CompressorInventoryItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number = (selectedCompressor.compressorControls.unloadPointCapacity / 100) * selectedCompressor.performancePoints.fullLoad.airflow;      
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
    } else {
      return selectedCompressor.performancePoints.turndown.airflow;
    }
  }

  getTurndownPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let LFFM: number = 15;
      let defaultPower: number = ((LFFM/100) * (1 - Math.pow(selectedCompressor.performancePoints.turndown.airflow / selectedCompressor.performancePoints.fullLoad.airflow, 1)) + Math.pow(selectedCompressor.performancePoints.turndown.airflow/selectedCompressor.performancePoints.fullLoad.airflow, 1)) * selectedCompressor.performancePoints.fullLoad.power;
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.performancePoints.turndown.power;
    }
  }

}
