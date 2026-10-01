import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

/** All values in percent. */
export interface FlueGasVolumeResult {
  calculatedFlueGasO2: number;
  calculatedExcessAir: number;
  availableHeat: number;
}

@Injectable()
export class FlueGasCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculateByVolume(input: FlueGasByVolume, settings: Settings): FlueGasVolumeResult {
    const inputs: FlueGasByVolume = { ...input };
    inputs.ambientAirTempF = inputs.ambientAirTemp;
    inputs.combAirMoisturePerc = inputs.moistureInAirCombustion / 100;
    inputs.flueGasO2Percentage = inputs.o2InFlueGas;
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.combustionAirTemperature = this.toFahrenheit(inputs.combustionAirTemperature);
      inputs.flueGasTemperature = this.toFahrenheit(inputs.flueGasTemperature);
      inputs.fuelTemperature = this.toFahrenheit(inputs.fuelTemperature);
      inputs.ambientAirTempF = this.toFahrenheit(inputs.ambientAirTempF);
      inputs.ambientAirTemp = this.toFahrenheit(inputs.ambientAirTemp);
    }
    const results = this.processHeatingApiService.flueGasLossesByVolume(inputs);
    return {
      calculatedFlueGasO2: this.toPercent(results.flueGasO2),
      calculatedExcessAir: this.toPercent(results.excessAir),
      availableHeat: this.toPercent(results.availableHeat),
    };
  }

  private toFahrenheit(celsius: number): number {
    return this.convertUnitsService.value(celsius).from('C').to('F');
  }

  private toPercent(fraction: number): number {
    return isNaN(fraction) ? 0 : fraction * 100;
  }
}
