import { Injectable } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PipeSizingInput } from '../../../shared/models/standalone';
import { PipeSizingInputs } from '../../../shared/models/calculators';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class PipeSizingService {

  inputs: PipeSizingInput;
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.inputs = this.getDefaultData();
  }

  getDefaultData(): PipeSizingInput {
    return {
      airflow: 0,
      airlinePressure: 0,
      designVelocity: 20,
      atmosphericPressure: 14.7
    }
  }

  getExampleData(): PipeSizingInput {
    return {
      airflow: 1000,
      airlinePressure: 90,
      designVelocity: 25,
      atmosphericPressure: 14.7
    }
  }

  convertPipeSizingExample(inputs: PipeSizingInput, settings: Settings) {
    let tmpInputs: PipeSizingInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.airflow = Math.round(this.convertUnitsService.value(tmpInputs.airflow).from('ft3').to('m3') * 100) / 100;
      tmpInputs.airlinePressure = Math.round(this.convertUnitsService.value(tmpInputs.airlinePressure).from('psig').to('kPa') * 100) / 100;
      tmpInputs.designVelocity = Math.round(this.convertUnitsService.value(tmpInputs.designVelocity).from('ft').to('m') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

}

