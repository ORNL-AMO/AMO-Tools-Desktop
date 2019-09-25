import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class EquipmentCurveService {

  constructor(private formBuilder: FormBuilder) { }

  getEquipmentCurveForm(): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      measurementOption: [0, Validators.required],
      baselineMeasurement: [0, [Validators.required, Validators.min(0)]],
      modificationMeasurementOption: [0, Validators.required],
      modifiedMeasurement: [0, [Validators.required, Validators.min(0)]],
    });
    form.controls.modificationMeasurementOption.disable();
    return form;
  }
}
