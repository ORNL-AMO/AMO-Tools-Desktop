import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { Settings } from '../../../../shared/models/settings';
import { EnergyExhaustGasOutput } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class EnergyInputExhaustGasCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);

  /** Inputs and results are hourly rates; converting Btu to the result unit matches legacy `convertResult`. */
  calculate(input: EnergyInputExhaustGasLoss, settings: Settings): EnergyExhaustGasOutput {
    const heatInputUnit = settings.unitsOfMeasure === 'Metric' ? 'GJ' : 'MMBtu';
    const totalHeatInputBtu = this.convertUnitsService.value(input.totalHeatInput).from(heatInputUnit).to('Btu');

    const fuelHeatDeliveredBtu = (totalHeatInputBtu * input.availableHeat) / 100;
    const exhaustGasLossesBtu = (fuelHeatDeliveredBtu * (100 - input.availableHeat)) / input.availableHeat;

    return {
      availableHeat: input.availableHeat,
      fuelHeatDelivered: this.toResultUnit(fuelHeatDeliveredBtu, settings),
      electricalEfficiency: input.electricalHeaterEfficiency / 100,
      exhaustGasLosses: this.toResultUnit(exhaustGasLossesBtu, settings),
    };
  }

  private toResultUnit(btu: number, settings: Settings): number {
    return isNaN(btu) ? 0 : this.convertUnitsService.value(btu).from('Btu').to(settings.energyResultUnit);
  }
}
