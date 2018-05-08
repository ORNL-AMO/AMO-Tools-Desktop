import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FanSetup } from '../../shared/models/fans';

@Injectable()
export class FanSetupService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(obj: FanSetup): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      fanType: [obj.fanType, Validators.required],
      fanSpeed: [obj.fanSpeed, Validators.required],
      drive: [obj.drive, Validators.required],
      stages: [obj.stages, Validators.required]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): FanSetup {
    let obj: FanSetup = {
      fanType: form.controls.fanType.value,
      fanSpeed: form.controls.fanSpeed.value,
      drive: form.controls.drive.value,
      stages: form.controls.stages.value
    }
    return obj;
  }
}