import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class ExhaustGasCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: ExhaustGasEAF, settings: Settings): number {
    const inputs: ExhaustGasEAF = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.offGasTemp = this.convertUnitsService.value(inputs.offGasTemp).from('C').to('F');
      inputs.vfr = this.convertUnitsService.value(inputs.vfr).from('m3').to('ft3');
      inputs.dustLoading = this.convertUnitsService.value(inputs.dustLoading).from('kgNm3').to('lbscf');
    }
    const result = this.processHeatingApiService.exhaustGasEAF(inputs);
    return isNaN(result) ? 0 : this.convertUnitsService.value(result).from('Btu').to(settings.energyResultUnit);
  }
}
