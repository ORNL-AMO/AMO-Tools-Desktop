import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FanSetup } from '../../shared/models/fans';

@Injectable()
export class FanSetupService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(obj: FanSetup): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      fanType: [obj.fanType, Validators.required],
      fanSpecified: [obj.fanSpecified],
      fanSpeed: [obj.fanSpeed, Validators.required],
      drive: [obj.drive, Validators.required],
      fanEfficiency: [obj.fanEfficiency]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): FanSetup {
    let obj: FanSetup = {
      fanType: form.controls.fanType.value,
      fanSpecified: form.controls.fanSpecified.value,
      fanSpeed: form.controls.fanSpeed.value,
      drive: form.controls.drive.value,
      fanEfficiency: form.controls.fanEfficiency.value
    }
    return obj;
  }

  isFanSetupValid(obj: FanSetup): boolean{
    let form: FormGroup = this.getFormFromObj(obj);
    if(form.status == 'VALID'){
      return true;
    }else{
      return false;
    }
  }
}