import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ValidatorFn } from '@angular/forms';
import { FanSetup } from '../../shared/models/fans';

@Injectable()
export class FanSetupService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(obj: FanSetup, isModification: boolean): UntypedFormGroup {
    let fanEfficiencyValidators: Array<ValidatorFn> = [];
    if (isModification) {
      fanEfficiencyValidators = [Validators.required, Validators.min(0), Validators.max(100)];
    }
    let specifiedDriveValidators: Array<ValidatorFn> = [];
    if (obj.drive === 4) {
      specifiedDriveValidators = [Validators.required, Validators.min(0), Validators.max(100)];
    }
    let form: UntypedFormGroup = this.formBuilder.group({
      fanType: [obj.fanType, Validators.required],
      fanEfficiency: [obj.fanEfficiency, fanEfficiencyValidators],
      fanSpeed: [obj.fanSpeed, Validators.required],
      drive: [obj.drive, Validators.required],
      specifiedDriveEfficiency: [obj.specifiedDriveEfficiency, specifiedDriveValidators]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  changeFanType(form: UntypedFormGroup): UntypedFormGroup {
    if (form.controls.fanType.value === 12) {
      form.controls.fanEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      form.controls.fanEfficiency.reset(form.controls.fanEfficiency.value);
      form.controls.fanEfficiency.markAsDirty();
    } else {
      form.controls.fanEfficiency.setValidators([]);
      form.controls.fanEfficiency.reset(form.controls.fanEfficiency.value);
      form.controls.fanEfficiency.markAsDirty();
    }
    return form;
  }

  changeDriveType(form: UntypedFormGroup): UntypedFormGroup {
    if (form.controls.drive.value === 4) {
      form.controls.specifiedDriveEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      form.controls.specifiedDriveEfficiency.reset(form.controls.specifiedDriveEfficiency.value);
      form.controls.specifiedDriveEfficiency.markAsDirty();
    } else {
      form.controls.specifiedDriveEfficiency.setValidators([]);
      form.controls.specifiedDriveEfficiency.reset(form.controls.specifiedDriveEfficiency.value);
      form.controls.specifiedDriveEfficiency.markAsDirty();
    }
    return form;
  }


  getObjFromForm(form: UntypedFormGroup): FanSetup {
    let obj: FanSetup = {
      fanType: form.controls.fanType.value,
      fanEfficiency: form.controls.fanEfficiency.value,
      fanSpeed: form.controls.fanSpeed.value,
      drive: form.controls.drive.value,
      specifiedDriveEfficiency: form.controls.specifiedDriveEfficiency.value
    };
    return obj;
  }

  isFanSetupValid(obj: FanSetup, isModification: boolean): boolean {
    let form: UntypedFormGroup = this.getFormFromObj(obj, isModification);
    return form.valid;
  }
}
