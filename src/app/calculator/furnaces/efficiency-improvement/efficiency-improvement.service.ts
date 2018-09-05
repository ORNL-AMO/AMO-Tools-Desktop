import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { EfficiencyImprovementInputs } from '../../../shared/models/phast/efficiencyImprovement';

@Injectable()
export class EfficiencyImprovementService {
  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  initDefaultValues(settings: Settings): EfficiencyImprovementInputs {
    if (settings.unitsOfMeasure == 'Metric') {
      return {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        currentCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        newCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(750).from('F').to('C'), 2),
        currentEnergyInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2),
        newFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1600).from('F').to('C'), 2)
      }
    }
    else {
      return {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentFlueGasTemp: 80,
        currentCombustionAirTemp: 80,
        newCombustionAirTemp: 750,
        currentEnergyInput: 10,
        newFlueGasTemp: 1600
      }
    }
  }

}
