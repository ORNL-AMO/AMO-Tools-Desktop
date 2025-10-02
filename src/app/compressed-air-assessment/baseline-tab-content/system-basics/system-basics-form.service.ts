import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CASystemBasics } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class SystemBasicsFormService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: CASystemBasics): UntypedFormGroup{
    return this.formBuilder.group({
      'utilityType': [obj.utilityType, Validators.required],
      'demandCost': [obj.demandCost, [Validators.required, Validators.min(0)]],
      'electricityCost': [obj.electricityCost, [Validators.required, Validators.min(0)]],
      'notes': [obj.notes]
    });
  }

  getObjFromForm(form: UntypedFormGroup): CASystemBasics{
    return {
      utilityType: form.controls.utilityType.value,
      demandCost: form.controls.demandCost.value,
      electricityCost: form.controls.electricityCost.value,
      notes: form.controls.notes.value
    }
  }
}
