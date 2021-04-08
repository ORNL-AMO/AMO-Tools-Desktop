import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChillerStagingInput } from '../../../shared/models/chillers';

@Injectable()
export class ChillerStagingFormService {
  constructor(private formBuilder: FormBuilder) {}

  getChillerStagingForm(inputObj: ChillerStagingInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      chillerType: [inputObj.chillerType, [Validators.required, Validators.min(0), Validators.max(8760)]],
      condenserCoolingType: [inputObj.condenserCoolingType, Validators.required],
      motorDriveType: [inputObj.motorDriveType, Validators.required],
      compressorConfigType: [inputObj.compressorConfigType, Validators.required],
      ariCapacity: [inputObj.ariCapacity, Validators.required],
      ariEfficiency: [inputObj.ariEfficiency, Validators.required],
      maxCapacityRatio: [inputObj.maxCapacityRatio, Validators.required],
      operatingHours: [inputObj.operatingHours, Validators.required],
      coolingLoad: [inputObj.coolingLoad, Validators.required],
      waterSupplyTemp: [inputObj.waterSupplyTemp, Validators.required],
      waterEnteringTemp: [inputObj.waterEnteringTemp, Validators.required],
      // Required validator drops when FormArray constructed this way
      baselineLoadList: this.formBuilder.array(inputObj.baselineLoadList),
      modLoadList: this.formBuilder.array(inputObj.modLoadList)
    });


    let baselineLoadList: FormArray = this.getLoadFormArray(form.controls.baselineLoadList);
    let modLoadList: FormArray = this.getLoadFormArray(form.controls.modLoadList);
    this.setLoadValidators(baselineLoadList);
    this.setLoadValidators(modLoadList);
    return form;
  }

  getLoadFormArray(loadListControl: AbstractControl): FormArray {
    return loadListControl as FormArray;
  }

  setLoadValidators(loadList: FormArray) {
    loadList.controls.forEach(control => {
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
      control.markAsDirty();
    });
  }

  addChillerInputs(form: FormGroup): FormGroup {
    let baselineLoadList: FormArray = this.getLoadFormArray(form.controls.baselineLoadList);
    let modLoadList: FormArray = this.getLoadFormArray(form.controls.modLoadList);
    baselineLoadList.push(new FormControl(0, [Validators.required]));
    modLoadList.push(new FormControl(0, [Validators.required]));
    console.log(form);
    return form;
  }

  removeChillerInputs(form: FormGroup, index: number): FormGroup {
    let baselineLoadList: FormArray = this.getLoadFormArray(form.controls.baselineLoadList);
    let modLoadList: FormArray = this.getLoadFormArray(form.controls.modLoadList);
    baselineLoadList.removeAt(index);
    modLoadList.removeAt(index);
    return form;
  }


  getChillerStagingInput(form: FormGroup): ChillerStagingInput {
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
    };
    return obj;
  }
}
