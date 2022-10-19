import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SystemBasics } from '../../shared/models/waste-water';

@Injectable()
export class SystemBasicsService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: SystemBasics): UntypedFormGroup{
    let form: UntypedFormGroup = this.formBuilder.group({
      equipmentNotes: [obj.equipmentNotes]
    });
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): SystemBasics{
    return {    
      equipmentNotes: form.controls.equipmentNotes.value
    }
  }
}
