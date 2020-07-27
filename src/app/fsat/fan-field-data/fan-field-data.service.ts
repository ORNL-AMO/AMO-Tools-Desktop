import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldData } from '../../shared/models/fans';
import { GreaterThanValidator } from '../../shared/validators/greater-than';

@Injectable()
export class FanFieldDataService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(obj: FieldData): FormGroup {
    if (!obj.operatingHours && obj.operatingFraction) {
      obj.operatingHours = obj.operatingFraction * 8760;
    }
    let form: FormGroup = this.formBuilder.group({
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      flowRate: [obj.flowRate, [Validators.required, Validators.min(0)]],
      inletPressure: [obj.inletPressure, [Validators.required, Validators.max(0)]],
      outletPressure: [obj.outletPressure, [Validators.required, Validators.min(0)]],
      loadEstimatedMethod: [obj.loadEstimatedMethod, Validators.required],
      motorPower: [obj.motorPower, Validators.required],
      cost: [obj.cost, [Validators.required, Validators.min(0)]],
      specificHeatRatio: [obj.specificHeatRatio, [Validators.required, GreaterThanValidator.greaterThan(1), Validators.max(2)]],
      compressibilityFactor: [obj.compressibilityFactor, [Validators.required, Validators.min(0)]],
      measuredVoltage: [obj.measuredVoltage, Validators.required]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: FormGroup): FieldData {
    let newData: FieldData = {
      operatingHours: form.controls.operatingHours.value,
      flowRate: form.controls.flowRate.value,
      inletPressure: form.controls.inletPressure.value,
      outletPressure: form.controls.outletPressure.value,
      loadEstimatedMethod: form.controls.loadEstimatedMethod.value,
      motorPower: form.controls.motorPower.value,
      cost: form.controls.cost.value,
      specificHeatRatio: form.controls.specificHeatRatio.value,
      compressibilityFactor: form.controls.compressibilityFactor.value,
      measuredVoltage: form.controls.measuredVoltage.value
    };
    return newData;
  }

  isFanFieldDataValid(obj: FieldData): boolean {
    let form: FormGroup = this.getFormFromObj(obj);
    return form.valid;
  }
}
