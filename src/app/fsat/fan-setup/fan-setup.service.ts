import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
}

export interface FanSetup {
  fanType: string,
  fanSpeed: number,
  drive: string,
  stages: number
}