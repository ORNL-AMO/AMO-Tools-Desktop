import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CoolingTowerFanInput } from '../../../shared/models/chillers';

@Injectable()
export class CoolingTowerFanFormService {

  constructor(private formBuilder: UntypedFormBuilder) {}

  getCoolingTowerFanForm(inputObj: CoolingTowerFanInput): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      towerType: [inputObj.towerType, Validators.required],
      numCells: [inputObj.numCells, [Validators.required, Validators.min(0)]],
      waterFlowRate: [inputObj.waterFlowRate, [Validators.required, Validators.min(0)]],
      ratedFanPower: [inputObj.ratedFanPower, [Validators.required, Validators.min(0)]],
      waterLeavingTemp: [inputObj.waterLeavingTemp, Validators.required],
      waterEnteringTemp: [inputObj.waterEnteringTemp, Validators.required],
      operatingTempWetBulb: [inputObj.operatingTempWetBulb, Validators.required],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      baselineSpeedType: [inputObj.baselineSpeedType, Validators.required],
      modSpeedType: [inputObj.modSpeedType, Validators.required],      
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]]
    });

    form = this.setWaterTempValidators(form);
    return form;
  }

  setWaterTempValidators(formGroup: UntypedFormGroup) {
    let waterLeavingTemp = formGroup.controls.waterLeavingTemp.value;
    let waterEnteringTemp = formGroup.controls.waterEnteringTemp.value;

    formGroup.controls.waterLeavingTemp.setValidators([Validators.required, Validators.max(waterEnteringTemp)]);
    formGroup.controls.waterLeavingTemp.markAsDirty();
    formGroup.controls.waterLeavingTemp.updateValueAndValidity();

    formGroup.controls.operatingTempWetBulb.setValidators([Validators.required, Validators.max(waterEnteringTemp)]);
    formGroup.controls.operatingTempWetBulb.markAsDirty();
    formGroup.controls.operatingTempWetBulb.updateValueAndValidity();

    formGroup.controls.waterEnteringTemp.setValidators([Validators.required, Validators.min(waterLeavingTemp)]);
    formGroup.controls.waterEnteringTemp.markAsDirty();
    formGroup.controls.waterEnteringTemp.updateValueAndValidity();
    
    return formGroup;
}

  getCoolingTowerFanInput(form: UntypedFormGroup): CoolingTowerFanInput {
    let obj: CoolingTowerFanInput = {
      towerType: form.controls.towerType.value,
      numCells: form.controls.numCells.value,
      waterFlowRate: form.controls.waterFlowRate.value,
      ratedFanPower: form.controls.ratedFanPower.value,
      waterLeavingTemp: form.controls.waterLeavingTemp.value,
      waterEnteringTemp: form.controls.waterEnteringTemp.value,
      operatingTempWetBulb: form.controls.operatingTempWetBulb.value,
      operatingHours: form.controls.operatingHours.value,
      baselineSpeedType: form.controls.baselineSpeedType.value,
      modSpeedType: form.controls.modSpeedType.value,
      electricityCost: form.controls.electricityCost.value
    };
    return obj;
  }
}
