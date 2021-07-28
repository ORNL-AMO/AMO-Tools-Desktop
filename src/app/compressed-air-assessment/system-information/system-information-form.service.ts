import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { SystemInformation } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class SystemInformationFormService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: SystemInformation): FormGroup {
    let sequencerValidators: Array<ValidatorFn> = [];
    if(obj.isSequencerUsed){
      sequencerValidators = [Validators.required]
    }
    let form: FormGroup = this.formBuilder.group({
      nominalPressure: [obj.nominalPressure, [Validators.required, Validators.min(0)]],
      systemElevation: [obj.systemElevation, [Validators.required, Validators.min(0), Validators.max(29000)]],
      totalAirStorage: [obj.totalAirStorage, [Validators.required, Validators.min(0)]],
      isSequencerUsed: [obj.isSequencerUsed],
      targetPressure: [obj.targetPressure, sequencerValidators],
      variance: [obj.variance, sequencerValidators]

    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: FormGroup): SystemInformation {
    return {
      nominalPressure: form.controls.nominalPressure.value,
      systemElevation: form.controls.systemElevation.value,
      totalAirStorage: form.controls.totalAirStorage.value,
      isSequencerUsed: form.controls.isSequencerUsed.value,
      targetPressure: form.controls.targetPressure.value,
      variance: form.controls.variance.value
    }
  }
}
