import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoolingTowerFanInput } from '../../../shared/models/chillers';

@Injectable()
export class CoolingTowerFanFormService {

  constructor(private formBuilder: FormBuilder) {}

  getCoolingTowerFanForm(inputObj: CoolingTowerFanInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      towerType: [inputObj.towerType, Validators.required],
      numCells: [inputObj.numCells, [Validators.required, Validators.min(1), Validators.max(10)]],
      waterFlowRate: [inputObj.waterFlowRate, Validators.required],
      ratedFanPower: [inputObj.ratedFanPower, Validators.required],
      waterLeavingTemp: [inputObj.waterLeavingTemp, Validators.required],
      waterEnteringTemp: [inputObj.waterEnteringTemp, Validators.required],
      operatingTempWetBulb: [inputObj.operatingTempWetBulb, Validators.required],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      baselineSpeedType: [inputObj.baselineSpeedType, Validators.required],
      modSpeedType: [inputObj.modSpeedType, Validators.required],
    });

    return form;
  }

  getCoolingTowerFanInput(form: FormGroup): CoolingTowerFanInput {
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
    };
    return obj;
  }
}
