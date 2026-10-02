import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasByMass, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { OxygenCalculationMethod } from './flue-gas-form.service';

/** All values in percent. */
export interface FlueGasAvailableHeatResult {
  calculatedFlueGasO2: number;
  calculatedExcessAir: number;
  availableHeat: number;
}

@Injectable()
export class FlueGasCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculateByVolume(input: FlueGasByVolume, settings: Settings): FlueGasAvailableHeatResult {
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

  /**
   * The suite takes excess air only, so O2 and excess air are cross-calculated and the unused field
   * is derived from the selected `oxygenCalculationMethod`.
   */
  calculateByMass(input: FlueGasByMass, settings: Settings): FlueGasAvailableHeatResult {
    const inputs: FlueGasByMass = { ...input, ...this.deriveOxygenAndExcessAir(input) };
    inputs.ambientAirTempF = inputs.ambientAirTemp;
    inputs.combAirMoisturePerc = inputs.moistureInAirCombustion;
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.combustionAirTemperature = this.toFahrenheit(inputs.combustionAirTemperature);
      inputs.flueGasTemperature = this.toFahrenheit(inputs.flueGasTemperature);
      inputs.ashDischargeTemperature = this.toFahrenheit(inputs.ashDischargeTemperature);
      inputs.fuelTemperature = this.toFahrenheit(inputs.fuelTemperature);
      inputs.ambientAirTempF = this.toFahrenheit(inputs.ambientAirTempF);
    }
    return {
      calculatedFlueGasO2: inputs.o2InFlueGas,
      calculatedExcessAir: inputs.excessAirPercentage,
      availableHeat: this.toPercent(this.processHeatingApiService.flueGasLossesByMass(inputs)),
    };
  }

  /** Returns both `o2InFlueGas` and `excessAirPercentage`, keeping the user-entered one and deriving the other. */
  deriveOxygenAndExcessAir(input: FlueGasByMass): Pick<FlueGasByMass, 'o2InFlueGas' | 'excessAirPercentage'> {
    const fuel = {
      carbon: input.carbon, hydrogen: input.hydrogen, sulphur: input.sulphur, inertAsh: input.inertAsh,
      o2: input.o2, moisture: input.moisture, nitrogen: input.nitrogen,
    };
    if (input.oxygenCalculationMethod === OxygenCalculationMethod.OxygenInFlueGas) {
      const outOfRange = input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999;
      const excessAir = outOfRange ? 0 : this.processHeatingApiService.flueGasByMassCalculateExcessAir(
        { ...fuel, o2InFlueGas: input.o2InFlueGas, moistureInAirCombustion: input.moistureInAirCombustion });
      return { o2InFlueGas: input.o2InFlueGas, excessAirPercentage: this.nanToZero(excessAir) };
    }
    const o2 = input.excessAirPercentage < 0 ? 0 : this.processHeatingApiService.flueGasByMassCalculateO2(
      { ...fuel, excessAir: input.excessAirPercentage, moistureInAirCombustion: input.moistureInAirCombustion ?? null });
    return { o2InFlueGas: this.nanToZero(o2), excessAirPercentage: input.excessAirPercentage };
  }

  private nanToZero(value: number): number {
    return isNaN(value) ? 0 : value;
  }

  private toFahrenheit(celsius: number): number {
    return this.convertUnitsService.value(celsius).from('C').to('F');
  }

  private toPercent(fraction: number): number {
    return isNaN(fraction) ? 0 : fraction * 100;
  }
}
