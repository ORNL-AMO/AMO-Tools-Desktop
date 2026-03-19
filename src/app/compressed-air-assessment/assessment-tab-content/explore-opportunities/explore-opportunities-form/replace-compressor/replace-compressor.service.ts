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
      implementationCost: [replaceCompressor.implementationCost],
      salvageValue: [replaceCompressor.salvageValue]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup, currentCompressorMapping: Array<{originalCompressorId: string, isReplaced: boolean}>, replacementCompressorMapping: Array<{replacementCompressorId: string, isAdded: boolean}>, trimSelections: Array<{dayTypeId: string, compressorId: string}>): ReplaceCompressor {
    return {
      order: form.controls.order.value,
      implementationCost: form.controls.implementationCost.value,
      currentCompressorMapping: currentCompressorMapping,
      replacementCompressorMapping: replacementCompressorMapping,
      salvageValue: form.controls.salvageValue.value,
      trimSelections: trimSelections
    };
  }
}
