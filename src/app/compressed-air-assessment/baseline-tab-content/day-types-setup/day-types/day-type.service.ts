import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CompressedAirDayType } from '../../../../shared/models/compressed-air-assessment';

@Injectable()
export class DayTypeService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getDayTypeFormArray(inputList: Array<CompressedAirDayType>): Array<UntypedFormGroup> {
    let formGroupList: Array<UntypedFormGroup> = inputList.map(dayType => {
      return this.getDayTypeForm(dayType);
    });
    return formGroupList;
  }

  getDayTypeForm(dayType: CompressedAirDayType): UntypedFormGroup{
    return this.formBuilder.group({
      dayTypeId: [dayType.dayTypeId],
      name: [dayType.name, [Validators.required]],
      numberOfDays: [dayType.numberOfDays, [Validators.required, Validators.min(0), Validators.max(365)]],
      profileDataType: [dayType.profileDataType],
    });
  }


  getDayTypesFromForm(dayTypesFormArray: Array<UntypedFormGroup>): Array<CompressedAirDayType> {
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
}
