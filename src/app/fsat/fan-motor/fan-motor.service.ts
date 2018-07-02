import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FanMotor } from '../../shared/models/fans';

@Injectable()
export class FanMotorService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: FanMotor): FormGroup {
    let form = this.formBuilder.group({
      lineFrequency: [obj.lineFrequency, Validators.required],
      motorRatedPower: [obj.motorRatedPower, Validators.required],
      motorRpm: [obj.motorRpm, Validators.required],
      efficiencyClass: [obj.efficiencyClass, Validators.required],
      specifiedEfficiency: [obj.specifiedEfficiency],
      motorRatedVoltage: [obj.motorRatedVoltage, Validators.required],
      fullLoadAmps: [obj.fullLoadAmps, Validators.required]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): FanMotor {
    let obj: FanMotor = {
      lineFrequency: form.controls.lineFrequency.value,
      motorRatedPower: form.controls.motorRatedPower.value,
      motorRpm: form.controls.motorRpm.value,
      efficiencyClass: form.controls.efficiencyClass.value,
      specifiedEfficiency: form.controls.specifiedEfficiency.value,
      motorRatedVoltage: form.controls.motorRatedVoltage.value,
      fullLoadAmps: form.controls.fullLoadAmps.value
    }
    return obj;
  }

  isFanMotorValid(obj: FanMotor): boolean {
    let form: FormGroup = this.getFormFromObj(obj);
    if (form.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }
}