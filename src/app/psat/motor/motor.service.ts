import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ValidatorFn } from '@angular/forms';
import { PsatInputs } from '../../shared/models/psat';

@Injectable()
export class MotorService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(psatInput: PsatInputs): UntypedFormGroup {
    let efficiencyValidators: Array<ValidatorFn> = this.getEfficiencyValidators(psatInput.efficiency_class);
    let form: UntypedFormGroup = this.formBuilder.group({
      frequency: [psatInput.line_frequency, Validators.required],
      horsePower: [psatInput.motor_rated_power, Validators.required],
      motorRPM: [psatInput.motor_rated_speed, Validators.required],
      efficiencyClass: [psatInput.efficiency_class, Validators.required],
      efficiency: [psatInput.efficiency, efficiencyValidators],
      motorVoltage: [psatInput.motor_rated_voltage, Validators.required],
      fullLoadAmps: [psatInput.motor_rated_fla, Validators.required]
    })
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getEfficiencyValidators(efficiencyClass: number): Array<ValidatorFn> {
    if (efficiencyClass == 3) {
      return [Validators.required, Validators.min(0), Validators.max(100)];
    } else {
      return [];
    }
  }


  getInputsFromFrom(form: UntypedFormGroup, psatInputs: PsatInputs): PsatInputs {
    psatInputs.line_frequency = form.controls.frequency.value;
    psatInputs.motor_rated_power = form.controls.horsePower.value;
    psatInputs.motor_rated_speed = form.controls.motorRPM.value;
    psatInputs.efficiency_class = form.controls.efficiencyClass.value;
    psatInputs.efficiency = form.controls.efficiency.value;
    psatInputs.motor_rated_voltage = form.controls.motorVoltage.value;
    psatInputs.motor_rated_fla = form.controls.fullLoadAmps.value;
    return psatInputs;
  }


  disableFLA(form: UntypedFormGroup): boolean {
    if (
      form.controls.frequency.valid &&
      form.controls.horsePower.valid &&
      form.controls.motorRPM.valid &&
      form.controls.efficiencyClass.valid &&
      form.controls.motorVoltage.valid
    ) {
      if (form.controls.efficiencyClass.value != 3) {
        return false;
      } else {
        if (form.controls.efficiency.value) {
          return false;
        } else {
          return true;
        }
      }
    }
    else {
      return true;
    }
  }

  updateFormEfficiencyValidators(form: UntypedFormGroup): UntypedFormGroup {
    let tmpEfficiencyValidators: Array<ValidatorFn> = this.getEfficiencyValidators(form.controls.efficiencyClass.value);
    form.controls.efficiency.setValidators(tmpEfficiencyValidators);
    form.controls.efficiency.reset(form.controls.efficiency.value);
    if (form.controls.efficiency.value) {
      form.controls.efficiency.markAsDirty();
    }
    return form;
  }
}
