import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemBasics } from '../../shared/models/waste-water';

@Injectable()
export class SystemBasicsService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: SystemBasics): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      TimeIncrement: [obj.TimeIncrement, [Validators.required, Validators.min(0)]],
      MaxDays: [obj.MaxDays, [Validators.required, Validators.min(0)]],
      equipmentNotes: [obj.equipmentNotes],
      operatingMonths: [obj.operatingMonths, [Validators.min(1), Validators.max(12)]]
    });
    return form;
  }

  getObjFromForm(form: FormGroup): SystemBasics{
    return {
      TimeIncrement: form.controls.TimeIncrement.value,
      MaxDays: form.controls.MaxDays.value,
      equipmentNotes: form.controls.equipmentNotes.value,
      operatingMonths: form.controls.operatingMonths.value
    }
  }
}
