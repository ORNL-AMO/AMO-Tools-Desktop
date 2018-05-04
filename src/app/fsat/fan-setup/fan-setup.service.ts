import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class FanSetupService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(obj: FanSetup): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      fanType: obj.fanType,
      fanSpeed: obj.fanSpeed,
      drive: obj.drive,
      stages: obj.stages
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