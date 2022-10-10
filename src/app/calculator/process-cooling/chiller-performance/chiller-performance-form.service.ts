import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
      ariCapacity: [inputObj.ariCapacity, [Validators.required, Validators.min(0)]],
      ariEfficiency: [inputObj.ariEfficiency, [Validators.required, Validators.min(0)]],
      maxCapacityRatio: [inputObj.maxCapacityRatio, [Validators.required, Validators.min(0), Validators.max(1)]],
      waterDeltaT: [inputObj.waterDeltaT, [Validators.min(0), Validators.required]],
      waterFlowRate: [inputObj.waterFlowRate, [Validators.min(0), Validators.required]],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      baselineWaterSupplyTemp: [inputObj.baselineWaterSupplyTemp, Validators.required],
      baselineWaterEnteringTemp: [inputObj.baselineWaterEnteringTemp, Validators.required],
      modWaterSupplyTemp: [inputObj.modWaterSupplyTemp, Validators.required],
      modWaterEnteringTemp: [inputObj.modWaterEnteringTemp, Validators.required],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
    });

    form = this.setWaterTempValidators(form);
    return form;
  }

  setWaterTempValidators(form: FormGroup) {
    let updatedControls: Array<FormControl> = this.getValidationUpdatedControls(form.controls.baselineWaterSupplyTemp, form.controls.baselineWaterEnteringTemp);
    form.controls.baselineWaterSupplyTemp = updatedControls[0];
    form.controls.baselineWaterEnteringTemp = updatedControls[1];
    updatedControls = this.getValidationUpdatedControls(form.controls.modWaterSupplyTemp, form.controls.modWaterEnteringTemp);
    form.controls.modWaterSupplyTemp = updatedControls[0];
    form.controls.modWaterEnteringTemp = updatedControls[1];
    return form;
  }

  getValidationUpdatedControls(waterSupplyTempControl: AbstractControl, waterEnteringTempControl: AbstractControl): Array<FormControl> {
    let waterSupplyTempFormControl: FormControl = waterSupplyTempControl as FormControl;
    let waterEnteringTempFormControl: FormControl = waterEnteringTempControl as FormControl;
    let waterSupplyTemp = waterSupplyTempFormControl.value;
    let waterEnteringTemp = waterEnteringTempFormControl.value;
    let updatedControls: Array<FormControl> = [];
    waterSupplyTempFormControl.setValidators([Validators.required, Validators.max(waterEnteringTemp)]);
    waterSupplyTempFormControl.markAsDirty();
    waterSupplyTempFormControl.updateValueAndValidity();
    updatedControls.push(waterSupplyTempFormControl);
    
    waterEnteringTempFormControl.setValidators([Validators.required, Validators.min(waterSupplyTemp)]);
    waterEnteringTempFormControl.markAsDirty();
    waterEnteringTempFormControl.updateValueAndValidity();
    updatedControls.push(waterEnteringTempFormControl);
    return updatedControls;
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
      electricityCost: form.controls.electricityCost.value
    };
    return obj;
  }
}
