import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class FanSystemCurveFormService {

  constructor(private formBuilder: FormBuilder) { }

  getForm(): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      compressibilityFactor: [.98, [Validators.required, Validators.min(0)]],
      systemLossExponent: [1.9, [Validators.required, Validators.min(0)]],
      pointOneFlowRate: [0, [Validators.required, Validators.min(0)]],
      pointOnePressure: [0, [Validators.required, Validators.min(0)]],
      pointTwo: [''],
      pointTwoFlowRate: [0, [Validators.required, Validators.min(0)]],
      pointTwoPressure: [0, [Validators.required, Validators.min(0)]],
    })
    return form;
  }
}
