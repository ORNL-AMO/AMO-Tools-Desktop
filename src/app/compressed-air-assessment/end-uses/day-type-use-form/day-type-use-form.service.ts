import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DayTypeEndUse, EndUse } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class DayTypeUseFormService {
  constructor(private formBuilder: FormBuilder) { }

  getDayTypeUseForm(dayTypeEndUse: DayTypeEndUse): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      dayTypeId: [dayTypeEndUse.dayTypeId],
      averageAirflow: [dayTypeEndUse.averageAirflow],
      averageCapacity: [dayTypeEndUse.averageCapacity],
      regulated: [dayTypeEndUse.regulated],
      requiredPressure: [dayTypeEndUse.requiredPressure],
      excessPressure: [dayTypeEndUse.excessPressure],
      measuredPressure: [dayTypeEndUse.measuredPressure],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getDayTypeUse(form: FormGroup): DayTypeEndUse {
    return {
      dayTypeId: form.controls.dayTypeId.value,
      averageAirflow: form.controls.averageAirflow.value,
      averageCapacity: form.controls.averageCapacity.value,
      regulated: form.controls.regulated.value,
      requiredPressure: form.controls.requiredPressure.value,
      excessPressure: form.controls.excessPressure.value,
      measuredPressure: form.controls.measuredPressure.value,
    }
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }
}
