import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class FanFieldDataService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(obj: FanFieldData): FormGroup {
    let form = this.formBuilder.group({
      operatingFraction: [obj.operatingFraction, Validators.required],
      flowRate: [obj.flowRate, Validators.required],
      pressure: [obj.pressure, Validators.required],
      loadEstimatedMethod: [obj.loadEstimatedMethod, Validators.required],
      motorPower: [obj.motorPower, Validators.required],
      cost: [obj.cost, Validators.required]
    })
    return form;
  }
}


export interface FanFieldData {
  operatingFraction: number,
  cost: number,
  flowRate: number,
  pressure: number,
  loadEstimatedMethod: string,
  motorPower: number
}