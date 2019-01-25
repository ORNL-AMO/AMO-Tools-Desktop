import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';

@Injectable()
export class NemaEnergyEfficiencyService {
  nemaInputs:NemaInputs;
  constructor(private formBuilder: FormBuilder) { }

  initForm(): FormGroup {
    return this.formBuilder.group({
      frequency: [50, [Validators.required]],
      horsePower: [200, [Validators.required]],
      efficiencyClass: [0, [Validators.required]],
      motorRPM: [1200, [Validators.required]],
      efficiency: ['', [Validators.min(1), Validators.max(100)]]
    })
  }

  initFormFromPsat(psat: PSAT): FormGroup {
    // let lineFreq: string = this.psatService.getLineFreqFromEnum(psat.inputs.line_frequency);
    // let efficiency: string = this.psatService.getEfficiencyClassFromEnum(psat.inputs.efficiency_class);
    return this.formBuilder.group({
      frequency: [psat.inputs.line_frequency, [Validators.required]],
      horsePower: [psat.inputs.motor_rated_power, [Validators.required, Validators.min(0)]],
      efficiencyClass: [psat.inputs.efficiency_class, [Validators.required]],
      motorRPM: [psat.inputs.motor_rated_speed, [Validators.required]],
      efficiency: [psat.inputs.efficiency, [Validators.min(1), Validators.max(100)]]
    })
  }

  initFormFromObj(obj: NemaInputs): FormGroup {
    return this.formBuilder.group({
      frequency: [obj.frequency, [Validators.required]],
      horsePower: [obj.horsePower, [Validators.required]],
      efficiencyClass: [obj.efficiencyClass, [Validators.required]],
      motorRPM: [obj.motorRPM, [Validators.required]],
      efficiency: [obj.efficiency, [Validators.min(1), Validators.max(100)]]
    })
  }

  getObjFromForm(form: FormGroup): NemaInputs {
    return {
      frequency: form.controls.frequency.value,
      horsePower: form.controls.horsePower.value,
      efficiencyClass: form.controls.efficiencyClass.value,
      motorRPM: form.controls.motorRPM.value,
      efficiency: form.controls.efficiency.value
    }
  }
}

export interface NemaInputs {
  frequency: string,
  horsePower: string,
  efficiencyClass: string,
  motorRPM: number,
  efficiency: number
}
