import { Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { Settings } from '../../../../shared/models/settings';
import { EnergyExhaustGasOutput } from '../../../../tools-suite-api/process-heating-api.service';

@Injectable()
export class EnergyInputExhaustGasCalculationService {
  /** Inputs and results are hourly rates; converting Btu to the result unit matches legacy `convertResult`. */
  calculate(input: EnergyInputExhaustGasLoss, settings: Settings): EnergyExhaustGasOutput {
    const heatInputUnit = settings.unitsOfMeasure === 'Metric' ? 'GJ' : 'MMBtu';
    const totalHeatInputBtu = new ConvertValue(input.totalHeatInput, heatInputUnit, 'Btu').convertedValue;

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
    return isNaN(btu) ? 0 : new ConvertValue(btu, 'Btu', settings.energyResultUnit).convertedValue;
  }
}
