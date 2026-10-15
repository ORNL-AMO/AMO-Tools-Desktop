import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { WallLoss } from '../../../models/wall-loss';

@Injectable()
export class WallLossCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: WallLoss, settings: Settings): number {
    const inputs: WallLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.ambientTemperature = new ConvertValue(inputs.ambientTemperature, 'C', 'F').convertedValue;
      inputs.surfaceTemperature = new ConvertValue(inputs.surfaceTemperature, 'C', 'F').convertedValue;
      inputs.windVelocity = new ConvertValue(inputs.windVelocity, 'km/h', 'mph').convertedValue;
      inputs.surfaceArea = new ConvertValue(inputs.surfaceArea, 'm2', 'ft2').convertedValue;
    }
    const result = this.processHeatingApiService.wallLosses(inputs);
    return isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
