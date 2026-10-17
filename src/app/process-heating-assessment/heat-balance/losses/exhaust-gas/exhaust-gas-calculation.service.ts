import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class ExhaustGasCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: ExhaustGasEAF, settings: Settings): number {
    const inputs: ExhaustGasEAF = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.offGasTemp = new ConvertValue(inputs.offGasTemp, 'C', 'F').convertedValue;
      inputs.vfr = new ConvertValue(inputs.vfr, 'm3', 'ft3').convertedValue;
      inputs.dustLoading = new ConvertValue(inputs.dustLoading, 'kgNm3', 'lbscf').convertedValue;
    }
    const result = this.processHeatingApiService.exhaustGasEAF(inputs);
    return isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
