import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Slag } from '../../../../shared/models/phast/losses/slag';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class SlagCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: Slag, settings: Settings): number {
    const inputs: Slag = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.weight = new ConvertValue(inputs.weight, 'kg', 'lb').convertedValue;
      inputs.inletTemperature = new ConvertValue(inputs.inletTemperature, 'C', 'F').convertedValue;
      inputs.outletTemperature = new ConvertValue(inputs.outletTemperature, 'C', 'F').convertedValue;
      inputs.specificHeat = new ConvertValue(inputs.specificHeat, 'kJkgC', 'btulbF').convertedValue;
    }
    const result = this.processHeatingApiService.slagOtherMaterialTotalHeatLoss(inputs);
    return isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
