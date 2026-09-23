import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';

@Injectable()
export class FixtureCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: FixtureLoss, settings: Settings): number {
    const inputs: FixtureLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.finalTemperature = this.convertUnitsService.value(inputs.finalTemperature).from('C').to('F');
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJkgC').to('btulbF');
      inputs.feedRate = this.convertUnitsService.value(inputs.feedRate).from('kg').to('lb');
    }
    const result = this.processHeatingApiService.fixtureLosses(inputs);
    return isNaN(result) ? 0 : this.convertUnitsService.value(result).from('Btu').to(settings.energyResultUnit);
  }
}
