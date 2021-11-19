import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemBasics } from '../../shared/models/waste-water';

@Injectable()
export class SystemBasicsService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: SystemBasics): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      equipmentNotes: [obj.equipmentNotes]
    });
    return form;
  }

  getObjFromForm(form: FormGroup): SystemBasics{
    return {    
      equipmentNotes: form.controls.equipmentNotes.value
    }
  }
}
