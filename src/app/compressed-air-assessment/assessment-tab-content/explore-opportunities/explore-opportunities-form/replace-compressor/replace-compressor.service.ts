import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ReplaceCompressor } from '../../../../../shared/models/compressed-air-assessment';

@Injectable({
  providedIn: 'root'
})
export class ReplaceCompressorService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(replaceCompressor: ReplaceCompressor): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      order: [replaceCompressor.order],
      implementationCost: [replaceCompressor.implementationCost]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup, replaceCompressorMapping: Array<{originalCompressorId: string, replacementCompressorId: string}>): ReplaceCompressor {
    return {
      order: form.controls.order.value,
      implementationCost: form.controls.implementationCost.value,
      compressorsMapping: replaceCompressorMapping,

    };
  }
}
