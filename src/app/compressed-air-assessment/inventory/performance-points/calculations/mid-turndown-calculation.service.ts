import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';

@Injectable()
export class MidTurndownCalculationService {

  constructor(private convertUnitsService: ConvertUnitsService, private convertCompressedAirService: ConvertCompressedAirService) { }

  setMidTurndown(selectedCompressor: CompressorInventoryItem, settings: Settings): PerformancePoint {
    selectedCompressor.performancePoints.midTurndown.airflow = this.getMidTurndownAirflow(selectedCompressor, selectedCompressor.performancePoints.midTurndown.isDefaultAirFlow, settings);
    selectedCompressor.performancePoints.midTurndown.dischargePressure = this.getMidTurndownPressure(selectedCompressor, selectedCompressor.performancePoints.midTurndown.isDefaultPressure, settings);
    selectedCompressor.performancePoints.midTurndown.power = this.getMidTurndownPower(selectedCompressor, selectedCompressor.performancePoints.midTurndown.isDefaultPower);
    return selectedCompressor.performancePoints.midTurndown;
  }

  getMidTurndownPressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let modPressureRange: number = 6;
      if (settings.unitsOfMeasure == 'Metric') {
        modPressureRange = this.convertUnitsService.value(modPressureRange).from('psig').to('barg');
      } 
      let defaultPressure: number = selectedCompressor.performancePoints.fullLoad.dischargePressure + (modPressureRange * (1-(selectedCompressor.performancePoints.midTurndown.airflow/selectedCompressor.performancePoints.fullLoad.airflow)));
      return this.convertCompressedAirService.roundPressureForPresentation(defaultPressure, settings);
    } else {
      return selectedCompressor.performancePoints.midTurndown.dischargePressure;
    }
  }

  getMidTurndownAirflow(selectedCompressor: CompressorInventoryItem, isDefault: boolean, settings: Settings): number {
    if (isDefault) {
      let defaultAirflow: number = ((1 - (selectedCompressor.compressorControls.unloadPointCapacity / 100))/2 + (selectedCompressor.compressorControls.unloadPointCapacity / 100)) * selectedCompressor.performancePoints.fullLoad.airflow;      
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
    } else {
      return selectedCompressor.performancePoints.midTurndown.airflow;
    }
  }

  getMidTurndownPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let LFFM: number = 15;
      let defaultPower: number = ((LFFM/100) * (1 - Math.pow(selectedCompressor.performancePoints.midTurndown.airflow / selectedCompressor.performancePoints.fullLoad.airflow, 1)) + Math.pow(selectedCompressor.performancePoints.midTurndown.airflow/selectedCompressor.performancePoints.fullLoad.airflow, 1)) * selectedCompressor.performancePoints.fullLoad.power;
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.performancePoints.midTurndown.power;
    }
  }

}