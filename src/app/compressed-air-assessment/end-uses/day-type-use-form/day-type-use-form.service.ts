import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DayTypeEndUse, EndUse } from '../../../shared/models/compressed-air-assessment';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class DayTypeUseFormService {
  constructor(private formBuilder: FormBuilder) { }

  getDayTypeUseForm(dayTypeEndUse: DayTypeEndUse, totalDayTypeAverageAirflow: number): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      dayTypeId: [dayTypeEndUse.dayTypeId],
      averageAirflow: [dayTypeEndUse.averageAirflow],
      averageCapacity: [dayTypeEndUse.averageCapacity],
      regulated: [dayTypeEndUse.regulated],
      excessPressure: [dayTypeEndUse.excessPressure],
      measuredPressure: [dayTypeEndUse.measuredPressure, [Validators.required, GreaterThanValidator.greaterThan(0)]],
    });
    form = this.setAverageAirflowValidation(form, totalDayTypeAverageAirflow);
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getDayTypeUse(form: FormGroup): DayTypeEndUse {
    return {
      dayTypeId: form.controls.dayTypeId.value,
      averageAirflow: form.controls.averageAirflow.value,
      averageCapacity: form.controls.averageCapacity.value,
      regulated: form.controls.regulated.value,
      excessPressure: form.controls.excessPressure.value,
      measuredPressure: form.controls.measuredPressure.value,
    }
  }

  setAverageAirflowValidation(form: FormGroup, totalDayTypeAverageAirflow: number) {
      let max: number = totalDayTypeAverageAirflow
      let averageAirFlowValidators: Array<ValidatorFn> = [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(max)];
      form.controls.averageAirflow.setValidators(averageAirFlowValidators);
      form.controls.averageAirflow.updateValueAndValidity();
      return form;
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }

  checkDayTypeEndUseWarnings(daytypeEndUse: DayTypeEndUse, endUse?: EndUse): DayTypeEndUseWarnings {
    return {
      measuredPressure: this.checkMeasuredPressure(daytypeEndUse, endUse)
    }
  }

  checkMeasuredPressure(dayTypeEndUse: DayTypeEndUse, endUse?: EndUse): string {
    if (dayTypeEndUse.measuredPressure && dayTypeEndUse.measuredPressure <= endUse.requiredPressure) {
      return `Measured Pressure should be greater than Required Pressure (${endUse.requiredPressure})`;
    } else {
      return undefined;
    }
  }

}


export interface DayTypeEndUseWarnings {
  measuredPressure: string
}
