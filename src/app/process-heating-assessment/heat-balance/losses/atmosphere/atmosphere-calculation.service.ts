import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';

@Injectable()
export class AtmosphereCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: AtmosphereLoss, settings: Settings): number {
    const inputs: AtmosphereLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.inletTemperature = new ConvertValue(inputs.inletTemperature, 'C', 'F').convertedValue;
      inputs.outletTemperature = new ConvertValue(inputs.outletTemperature, 'C', 'F').convertedValue;
      inputs.flowRate = new ConvertValue(inputs.flowRate, 'm3/h', 'ft3/h').convertedValue;
      inputs.specificHeat = new ConvertValue(inputs.specificHeat, 'kJm3C', 'btuScfF').convertedValue;
    }
    const result = this.processHeatingApiService.atmosphere(inputs);
    return isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
