import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ChillerStagingInput } from '../../../shared/models/chillers';

@Injectable()
export class ChillerStagingFormService {
  constructor(private formBuilder: UntypedFormBuilder) {}

  getChillerStagingForm(inputObj: ChillerStagingInput): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      chillerType: [inputObj.chillerType, ],
      condenserCoolingType: [inputObj.condenserCoolingType, Validators.required],
      motorDriveType: [inputObj.motorDriveType, Validators.required],
      compressorConfigType: [inputObj.compressorConfigType, Validators.required],
      ariCapacity: [inputObj.ariCapacity, [Validators.required, Validators.min(0)]],
      ariEfficiency: [inputObj.ariEfficiency, [Validators.required, Validators.min(0)]],
      maxCapacityRatio: [inputObj.maxCapacityRatio, [Validators.required, Validators.min(0), Validators.max(1)]],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      coolingLoad: [inputObj.coolingLoad, Validators.required],
      waterSupplyTemp: [inputObj.waterSupplyTemp, Validators.required],
      waterEnteringTemp: [inputObj.waterEnteringTemp, Validators.required],
      // Required validator drops when FormArray constructed this way
      baselineLoadList: this.formBuilder.array(inputObj.baselineLoadList),
      modLoadList: this.formBuilder.array(inputObj.modLoadList),
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]]
    });

    form = this.setWaterTempValidators(form);
    let baselineLoadList: UntypedFormArray = this.getLoadFormArray(form.controls.baselineLoadList);
    let modLoadList: UntypedFormArray = this.getLoadFormArray(form.controls.modLoadList);
    this.setLoadValidators(baselineLoadList);
    this.setLoadValidators(modLoadList);
    return form;
  }

  setWaterTempValidators(formGroup: UntypedFormGroup) {
    let waterSupplyTemp = formGroup.controls.waterSupplyTemp.value;
    let waterEnteringTemp = formGroup.controls.waterEnteringTemp.value;
    formGroup.controls.waterSupplyTemp.setValidators([Validators.required, Validators.max(waterEnteringTemp)]);
    formGroup.controls.waterSupplyTemp.markAsDirty();
    formGroup.controls.waterSupplyTemp.updateValueAndValidity();

    formGroup.controls.waterEnteringTemp.setValidators([Validators.required, Validators.min(waterSupplyTemp)]);
    formGroup.controls.waterEnteringTemp.markAsDirty();
    formGroup.controls.waterEnteringTemp.updateValueAndValidity();
    
    return formGroup;
}

  getLoadFormArray(loadListControl: AbstractControl): UntypedFormArray {
    return loadListControl as UntypedFormArray;
  }

  setLoadValidators(loadList: UntypedFormArray) {
    loadList.controls.forEach(control => {
      control.setValidators([Validators.required, Validators.min(0)]);
      control.updateValueAndValidity();
      control.markAsDirty();
    });
  }

  addChillerInputs(form: UntypedFormGroup): UntypedFormGroup {
    let baselineLoadList: UntypedFormArray = this.getLoadFormArray(form.controls.baselineLoadList);
    let modLoadList: UntypedFormArray = this.getLoadFormArray(form.controls.modLoadList);
    baselineLoadList.push(new UntypedFormControl(0, [Validators.required, Validators.min(0)]));
    modLoadList.push(new UntypedFormControl(0, [Validators.required, Validators.min(0)]));
    return form;
  }

  removeChillerInputs(form: UntypedFormGroup, index: number): UntypedFormGroup {
    let baselineLoadList: UntypedFormArray = this.getLoadFormArray(form.controls.baselineLoadList);
    let modLoadList: UntypedFormArray = this.getLoadFormArray(form.controls.modLoadList);
    baselineLoadList.removeAt(index);
    modLoadList.removeAt(index);
    return form;
  }


  getChillerStagingInput(form: UntypedFormGroup): ChillerStagingInput {
    let obj: ChillerStagingInput = {
      operatingHours: form.controls.operatingHours.value,
      chillerType: form.controls.chillerType.value,
      condenserCoolingType: form.controls.condenserCoolingType.value,
      motorDriveType: form.controls.motorDriveType.value,
      compressorConfigType: form.controls.compressorConfigType.value,
      ariCapacity: form.controls.ariCapacity.value,
      ariEfficiency: form.controls.ariEfficiency.value,
      maxCapacityRatio: form.controls.maxCapacityRatio.value,
      coolingLoad: form.controls.coolingLoad.value,
      waterSupplyTemp: form.controls.waterSupplyTemp.value,
      waterEnteringTemp: form.controls.waterEnteringTemp.value,
      baselineLoadList: form.controls.baselineLoadList.value,
      modLoadList: form.controls.modLoadList.value,
      electricityCost: form.controls.electricityCost.value
    };
    return obj;
  }
}
