import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class EnergyInputCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  /** @returns heat delivered in the settings' energy result unit */
  calculate(input: EnergyInputEAF, settings: Settings): number {
    const inputs: EnergyInputEAF = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.naturalGasHeatInput = this.convertUnitsService.value(inputs.naturalGasHeatInput).from('GJ').to('MMBtu');
      inputs.otherFuels = this.convertUnitsService.value(inputs.otherFuels).from('GJ').to('MMBtu');
      inputs.coalCarbonInjection = this.convertUnitsService.value(inputs.coalCarbonInjection).from('kg').to('lb');
      inputs.coalHeatingValue = this.convertUnitsService.value(inputs.coalHeatingValue).from('kJkg').to('btuLb');
      inputs.electrodeHeatingValue = this.convertUnitsService.value(inputs.electrodeHeatingValue).from('kJkg').to('btuLb');
      inputs.electrodeUse = this.convertUnitsService.value(inputs.electrodeUse).from('kg').to('lb');
    }
    const { heatDelivered } = this.processHeatingApiService.energyInputEAF(inputs);
    return isNaN(heatDelivered) ? 0 : this.convertUnitsService.value(heatDelivered).from('Btu').to(settings.energyResultUnit);
  }
}
