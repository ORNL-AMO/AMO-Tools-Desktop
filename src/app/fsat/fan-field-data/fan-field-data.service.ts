import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldData } from '../../shared/models/fans';

@Injectable()
export class FanFieldDataService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(obj: FieldData): FormGroup {
    let form = this.formBuilder.group({
      operatingFraction: [obj.operatingFraction, Validators.required],
      flowRate: [obj.flowRate, Validators.required],
      inletPressure: [obj.inletPressure, Validators.required],
      outletPressure: [obj.outletPressure, Validators.required],
      loadEstimatedMethod: [obj.loadEstimatedMethod, Validators.required],
      motorPower: [obj.motorPower, Validators.required],
      cost: [obj.cost, Validators.required],
      specificHeatRatio: [obj.specificHeatRatio, Validators.required],
      compressibilityFactor: [obj.compressibilityFactor, Validators.required]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): FieldData {
    let newData: FieldData = {
      operatingFraction: form.controls.operatingFraction.value,
      flowRate: form.controls.flowRate.value,
      inletPressure: form.controls.inletPressure.value,
      outletPressure: form.controls.outletPressure.value,
      loadEstimatedMethod: form.controls.loadEstimatedMethod.value,
      motorPower: form.controls.motorPower.value,
      cost: form.controls.cost.value,
      specificHeatRatio: form.controls.specificHeatRatio.value,
      compressibilityFactor: form.controls.compressibilityFactor.value
    }
    return newData;
  }
}