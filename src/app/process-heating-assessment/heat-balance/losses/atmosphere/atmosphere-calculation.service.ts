import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';

@Injectable()
export class AtmosphereCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: AtmosphereLoss, settings: Settings): number {
    const inputs: AtmosphereLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.inletTemperature = this.convertUnitsService.value(inputs.inletTemperature).from('C').to('F');
      inputs.outletTemperature = this.convertUnitsService.value(inputs.outletTemperature).from('C').to('F');
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('m3/h').to('ft3/h');
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJm3C').to('btuScfF');
    }
    const result = this.processHeatingApiService.atmosphere(inputs);
    return isNaN(result) ? 0 : this.convertUnitsService.value(result).from('Btu').to(settings.energyResultUnit);
  }
}
