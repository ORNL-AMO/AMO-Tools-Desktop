import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class EnergyInputCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  /** @returns heat delivered in the settings' energy result unit */
  calculate(input: EnergyInputEAF, settings: Settings): number {
    const inputs: EnergyInputEAF = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.naturalGasHeatInput = new ConvertValue(inputs.naturalGasHeatInput, 'GJ', 'MMBtu').convertedValue;
      inputs.otherFuels = new ConvertValue(inputs.otherFuels, 'GJ', 'MMBtu').convertedValue;
      inputs.coalCarbonInjection = new ConvertValue(inputs.coalCarbonInjection, 'kg', 'lb').convertedValue;
      inputs.coalHeatingValue = new ConvertValue(inputs.coalHeatingValue, 'kJkg', 'btuLb').convertedValue;
      inputs.electrodeHeatingValue = new ConvertValue(inputs.electrodeHeatingValue, 'kJkg', 'btuLb').convertedValue;
      inputs.electrodeUse = new ConvertValue(inputs.electrodeUse, 'kg', 'lb').convertedValue;
    }
    const { heatDelivered } = this.processHeatingApiService.energyInputEAF(inputs);
    return isNaN(heatDelivered) ? 0 : new ConvertValue(heatDelivered, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
