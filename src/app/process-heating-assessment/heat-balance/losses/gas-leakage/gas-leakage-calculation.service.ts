import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class GasLeakageCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: LeakageLoss, settings: Settings): number {
    const inputs: LeakageLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.draftPressure = this.convertUnitsService.value(inputs.draftPressure).from('Pa').to('inH2o');
      inputs.openingArea = this.convertUnitsService.value(inputs.openingArea).from('m2').to('ft2');
      inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('C').to('F');
      inputs.leakageGasTemperature = this.convertUnitsService.value(inputs.leakageGasTemperature).from('C').to('F');
    }

    const result = this.processHeatingApiService.leakageLosses(inputs);
    return isNaN(result) ? 0 : this.convertUnitsService.value(result).from('Btu').to(settings.energyResultUnit);
  }
}
