import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { PsatInputs } from '../../shared/models/psat';

@Injectable()
export class MotorService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(psatInput: PsatInputs): FormGroup {
    let efficiencyValidators: Array<ValidatorFn>;
    let form: FormGroup = this.formBuilder.group({
      frequency: [psatInput.line_frequency, Validators.required],
      horsePower: [psatInput.motor_rated_power, Validators.required],
      motorRPM: [psatInput.motor_rated_speed, Validators.required],
      efficiencyClass: [psatInput.efficiency_class, Validators.required],
      efficiency: [psatInput.efficiency, efficiencyValidators],
      motorVoltage: [psatInput.motor_rated_voltage, Validators.required],
      fullLoadAmps: [psatInput.motor_rated_fla, Validators.required]
    })
    return form;
  }

  getEfficiencyValidators(psatInput: PsatInputs): Array<ValidatorFn>{
    if(psatInput.efficiency_class == 3){
      return [Validators.required, Validators.min(0), Validators.max(100)];
    }else{
      return [];
    }
  }


  getInputsFromFrom(form: FormGroup, psatInputs: PsatInputs): PsatInputs {
    psatInputs.line_frequency = form.controls.frequency.value;
    psatInputs.motor_rated_power = form.controls.horsePower.value;
    psatInputs.motor_rated_speed = form.controls.motorRPM.value;
    psatInputs.efficiency_class = form.controls.efficiencyClass.value;
    psatInputs.efficiency = form.controls.efficiency.value;
    psatInputs.motor_rated_voltage = form.controls.motorVoltage.value;
    psatInputs.motor_rated_fla = form.controls.fullLoadAmps.value;
    return psatInputs;
  }
}
