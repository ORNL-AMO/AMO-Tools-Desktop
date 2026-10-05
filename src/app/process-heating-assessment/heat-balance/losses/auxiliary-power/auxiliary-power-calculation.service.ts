import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class AuxiliaryPowerCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: AuxiliaryPowerLoss, settings: Settings): number {
    const result = this.processHeatingApiService.auxiliaryPowerLoss({ ...input });
    if (isNaN(result)) {
      return 0;
    }
    if (settings.energyResultUnit === 'Btu') {
      return result;
    }
    // Suite returns Btu/hr; kWh results are reported as kW
    const from = settings.energyResultUnit === 'kWh' ? 'btuhr' : 'Btu';
    const to = settings.energyResultUnit === 'kWh' ? 'kW' : settings.energyResultUnit;
    return this.convertUnitsService.value(result).from(from).to(to);
  }
}
