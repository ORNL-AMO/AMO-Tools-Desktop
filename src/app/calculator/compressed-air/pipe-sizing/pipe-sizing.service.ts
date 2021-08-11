import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PipeSizingInput } from '../../../shared/models/standalone';
import { PipeSizingInputs } from '../../../shared/models/calculators';
import { CompressedAirInputs } from "../../../shared/models/compressed-air-assessment"
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class PipeSizingService {

  inputs: PipeSizingInput;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.inputs = this.getDefaultData();
  }

  getDefaultData(): PipeSizingInput {
    return {
      airFlow: 0,
      airlinePressure: 0,
      designVelocity: 20,
      atmosphericPressure: 14.7
    }
  }

  getExampleData(): PipeSizingInput {
    return {
      airFlow: 1000,
      airlinePressure: 90,
      designVelocity: 25,
      atmosphericPressure: 14.7
    }
  }

  convertPipeSizingExample(inputs: PipeSizingInput, settings: Settings) {
    let tmpInputs: PipeSizingInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.airFlow = Math.round(this.convertUnitsService.value(tmpInputs.airFlow).from('ft3').to('m3') * 100) / 100;
      tmpInputs.airlinePressure = Math.round(this.convertUnitsService.value(tmpInputs.airlinePressure).from('psig').to('kPa') * 100) / 100;
      tmpInputs.designVelocity = Math.round(this.convertUnitsService.value(tmpInputs.designVelocity).from('ft').to('m') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  initForm(settings: Settings): FormGroup {
    return this.formBuilder.group({
      airFlow: [1010, Validators.required],
      airlinePressure: [90, [Validators.required, Validators.min(0)]],
      designVelocity: [20, [Validators.required, Validators.min(0)]],
      atmosphericPressure: [14.7, [Validators.required, Validators.min(0)]],
    });
  }

  initFormFromObj(obj: PipeSizingInputs): FormGroup {
    return this.formBuilder.group({
      airFlow: [obj.airFlow, Validators.required],
      airlinePressure: [obj.airlinePressure, Validators.required],
      designVelocity: [obj.designVelocity, Validators.required],
      atmosphericPressure: [obj.atmosphericPressure, Validators.required]
    });
  }

  getObjFromForm(form: FormGroup): PipeSizingInputs {
    return {
      airFlow: form.controls.airFlow.value,
      airlinePressure: form.controls.airlinePressure.value,
      designVelocity: form.controls.designVelocity.value,
      atmosphericPressure: form.controls.atmosphericPressure.value
    };
  }

  resetForm(settings: Settings): FormGroup {
    return this.formBuilder.group({
      airFlow: [0, Validators.required],
      airlinePressure: [0, Validators.required],
      designVelocity: [20, Validators.required],
      atmosphericPressure: [14.7, Validators.required]
    });
  }

}

