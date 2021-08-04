import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoolingTowerBasinInput } from '../../../shared/models/chillers';

@Injectable()
export class CoolingTowerBasinFormService {

  constructor(private formBuilder: FormBuilder) {}

  getCoolingTowerBasinForm(inputObj: CoolingTowerBasinInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      ratedCapacity: [inputObj.ratedCapacity, [Validators.required, Validators.min(0), Validators.max(8333)]],
      ratedTempSetPoint: [inputObj.ratedTempSetPoint, Validators.required],
      ratedTempDryBulb: [inputObj.ratedTempDryBulb, Validators.required],
      ratedWindSpeed: [inputObj.ratedWindSpeed, Validators.required],
      panLossRatio: [inputObj.panLossRatio, Validators.required],
      operatingTempDryBulb: [inputObj.operatingTempDryBulb, Validators.required],
      operatingWindSpeed: [inputObj.operatingWindSpeed, Validators.required],
      baselineTempSetPoint: [inputObj.baselineTempSetPoint, Validators.required],
      modTempSetPoint: [inputObj.modTempSetPoint, Validators.required]
    });

    return form;
  }

  getCoolingTowerBasinInput(form: FormGroup): CoolingTowerBasinInput {
    let obj: CoolingTowerBasinInput = {
      operatingHours: form.controls.operatingHours.value,
      ratedCapacity: form.controls.ratedCapacity.value,
      ratedTempSetPoint: form.controls.ratedTempSetPoint.value,
      ratedTempDryBulb: form.controls.ratedTempDryBulb.value,
      ratedWindSpeed: form.controls.ratedWindSpeed.value,
      panLossRatio: form.controls.panLossRatio.value,
      operatingTempDryBulb: form.controls.operatingTempDryBulb.value,
      operatingWindSpeed: form.controls.operatingWindSpeed.value,
      baselineTempSetPoint: form.controls.baselineTempSetPoint.value,
      modTempSetPoint: form.controls.modTempSetPoint.value
    };
    return obj;
  }
}
