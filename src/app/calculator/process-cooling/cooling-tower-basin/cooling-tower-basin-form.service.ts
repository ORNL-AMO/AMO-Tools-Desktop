import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoolingTowerBasinInput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class CoolingTowerBasinFormService {

  constructor(private formBuilder: FormBuilder) {}

  getCoolingTowerBasinForm(inputObj: CoolingTowerBasinInput, settings: Settings): FormGroup {
    let minTemperature: number = 32;
    if (settings.unitsOfMeasure === 'Metric') {
      minTemperature = 0;
    }
    let form: FormGroup = this.formBuilder.group({
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      ratedCapacity: [inputObj.ratedCapacity, [Validators.required, Validators.min(0)]],
      ratedTempSetPoint: [inputObj.ratedTempSetPoint, [Validators.required, Validators.min(minTemperature)]],
      ratedTempDryBulb: [inputObj.ratedTempDryBulb, Validators.required],
      ratedWindSpeed: [inputObj.ratedWindSpeed, [Validators.required, Validators.min(0)]],
      panLossRatio: [inputObj.panLossRatio, [Validators.required, Validators.min(0), Validators.max(1)]],
      operatingTempDryBulb: [inputObj.operatingTempDryBulb, Validators.required],
      operatingWindSpeed: [inputObj.operatingWindSpeed, Validators.required],
      baselineTempSetPoint: [inputObj.baselineTempSetPoint, [Validators.required, Validators.min(minTemperature)]],
      modTempSetPoint: [inputObj.modTempSetPoint, [Validators.required, Validators.min(minTemperature)]]
    });

    return form;
  }

  checkCoolingTowerBasinWarnings(form: FormGroup, settings: Settings): CoolingTowerBasinWarnings {
    return {
      basinTempSetPoint: this.checkBasinTempSetPoint(form.controls.ratedTempSetPoint.value, settings),
      baselineTempSetPoint: this.checkBasinTempSetPoint(form.controls.baselineTempSetPoint.value, settings),
      modTempSetPoint: this.checkBasinTempSetPoint(form.controls.modTempSetPoint.value, settings),
    };
  }

  checkBasinTempSetPoint(basinTempSetPoint: number, settings: Settings) {
    let maxTemperature: number = 50;
    if (settings.unitsOfMeasure == 'Metric') {
      maxTemperature = 10;
    }
    if (basinTempSetPoint && basinTempSetPoint > maxTemperature) {
      return `Basin temperature should be less than ${maxTemperature}, `
    } else {
      return null;
    }
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

export interface CoolingTowerBasinWarnings {
  basinTempSetPoint: string;
  baselineTempSetPoint: string;
  modTempSetPoint: string;
}
