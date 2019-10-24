import { Injectable } from '@angular/core';
import { AirVelocityInput } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class AirVelocityService {

  airVelocityInputs: AirVelocityInput;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.airVelocityInputs = this.getDefault();
  }

  getDefault(): AirVelocityInput {
    return {
      airFlow: 0,
      pipePressure: 0,
      atmosphericPressure: 0,
    };
  }

  getExample(): AirVelocityInput{
    return {
      airFlow: 1800,
      pipePressure: 100,
      atmosphericPressure: 14.7
    };
  }

  convertAirVelocityExample(inputs: AirVelocityInput, settings: Settings) {
    let tmpInputs: AirVelocityInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs = {
        airFlow: Math.round(this.convertUnitsService.value(inputs.airFlow).from('ft3').to('m3') * 100) / 100,
        pipePressure: Math.round(this.convertUnitsService.value(inputs.pipePressure).from('psi').to('kPa') * 100) / 100,
        atmosphericPressure: Math.round(this.convertUnitsService.value(inputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100
      };
      return tmpInputs;
    }
    return tmpInputs;
  }
}
