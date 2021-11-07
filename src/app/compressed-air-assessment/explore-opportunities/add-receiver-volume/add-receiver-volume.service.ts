import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddPrimaryReceiverVolume } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class AddReceiverVolumeService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(addPrimaryReceiverVolume: AddPrimaryReceiverVolume): FormGroup {
    let form: FormGroup = this.formBuilder.group({
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

  getObjFromForm(form: FormGroup): AddPrimaryReceiverVolume {
    return {
      increasedVolume: form.controls.increasedVolume.value,
      implementationCost: form.controls.implementationCost.value,
      order: form.controls.order.value
    }
  }
}
