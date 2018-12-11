import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class AchievableEfficiencyService {

  pumpType: number;
  flowRate: number;
  constructor(private formBuilder: FormBuilder) { }


  getForm(pumpType: number, flowRate: number): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      pumpType: [pumpType, Validators.required],
      flowRate: [flowRate, [Validators.required, Validators.min(0)]]
    })
    if(form.controls.flowRate.value){
      form.controls.flowRate.markAsDirty();
    }
    return form;
  }
}
