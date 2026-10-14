import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { GasCoolingLoss, LiquidCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';

@Injectable()
export class CoolingCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculateGas(input: GasCoolingLoss, settings: Settings): number {
    const inputs: GasCoolingLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.specificHeat = new ConvertValue(inputs.specificHeat, 'kJkgC', 'btulbF').convertedValue;
      inputs.flowRate = new ConvertValue(inputs.flowRate, 'm3', 'ft3').convertedValue;
      inputs.finalTemperature = new ConvertValue(inputs.finalTemperature, 'C', 'F').convertedValue;
      inputs.initialTemperature = new ConvertValue(inputs.initialTemperature, 'C', 'F').convertedValue;
      inputs.gasDensity = new ConvertValue(inputs.gasDensity, 'kgNm3', 'lbscf').convertedValue;
    }
    return this.toResultUnit(this.processHeatingApiService.gasCoolingLosses(inputs), settings);
  }

  calculateLiquid(input: LiquidCoolingLoss, settings: Settings): number {
    const inputs: LiquidCoolingLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.specificHeat = new ConvertValue(inputs.specificHeat, 'kJkgC', 'btulbF').convertedValue;
      inputs.density = new ConvertValue(inputs.density, 'kgL', 'lbgal').convertedValue;
      inputs.flowRate = new ConvertValue(inputs.flowRate, 'L', 'gal').convertedValue;
      inputs.initialTemperature = new ConvertValue(inputs.initialTemperature, 'C', 'F').convertedValue;
      inputs.outletTemperature = new ConvertValue(inputs.outletTemperature, 'C', 'F').convertedValue;
    }
    return this.toResultUnit(this.processHeatingApiService.liquidCoolingLosses(inputs), settings);
  }

  private toResultUnit(result: number, settings: Settings): number {
    return isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
