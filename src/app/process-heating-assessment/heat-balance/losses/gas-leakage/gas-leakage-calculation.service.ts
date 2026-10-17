import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class GasLeakageCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: LeakageLoss, settings: Settings): number {
    const inputs: LeakageLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.draftPressure = new ConvertValue(inputs.draftPressure, 'Pa', 'inH2o').convertedValue;
      inputs.openingArea = new ConvertValue(inputs.openingArea, 'm2', 'ft2').convertedValue;
      inputs.ambientTemperature = new ConvertValue(inputs.ambientTemperature, 'C', 'F').convertedValue;
      inputs.leakageGasTemperature = new ConvertValue(inputs.leakageGasTemperature, 'C', 'F').convertedValue;
    }

    const result = this.processHeatingApiService.leakageLosses(inputs);
    return isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
