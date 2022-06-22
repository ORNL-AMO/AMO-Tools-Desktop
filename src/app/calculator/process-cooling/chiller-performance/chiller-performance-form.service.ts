import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChillerPerformanceInput } from '../../../shared/models/chillers';

@Injectable()
export class ChillerPerformanceFormService {

  constructor(private formBuilder: FormBuilder) {}

  getChillerPerformanceForm(inputObj: ChillerPerformanceInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      chillerType: [inputObj.chillerType],
      condenserCoolingType: [inputObj.condenserCoolingType, Validators.required],
      motorDriveType: [inputObj.motorDriveType, Validators.required],
      compressorConfigType: [inputObj.compressorConfigType, Validators.required],
      ariCapacity: [inputObj.ariCapacity, Validators.required],
      ariEfficiency: [inputObj.ariEfficiency, Validators.required],
      maxCapacityRatio: [inputObj.maxCapacityRatio, Validators.required],
      waterDeltaT: [inputObj.waterDeltaT, Validators.required],
      waterFlowRate: [inputObj.waterFlowRate, Validators.required],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      baselineWaterSupplyTemp: [inputObj.baselineWaterSupplyTemp, Validators.required],
      baselineWaterEnteringTemp: [inputObj.baselineWaterEnteringTemp, Validators.required],
      modWaterSupplyTemp: [inputObj.modWaterSupplyTemp, Validators.required],
      modWaterEnteringTemp: [inputObj.modWaterEnteringTemp, Validators.required],
    });

    return form;
  }

  getChillerPerformanceInput(form: FormGroup): ChillerPerformanceInput {
    let obj: ChillerPerformanceInput = {
      operatingHours: form.controls.operatingHours.value,
      chillerType: form.controls.chillerType.value,
      condenserCoolingType: form.controls.condenserCoolingType.value,
      motorDriveType: form.controls.motorDriveType.value,
      compressorConfigType: form.controls.compressorConfigType.value,
      ariCapacity: form.controls.ariCapacity.value,
      ariEfficiency: form.controls.ariEfficiency.value,
      maxCapacityRatio: form.controls.maxCapacityRatio.value,
      waterDeltaT: form.controls.waterDeltaT.value,
      waterFlowRate: form.controls.waterFlowRate.value,
      baselineWaterSupplyTemp: form.controls.baselineWaterSupplyTemp.value,
      baselineWaterEnteringTemp: form.controls.baselineWaterEnteringTemp.value,
      modWaterSupplyTemp: form.controls.modWaterSupplyTemp.value,
      modWaterEnteringTemp: form.controls.modWaterEnteringTemp.value,
    };
    return obj;
  }
}
