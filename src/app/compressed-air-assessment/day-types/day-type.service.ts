import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CompressedAirDayType } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class DayTypeService {

  constructor(private formBuilder: FormBuilder) { }

  getDayTypeForm(inputList: Array<CompressedAirDayType>): FormGroup {
    let formGroupList: Array<FormGroup> = inputList.map(dayType => {
      return new FormGroup({
        dayTypeId: new FormControl(dayType.dayTypeId),
        name: new FormControl(dayType.name, [Validators.required]),
        numberOfDays: new FormControl(dayType.numberOfDays, [Validators.required]),
        profileDataType: new FormControl(dayType.profileDataType),
      })
    })
    let form: FormGroup = this.formBuilder.group({
      dayTypeList: this.formBuilder.array(formGroupList)
    });
    this.setDayTypeValidators(form);
    return form;
  }

  getDayTypesFromForm(form: FormGroup): Array<CompressedAirDayType> {
    return form.controls.dayTypeList.value;
  }

  getFormArray(dayTypeListControl: AbstractControl): FormArray {
    return dayTypeListControl as FormArray;
  }

  setDayTypeValidators(form: FormGroup) {
    let dayTypeList: FormArray = this.getFormArray(form.controls.dayTypeList);
    dayTypeList.controls.forEach(control => {
      let groupControl = control as FormGroup;
      
      groupControl.controls.name.setValidators(Validators.required);
      groupControl.controls.name.updateValueAndValidity();
      groupControl.controls.name.markAsDirty();
      
      groupControl.controls.numberOfDays.setValidators([Validators.required, Validators.min(0), Validators.max(365)]);
      groupControl.controls.numberOfDays.updateValueAndValidity();
      groupControl.controls.numberOfDays.markAsDirty();
    });
    
  }

  hasValidDayTypes(compressedAirDayTypes: Array<CompressedAirDayType>): boolean {
    let hasValidDayTypes: boolean = false;
    if (compressedAirDayTypes.length > 0) {
      let isDayTypeFormValid = this.getDayTypeForm(compressedAirDayTypes).valid;
      let summedTotalDays: number = 0;
      compressedAirDayTypes.forEach(dayType => {
        if (dayType.numberOfDays > 0) {
          summedTotalDays += dayType.numberOfDays;
        } else {
          return false;
        }
      });
      hasValidDayTypes = isDayTypeFormValid && summedTotalDays > 0 && summedTotalDays <= 365;
    }
    return hasValidDayTypes;
  }

  removeDayTypeInput(form: FormGroup, index: number): FormGroup {
    let dayTypeList: FormArray = this.getFormArray(form.controls.dayTypeList);
    dayTypeList.removeAt(index);
    return form;
  }

}
