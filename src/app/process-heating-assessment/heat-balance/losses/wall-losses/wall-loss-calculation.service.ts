import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { WallLoss } from '../../../models/wall-loss';

@Injectable()
export class WallLossCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: WallLoss, settings: Settings): number {
    const inputs: WallLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('C').to('F');
      inputs.surfaceTemperature = this.convertUnitsService.value(inputs.surfaceTemperature).from('C').to('F');
      inputs.windVelocity = this.convertUnitsService.value(inputs.windVelocity).from('km/h').to('mph');
      inputs.surfaceArea = this.convertUnitsService.value(inputs.surfaceArea).from('m2').to('ft2');
    }
    const result = this.processHeatingApiService.wallLosses(inputs);
    return isNaN(result) ? 0 : this.convertUnitsService.value(result).from('Btu').to(settings.energyResultUnit);
  }
}
