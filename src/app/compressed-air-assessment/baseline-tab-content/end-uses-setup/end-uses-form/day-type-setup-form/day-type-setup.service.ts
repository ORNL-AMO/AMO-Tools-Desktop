import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DayTypeAirflowTotals, EndUseDayTypeSetup } from '../../../../../shared/models/compressed-air-assessment';
import { roundVal } from '../../../../../shared/helperFunctions';

@Injectable()
export class DayTypeSetupService {

  endUseDayTypeSetup: BehaviorSubject<EndUseDayTypeSetup>;
  dayTypeSetupWarnings: DayTypeSetupWarnings;

  constructor(private formBuilder: UntypedFormBuilder) { 
    this.endUseDayTypeSetup = new BehaviorSubject<EndUseDayTypeSetup>(undefined);
  }

  getDayTypeSetupFormFromObj(endUseDayTypeSetup: EndUseDayTypeSetup, dayTypeAirflowTotals: DayTypeAirflowTotals): UntypedFormGroup {
    let dayTypeLeakRate = endUseDayTypeSetup.dayTypeLeakRates.find(leakRate => leakRate.dayTypeId === endUseDayTypeSetup.selectedDayTypeId);
    let form: UntypedFormGroup = this.formBuilder.group({
      selectedDayTypeId: [endUseDayTypeSetup.selectedDayTypeId],
      dayTypeLeakRate: [dayTypeLeakRate.dayTypeLeakRate],
    });
    form = this.setDayTypeLeakRateValidation(form, dayTypeAirflowTotals);
    form = this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getDayTypeSetupFromForm(form: UntypedFormGroup, endUseDayTypeSetup: EndUseDayTypeSetup): EndUseDayTypeSetup {
    endUseDayTypeSetup.selectedDayTypeId = form.controls.selectedDayTypeId.value;
    let dayTypeLeakRate: number = form.controls.dayTypeLeakRate.value;
    endUseDayTypeSetup.dayTypeLeakRates.map(currentDaytypeLeakRate => {
      if (currentDaytypeLeakRate.dayTypeId === endUseDayTypeSetup.selectedDayTypeId) {
          currentDaytypeLeakRate.dayTypeLeakRate = dayTypeLeakRate;
      } 
    });

    return endUseDayTypeSetup;
  }

  setDayTypeLeakRateValidation(form: UntypedFormGroup, dayTypeAirFlowTotals: DayTypeAirflowTotals) {
    let max: number = dayTypeAirFlowTotals.totalDayTypeAverageAirflow;
    let dayTypeLeakRateValidators: Array<ValidatorFn> = [Validators.required, Validators.min(0), Validators.max(max)];
    form.controls.dayTypeLeakRate.setValidators(dayTypeLeakRateValidators);
    form.controls.dayTypeLeakRate.updateValueAndValidity();
    return form;
 }

  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  checkDayTypeSetupWarnings(endUseDaytypeSetup: EndUseDayTypeSetup, dayTypeAirFlowTotals: DayTypeAirflowTotals): DayTypeSetupWarnings {
    let warnings: DayTypeSetupWarnings = {
      dayTypeLeakRate: this.checkDayTypeLeakRate(endUseDaytypeSetup, dayTypeAirFlowTotals)
    };
    this.dayTypeSetupWarnings = warnings;
    return warnings;
  }

  checkDayTypeLeakRate(endUseDaytypeSetup: EndUseDayTypeSetup, dayTypeAirFlowTotals: DayTypeAirflowTotals): string {
    let warning: string;
    if (endUseDaytypeSetup.selectedDayTypeId) {
      let selectedLeakRate = endUseDaytypeSetup.dayTypeLeakRates.find(leakRate => leakRate.dayTypeId === endUseDaytypeSetup.selectedDayTypeId);
      if (selectedLeakRate) {
        let halfAirflowTotal: number = roundVal(dayTypeAirFlowTotals.totalDayTypeAverageAirflow / 2, 0);
        if (selectedLeakRate.dayTypeLeakRate !== undefined && selectedLeakRate.dayTypeLeakRate === halfAirflowTotal) {
          warning = `Leak rate is usually less than half of the System Profile average airflow for this day type. (${halfAirflowTotal})`;
        } 
      }
    } 
    return warning;
  }

}

export interface DayTypeSetupWarnings {
  dayTypeLeakRate: string
}