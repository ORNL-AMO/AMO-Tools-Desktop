import { Injectable } from '@angular/core';
import { O2Enrichment } from '../../../shared/models/phast/o2Enrichment';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class O2EnrichmentService {
  o2Enrichment: O2Enrichment;
  lines: Array<any> = [];
  constructor(private convertUnitsService: ConvertUnitsService) { }

  initDefaultValues(settings: Settings): O2Enrichment {
    if (settings.unitsOfMeasure == 'Metric') {
      return {
        o2CombAir: 21,
        o2CombAirEnriched: 100,
        flueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1800).from('F').to('C'), 2),
        flueGasTempEnriched: this.convertUnitsService.roundVal(this.convertUnitsService.value(1800).from('F').to('C'), 2),
        o2FlueGas: 5,
        o2FlueGasEnriched: 1,
        combAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(900).from('F').to('C'), 2),
        combAirTempEnriched: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        fuelConsumption: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2)
      };
    }
    else {
      return {
        o2CombAir: 21,
        o2CombAirEnriched: 100,
        flueGasTemp: 1800,
        flueGasTempEnriched: 1800,
        o2FlueGas: 5,
        o2FlueGasEnriched: 1,
        combAirTemp: 900,
        combAirTempEnriched: 80,
        fuelConsumption: 10
      };
    }
  }
}
