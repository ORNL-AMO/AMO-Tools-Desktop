import { Injectable } from '@angular/core';
import { PneumaticAirRequirementInput } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class PneumaticAirService {

  inputs: PneumaticAirRequirementInput;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.inputs = this.getDefaultData();
   }

  getDefaultData(): PneumaticAirRequirementInput {
    return {
      pistonType: 0,
      cylinderDiameter: 0,
      cylinderStroke: 0,
      pistonRodDiameter: 0,
      airPressure: 0,
      cyclesPerMinute: 0
    };
  }

  getExampleData(): PneumaticAirRequirementInput {
    return {
      pistonType: 0,
      cylinderDiameter: 2.25,
      cylinderStroke: 8,
      pistonRodDiameter: 1,
      airPressure: 90,
      cyclesPerMinute: 16
    };
  }

  convertPneumaticCylinderAirExample(inputs: PneumaticAirRequirementInput, settings: Settings) {
    let tmpInputs: PneumaticAirRequirementInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.cylinderDiameter = Math.round(this.convertUnitsService.value(tmpInputs.cylinderDiameter).from('in').to('cm') * 100) / 100;
      tmpInputs.cylinderStroke = Math.round(this.convertUnitsService.value(tmpInputs.cylinderStroke).from('in').to('cm') * 100) / 100;
      tmpInputs.airPressure = Math.round(this.convertUnitsService.value(tmpInputs.airPressure).from('psi').to('kPa') * 100) / 100;
    }
    return tmpInputs;
  }
}
