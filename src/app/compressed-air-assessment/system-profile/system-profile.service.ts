import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class SystemProfileService {

  constructor(private formBuilder: FormBuilder) { }

  getProfileSetupForm(): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      dayType: [],
      numberOfHours: [24, [Validators.required, Validators.min(24)]],
      dataInterval: []
    })
    return form;
  }

}
