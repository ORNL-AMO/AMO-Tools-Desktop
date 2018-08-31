import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';

@Injectable()
export class NemaEnergyEfficiencyService {
  nemaInputs:NemaInputs;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService) { }

  initForm(): FormGroup {
    return this.formBuilder.group({
      frequency: ['50 Hz', [Validators.required]],
      horsePower: ['200', [Validators.required]],
      efficiencyClass: ['Standard Efficiency', [Validators.required]],
      motorRPM: [1200, [Validators.required]],
      efficiency: ['', [Validators.min(1), Validators.max(100)]]
    })
  }

  initFormFromPsat(psat: PSAT): FormGroup {
    let lineFreq: string = this.psatService.getLineFreqFromEnum(psat.inputs.line_frequency);
    let efficiency: string = this.psatService.getEfficiencyClassFromEnum(psat.inputs.efficiency_class);
    return this.formBuilder.group({
      frequency: [lineFreq, [Validators.required]],
      horsePower: [psat.inputs.motor_rated_power.toString(), [Validators.required]],
      efficiencyClass: [efficiency, [Validators.required]],
      motorRPM: [psat.inputs.motor_rated_speed, [Validators.required]],
      efficiency: [psat.inputs.efficiency, [Validators.min(1), Validators.max(100)]]
    })
  }

  initFormFromObj(obj: NemaInputs): FormGroup {
    return this.formBuilder.group({
      frequency: [obj.frequency, [Validators.required]],
      horsePower: [obj.frequency, [Validators.required]],
      efficiencyClass: [obj.frequency, [Validators.required]],
      motorRPM: [obj.frequency, [Validators.required]],
      efficiency: [obj.frequency, [Validators.min(1), Validators.max(100)]]
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
