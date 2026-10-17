import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';

@Injectable()
export class FixtureCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: FixtureLoss, settings: Settings): number {
    const inputs: FixtureLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.initialTemperature = new ConvertValue(inputs.initialTemperature, 'C', 'F').convertedValue;
      inputs.finalTemperature = new ConvertValue(inputs.finalTemperature, 'C', 'F').convertedValue;
      inputs.specificHeat = new ConvertValue(inputs.specificHeat, 'kJkgC', 'btulbF').convertedValue;
      inputs.feedRate = new ConvertValue(inputs.feedRate, 'kg', 'lb').convertedValue;
    }
    const result = this.processHeatingApiService.fixtureLosses(inputs);
    return isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
