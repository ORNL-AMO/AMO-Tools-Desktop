import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ProcessCoolingSystemBasics } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class SystemBasicsFormService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: ProcessCoolingSystemBasics): UntypedFormGroup{
    return this.formBuilder.group({
      'utilityType': [obj.utilityType, Validators.required],
      'notes': [obj.notes]
    });
  }

  getObjFromForm(form: UntypedFormGroup): ProcessCoolingSystemBasics {
    return {
      utilityType: form.controls.utilityType.value,
      notes: form.controls.notes.value,
    }
  }
}
