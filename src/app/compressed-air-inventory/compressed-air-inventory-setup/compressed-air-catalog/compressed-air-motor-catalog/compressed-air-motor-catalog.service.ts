import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompressedAirMotorProperties } from '../../../compressed-air-inventory';

@Injectable()
export class CompressedAirMotorCatalogService {

 constructor(private formBuilder: FormBuilder) { }

  getFormFromMotorProperties(compressedAirMotor: CompressedAirMotorProperties): FormGroup {
    return this.formBuilder.group({
      motorPower: [compressedAirMotor.motorPower, [Validators.required, Validators.min(0)]],
      motorFullLoadAmps: [compressedAirMotor.motorFullLoadAmps, [Validators.required, Validators.min(0)]],
    });
  }

  updateMotorPropertiesFromForm(form: FormGroup, compressedAirMotor: CompressedAirMotorProperties): CompressedAirMotorProperties {
    compressedAirMotor.motorPower = form.controls.motorPower.value;
    compressedAirMotor.motorFullLoadAmps = form.controls.motorFullLoadAmps.value;
    return compressedAirMotor;
  }
}