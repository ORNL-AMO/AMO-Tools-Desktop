import { Injectable } from '@angular/core';
import { OperatingHours } from '../../../shared/models/operations';
import { OperatingCostInput } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class OperatingCostService {


  input: OperatingCostInput;
  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.input = this.getDefaultData();
  }

  getDefaultData(): OperatingCostInput {
    return {
      motorBhp: 0,
      bhpUnloaded: 0,
      annualOperatingHours: 8760,
      runTimeLoaded: 0,
      efficiencyLoaded: 0,
      efficiencyUnloaded: 0,
      costOfElectricity: 0,
    };
  }

  getExampleData(): OperatingCostInput {
    return {
      motorBhp: 215,
      bhpUnloaded: 25,
      annualOperatingHours: 6800,
      runTimeLoaded: 85,
      efficiencyLoaded: 95,
      efficiencyUnloaded: 90,
      costOfElectricity: 0.05,
    }
  }
  

  convertOperatingCostExample(inputs: OperatingCostInput, settings: Settings) {
    let tmpInputs: OperatingCostInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.motorBhp = Math.round(this.convertUnitsService.value(tmpInputs.motorBhp).from('hp').to('kW') * 100) / 100;
    }
    return tmpInputs;
  }
}
