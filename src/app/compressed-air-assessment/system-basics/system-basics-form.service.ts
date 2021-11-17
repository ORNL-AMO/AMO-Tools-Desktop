import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CASystemBasics } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class SystemBasicsFormService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: CASystemBasics): FormGroup{
    return this.formBuilder.group({
      'utilityType': [obj.utilityType, Validators.required],
      'demandCost': [obj.demandCost, [Validators.required, Validators.min(0)]],
      'electricityCost': [obj.electricityCost, [Validators.required, Validators.min(0)]],
      'notes': [obj.notes]
    });
  }

  getObjFromForm(form: FormGroup): CASystemBasics{
    return {
      utilityType: form.controls.utilityType.value,
      demandCost: form.controls.demandCost.value,
      electricityCost: form.controls.electricityCost.value,
      notes: form.controls.notes.value
    }
  }
}
