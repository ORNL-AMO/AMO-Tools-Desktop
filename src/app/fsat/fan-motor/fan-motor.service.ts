import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { FanMotor } from '../../shared/models/fans';

@Injectable()
export class FanMotorService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: FanMotor): FormGroup {
    let specifiedEfficiencyValidators: Array<ValidatorFn> = this.getEfficiencyValidators(obj.efficiencyClass);
    let form: FormGroup = this.formBuilder.group({
      lineFrequency: [obj.lineFrequency, Validators.required],
      motorRatedPower: [obj.motorRatedPower, Validators.required],
      motorRpm: [obj.motorRpm, Validators.required],
      efficiencyClass: [obj.efficiencyClass, Validators.required],
      specifiedEfficiency: [obj.specifiedEfficiency, specifiedEfficiencyValidators],
      motorRatedVoltage: [obj.motorRatedVoltage, Validators.required],
      fullLoadAmps: [obj.fullLoadAmps, Validators.required]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }


  getEfficiencyValidators(effClass: number): Array<ValidatorFn> {
    if (effClass === 3) {
      return [Validators.required, Validators.min(0), Validators.max(100)];
    } else {
      return [];
    }
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
    };
    return obj;
  }

  isFanMotorValid(obj: FanMotor): boolean {
    let form: FormGroup = this.getFormFromObj(obj);
    if (form.status === 'VALID') {
      return true;
    } else {
      return false;
    }
  }
}
