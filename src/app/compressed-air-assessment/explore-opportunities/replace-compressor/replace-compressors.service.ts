import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ReplaceCompressorsEEM } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class ReplaceCompressorsService {
  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(replaceCompressors: ReplaceCompressorsEEM): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      implementationCost: [replaceCompressors.implementationCost, Validators.min(0)],
      order: [replaceCompressors.order, [Validators.required]]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): ReplaceCompressorsEEM {
    return {
      implementationCost: form.controls.implementationCost.value,
      order: form.controls.order.value
    }
  }
}