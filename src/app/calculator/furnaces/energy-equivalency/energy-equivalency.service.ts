import { Injectable } from '@angular/core';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../../../shared/models/phast/energyEquivalency';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class EnergyEquivalencyService {
  energyEquivalencyElectric: EnergyEquivalencyElectric;
  energyEquivalencyFuel: EnergyEquivalencyFuel;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  initEquivalencyElectric(settings: Settings): EnergyEquivalencyElectric {
    if (settings.unitsOfMeasure == 'Metric') {
      return {
        fuelFiredEfficiency: 60,
        electricallyHeatedEfficiency: 90,
        fuelFiredHeatInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2)
      };
    }
    else {
      return {
        fuelFiredEfficiency: 60,
        electricallyHeatedEfficiency: 90,
        fuelFiredHeatInput: 10
      };
    }
  }

  initEquivalencyFuel(): EnergyEquivalencyFuel{
    return {
      electricallyHeatedEfficiency: 90,
      fuelFiredEfficiency: 60,
      electricalHeatInput: 1800
    }
  }
}
