import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ReduceRuntime } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class ReduceRunTimeService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(reduceRuntime: ReduceRuntime): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      implementationCost: [reduceRuntime.implementationCost, [Validators.min(0)]],
      order: [reduceRuntime.order]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  updateObjFromForm(form: UntypedFormGroup, reduceRuntime: ReduceRuntime): ReduceRuntime {
    reduceRuntime.implementationCost = form.controls.implementationCost.value;
    reduceRuntime.order = form.controls.order.value;
    return reduceRuntime;
  }
}
