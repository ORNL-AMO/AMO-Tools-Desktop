import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EndUse } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class EndUseFormService {

  constructor(private formBuilder: FormBuilder) { }

  // getEndUseFormFromObj(endUse: EndUse): FormGroup {
  //   let form: FormGroup = this.formBuilder.group({
  //     dayType: [endUse.dayType],
  //     dayTypeLeakRate: [endUse.dayTypeLeakRate],
  //     location: [endUse.location],
  //     averageAirflow: [endUse.averageAirflow],
  //     averageCapacity: [endUse.averageCapacity],
  //     regulated: [endUse.regulated],
  //     requiredPressure: [endUse.requiredPressure],
  //     excessPressure: [endUse.excessPressure],
  //     measuredPressure: [endUse.measuredPressure],
  //   });
  //   this.markFormDirtyToDisplayValidation(form);
  //   return form;
  // }

  // getEndUseFromFrom(form: FormGroup, selectedEndUse: EndUse): EndUse {
  //   return {
  //     endUseId: selectedEndUse.endUseId,
  //     modifiedDate: selectedEndUse.modifiedDate,
  //     endUseName: selectedEndUse.endUseName,
  //     endUseDescription: selectedEndUse.endUseDescription,
  //     dayType: form.controls.dayType.value,
  //     dayTypeLeakRate: form.controls.dayTypeLeakRate.value,
  //     location: form.controls.location.value,
  //     averageAirflow: form.controls.averageAirflow.value,
  //     averageCapacity: form.controls.averageCapacity.value,
  //     regulated: form.controls.regulated.value,
  //     requiredPressure: form.controls.requiredPressure.value,
  //     excessPressure: form.controls.excessPressure.value,
  //     measuredPressure: form.controls.measuredPressure.value,
  //   }
  // }

  // markFormDirtyToDisplayValidation(form: FormGroup) {
  //   for (let key in form.controls) {
  //     if (form.controls[key] && form.controls[key].value != undefined) {
  //       form.controls[key].markAsDirty();
  //     }
  //   }
  // }
}
