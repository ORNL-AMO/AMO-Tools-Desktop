import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemProfileSetup } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class SystemProfileService {



  constructor(private formBuilder: FormBuilder) { }

  getProfileSetupFormFromObj(systemProfileSetup: SystemProfileSetup): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      dayType: [systemProfileSetup.dayType],
      numberOfHours: [systemProfileSetup.numberOfHours, [Validators.required, Validators.min(24)]],
      dataInterval: [systemProfileSetup.dataInterval, [Validators.required]],
      profileDataType: [systemProfileSetup.profileDataType]
    })
    return form;
  }

  getProfileSetupFromForm(form: FormGroup): SystemProfileSetup{
    return {
      dayType: form.controls.dayType.value,
      numberOfHours: form.controls.numberOfHours.value,
      dataInterval: form.controls.dataInterval.value,
      profileDataType: form.controls.profileDataType.value
    }
  }

}
