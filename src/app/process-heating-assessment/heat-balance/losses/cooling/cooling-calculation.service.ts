import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { GasCoolingLoss, LiquidCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';

@Injectable()
export class CoolingCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculateGas(input: GasCoolingLoss, settings: Settings): number {
    const inputs: GasCoolingLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJkgC').to('btulbF');
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('m3').to('ft3');
      inputs.finalTemperature = this.convertUnitsService.value(inputs.finalTemperature).from('C').to('F');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.gasDensity = this.convertUnitsService.value(inputs.gasDensity).from('kgNm3').to('lbscf');
    }
    return this.toResultUnit(this.processHeatingApiService.gasCoolingLosses(inputs), settings);
  }

  calculateLiquid(input: LiquidCoolingLoss, settings: Settings): number {
    const inputs: LiquidCoolingLoss = { ...input };
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.specificHeat = this.convertUnitsService.value(inputs.specificHeat).from('kJkgC').to('btulbF');
      inputs.density = this.convertUnitsService.value(inputs.density).from('kgL').to('lbgal');
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('L').to('gal');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.outletTemperature = this.convertUnitsService.value(inputs.outletTemperature).from('C').to('F');
    }
    return this.toResultUnit(this.processHeatingApiService.liquidCoolingLosses(inputs), settings);
  }

  private toResultUnit(result: number, settings: Settings): number {
    return isNaN(result) ? 0 : this.convertUnitsService.value(result).from('Btu').to(settings.energyResultUnit);
  }
}
