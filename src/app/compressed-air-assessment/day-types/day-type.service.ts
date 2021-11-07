import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CompressedAirDayType } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class DayTypeService {

  constructor(private formBuilder: FormBuilder) { }

  getDayTypeFormArray(inputList: Array<CompressedAirDayType>): Array<FormGroup> {
    let formGroupList: Array<FormGroup> = inputList.map(dayType => {
      return this.getDayTypeForm(dayType);
    });
    return formGroupList;
  }

  getDayTypeForm(dayType: CompressedAirDayType): FormGroup{
    return this.formBuilder.group({
      dayTypeId: [dayType.dayTypeId],
      name: [dayType.name, [Validators.required]],
      numberOfDays: [dayType.numberOfDays, [Validators.required, Validators.min(0), Validators.max(365)]],
      profileDataType: [dayType.profileDataType],
    });
  }


  getDayTypesFromForm(dayTypesFormArray: Array<FormGroup>): Array<CompressedAirDayType> {
    let dayTypes: Array<CompressedAirDayType> = new Array();
    dayTypesFormArray.forEach(form => {
      dayTypes.push({
        dayTypeId: form.controls.dayTypeId.value,
        name: form.controls.name.value,
        numberOfDays: form.controls.numberOfDays.value,
        profileDataType: form.controls.profileDataType.value,
      })
    })
    return dayTypes;
  }

  hasValidDayTypes(compressedAirDayTypes: Array<CompressedAirDayType>): boolean {
    let hasValidDayTypes: boolean = false;
    if (compressedAirDayTypes.length > 0) {
      let isDayTypeFormValid = true;
      let summedTotalDays: number = 0;
      compressedAirDayTypes.forEach(dayType => {
        if(isDayTypeFormValid){
          isDayTypeFormValid = this.getDayTypeForm(dayType).valid;
        }
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
}
