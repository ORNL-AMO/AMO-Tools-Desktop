import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AddPrimaryReceiverVolume } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class AddReceiverVolumeService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(addPrimaryReceiverVolume: AddPrimaryReceiverVolume): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      increasedVolume: [addPrimaryReceiverVolume.increasedVolume, [Validators.min(0), Validators.required]],
      implementationCost: [addPrimaryReceiverVolume.implementationCost, [Validators.min(0)]],
      order: [addPrimaryReceiverVolume.order]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): AddPrimaryReceiverVolume {
    return {
      increasedVolume: form.controls.increasedVolume.value,
      implementationCost: form.controls.implementationCost.value,
      order: form.controls.order.value
    }
  }
}
