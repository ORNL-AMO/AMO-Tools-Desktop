import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UseAutomaticSequencer } from '../../../shared/models/compressed-air-assessment';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class UseAutomaticSequencerService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(useAutomaticSequencer: UseAutomaticSequencer): UntypedFormGroup {
    let varianceValidators: Array<ValidatorFn> = [GreaterThanValidator.greaterThan(0), Validators.required];
    if (useAutomaticSequencer.targetPressure) {
      let maxVariance: number = useAutomaticSequencer.targetPressure * .5;
      varianceValidators.push(Validators.max(maxVariance));
    }
    let form: UntypedFormGroup = this.formBuilder.group({
      targetPressure: [useAutomaticSequencer.targetPressure, [Validators.min(0), Validators.required]],
      variance: [useAutomaticSequencer.variance, varianceValidators],
      implementationCost: [useAutomaticSequencer.implementationCost, [Validators.min(0)]],
      order: [useAutomaticSequencer.order]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  updateObjFromForm(form: UntypedFormGroup, useAutomaticSequencer: UseAutomaticSequencer): UseAutomaticSequencer {
    useAutomaticSequencer.targetPressure = form.controls.targetPressure.value;
    useAutomaticSequencer.variance = form.controls.variance.value;
    useAutomaticSequencer.implementationCost = form.controls.implementationCost.value;
    useAutomaticSequencer.order = form.controls.order.value;
    return useAutomaticSequencer;
  }
}
