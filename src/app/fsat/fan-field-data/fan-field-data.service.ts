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
      flowRate: [obj.flowRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      inletPressure: [obj.inletPressure, [Validators.required]],
      ductArea: [obj.ductArea],
      inletVelocityPressure: [obj.inletVelocityPressure, [Validators.required]],
      usingStaticPressure: [obj.usingStaticPressure],
      outletPressure: [obj.outletPressure, [Validators.required, Validators.min(obj.inletPressure)]],
      loadEstimatedMethod: [obj.loadEstimatedMethod, Validators.required],
      motorPower: [obj.motorPower, Validators.required],
      cost: [obj.cost, [Validators.required, Validators.min(0)]],
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
      ductArea: form.controls.ductArea.value,
      inletVelocityPressure: form.controls.inletVelocityPressure.value,
      outletPressure: form.controls.outletPressure.value,
      loadEstimatedMethod: form.controls.loadEstimatedMethod.value,
      usingStaticPressure: form.controls.usingStaticPressure.value,
      motorPower: form.controls.motorPower.value,
      cost: form.controls.cost.value,
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
