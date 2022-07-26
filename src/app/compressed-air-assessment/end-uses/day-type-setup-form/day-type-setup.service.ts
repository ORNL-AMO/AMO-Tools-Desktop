import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { EndUseDayTypeSetup } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class DayTypeSetupService {

  endUseDayTypeSetup: BehaviorSubject<EndUseDayTypeSetup>;
  constructor(private formBuilder: FormBuilder) { 
    this.endUseDayTypeSetup = new BehaviorSubject<EndUseDayTypeSetup>(undefined);
  }

  getDayTypeSetupFormFromObj(endUseDayTypeSetup: EndUseDayTypeSetup): FormGroup {
    let dayTypeLeakRate = endUseDayTypeSetup.dayTypeLeakRates.find(leakRate => leakRate.dayTypeId === endUseDayTypeSetup.selectedDayTypeId);
    let form: FormGroup = this.formBuilder.group({
      selectedDayTypeId: [endUseDayTypeSetup.selectedDayTypeId],
      dayTypeLeakRate: [dayTypeLeakRate.dayTypeLeakRate, [Validators.required]],
    });

    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getDayTypeSetupFromForm(form: FormGroup, endUseDayTypeSetup: EndUseDayTypeSetup): EndUseDayTypeSetup {
    endUseDayTypeSetup.selectedDayTypeId = form.controls.selectedDayTypeId.value;
    let dayTypeLeakRate: number = form.controls.dayTypeLeakRate.value;
    endUseDayTypeSetup.dayTypeLeakRates.map(currentDaytypeLeakRate => {
      if (currentDaytypeLeakRate.dayTypeId === endUseDayTypeSetup.selectedDayTypeId) {
          currentDaytypeLeakRate.dayTypeLeakRate = dayTypeLeakRate;
      } 
    });

    return endUseDayTypeSetup;
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

  // getDayTypeSetupFromForm(form: FormGroup, endUseDayTypeSetup: EndUseDayTypeSetup): EndUseDayTypeSetup {
  //   endUseDayTypeSetup.selectedDayTypeId = form.controls.selectedDayTypeId.value;
  //   let dayTypeLeakRate: number = form.controls.dayTypeLeakRate.value;
  //   let hasExistingDayTypeLeakRate: boolean = false;

  //   endUseDayTypeSetup.dayTypeLeakRates.map(currentDaytypeLeakRate => {
  //     if (currentDaytypeLeakRate.dayTypeId === endUseDayTypeSetup.selectedDayTypeId) {
  //         currentDaytypeLeakRate.dayTypeLeakRate = dayTypeLeakRate;
  //         hasExistingDayTypeLeakRate = true
  //     } 
  //   });

  //   if (!hasExistingDayTypeLeakRate) {
  //     endUseDayTypeSetup.dayTypeLeakRates.push({dayTypeId: endUseDayTypeSetup.selectedDayTypeId, dayTypeLeakRate: undefined});
  //   }
  //   return endUseDayTypeSetup;
  // }

}
