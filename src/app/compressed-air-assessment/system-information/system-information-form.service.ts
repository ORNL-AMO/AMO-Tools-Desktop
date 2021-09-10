import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { SystemInformation } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class SystemInformationFormService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: SystemInformation): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      systemElevation: [obj.systemElevation, [Validators.required, Validators.min(0), Validators.max(29000)]],
      totalAirStorage: [obj.totalAirStorage, [Validators.required, Validators.min(0)]],
      isSequencerUsed: [obj.isSequencerUsed],
      targetPressure: [obj.targetPressure],
      variance: [obj.variance]

    });

    form = this.setSequencerFieldValidators(form);
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  setSequencerFieldValidators(form: FormGroup) {
    if (form.controls.isSequencerUsed.value === true) {
      form.controls.targetPressure.setValidators([Validators.required]);
      form.controls.targetPressure.markAsDirty();
      form.controls.targetPressure.updateValueAndValidity();
      form.controls.variance.setValidators([Validators.required]);
      form.controls.variance.markAsDirty();
      form.controls.variance.updateValueAndValidity();
    }
    return form;
  }

  getObjFromForm(form: FormGroup): SystemInformation {
    return {
      systemElevation: form.controls.systemElevation.value,
      totalAirStorage: form.controls.totalAirStorage.value,
      isSequencerUsed: form.controls.isSequencerUsed.value,
      targetPressure: form.controls.targetPressure.value,
      variance: form.controls.variance.value
    }
  }
}
