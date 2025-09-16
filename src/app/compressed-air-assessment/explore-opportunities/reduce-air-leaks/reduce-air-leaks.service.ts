import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ReduceAirLeaks } from '../../../shared/models/compressed-air-assessment';
import { BaselineResults } from '../../calculations/caCalculationModels';

@Injectable()
export class ReduceAirLeaksService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(reduceAirLeaks: ReduceAirLeaks, baselineResults: BaselineResults): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      leakFlow: [reduceAirLeaks.leakFlow, [Validators.min(0), Validators.max(baselineResults.total.maxAirFlow), Validators.required]],
      leakReduction: [reduceAirLeaks.leakReduction, [Validators.min(0), Validators.max(100), Validators.required]],
      implementationCost: [reduceAirLeaks.implementationCost, Validators.min(0)],
      order: [reduceAirLeaks.order, [Validators.required]]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): ReduceAirLeaks {
    return {
      leakFlow: form.controls.leakFlow.value,
      leakReduction: form.controls.leakReduction.value,
      implementationCost: form.controls.implementationCost.value,
      order: form.controls.order.value
    }
  }
}
