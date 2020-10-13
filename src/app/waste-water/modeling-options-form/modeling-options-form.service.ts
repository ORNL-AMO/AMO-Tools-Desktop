import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModelingOptions } from '../../shared/models/waste-water';

@Injectable()
export class ModelingOptionsFormService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: ModelingOptions): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      TimeIncrement: [obj.TimeIncrement, [Validators.required, Validators.min(0)]],
      MaxDays: [obj.MaxDays, [Validators.required, Validators.min(0)]]
    });
    return form;
  }

  getObjFromForm(form: FormGroup): ModelingOptions{
    return {
      TimeIncrement: form.controls.TimeIncrement.value,
      MaxDays: form.controls.MaxDays.value,
    }
  }
}
