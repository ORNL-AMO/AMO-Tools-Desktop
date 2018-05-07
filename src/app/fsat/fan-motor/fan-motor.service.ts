import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FanMotor } from '../../shared/models/fans';

@Injectable()
export class FanMotorService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: FanMotor): FormGroup {
    let form = this.formBuilder.group({
      frequency: [obj.frequency, Validators.required],
      horsePower: [obj.horsePower, Validators.required],
      motorRPM: [obj.motorRPM, Validators.required],
      efficiencyClass: [obj.efficiencyClass, Validators.required],
      efficiency: [obj.efficiency],
      motorVoltage: [obj.motorVoltage, Validators.required],
      fullLoadAmps: [obj.fullLoadAmps, Validators.required]
    })
    return form;
  }
}