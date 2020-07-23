import { Injectable } from '@angular/core';
import { RequiredMotorData } from '../../../motor-inventory';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class RequiredMotorDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromRequiredMotorData(requiredMotorData: RequiredMotorData): FormGroup {
    return this.formBuilder.group({
      lineFrequency: [requiredMotorData.lineFrequency, [Validators.required]],
      ratedMotorPower: [requiredMotorData.ratedMotorPower, [Validators.required]],
      efficiencyClass: [requiredMotorData.efficiencyClass, [Validators.required]],
      nominalEfficiency: [requiredMotorData.nominalEfficiency, [Validators.required]],
      synchronousSpeed: [requiredMotorData.synchronousSpeed, [Validators.required]],
      fullLoadAmps: [requiredMotorData.fullLoadAmps],
      motorRpm: [requiredMotorData.motorRpm]
    });
  }

  updateRequiredMotorDataFromForm(form: FormGroup, requiredMotorData: RequiredMotorData): RequiredMotorData {
    requiredMotorData.lineFrequency = form.controls.lineFrequency.value;
    requiredMotorData.ratedMotorPower = form.controls.ratedMotorPower.value;
    requiredMotorData.efficiencyClass = form.controls.efficiencyClass.value;
    requiredMotorData.nominalEfficiency = form.controls.nominalEfficiency.value;
    requiredMotorData.synchronousSpeed = form.controls.synchronousSpeed.value;
    requiredMotorData.fullLoadAmps = form.controls.fullLoadAmps.value;
    requiredMotorData.motorRpm = form.controls.motorRpm.value;
    return requiredMotorData;
  }

}
