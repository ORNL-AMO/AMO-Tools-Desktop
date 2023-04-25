import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PumpMotorProperties } from '../../../pump-inventory';

@Injectable()
export class PumpMotorCatalogService {


  constructor(private formBuilder: FormBuilder) { }

  getFormFromPumpMotor(pumpMotor: PumpMotorProperties): FormGroup {
    return this.formBuilder.group({
      motorRPM: [pumpMotor.motorRPM],
      lineFrequency: [pumpMotor.lineFrequency],
      motorRatedPower: [pumpMotor.motorRatedPower],
      motorEfficiencyClass: [pumpMotor.motorEfficiencyClass],
      motorRatedVoltage: [pumpMotor.motorRatedVoltage],
      motorFullLoadAmps: [pumpMotor.motorFullLoadAmps],
      motorEfficiency: [pumpMotor.motorEfficiency],
    });
    }

  updatePumpMotorFromForm(form: FormGroup, pumpMotor: PumpMotorProperties): PumpMotorProperties {
    pumpMotor.motorRPM = form.controls.motorRPM.value;
    pumpMotor.lineFrequency = form.controls.lineFrequency.value;
    pumpMotor.motorRatedPower = form.controls.motorRatedPower.value;
    pumpMotor.motorEfficiencyClass = form.controls.motorEfficiencyClass.value;
    pumpMotor.motorRatedVoltage = form.controls.motorRatedVoltage.value;
    pumpMotor.motorFullLoadAmps = form.controls.motorFullLoadAmps.value;
    pumpMotor.motorEfficiency = form.controls.motorEfficiency.value;
    return pumpMotor;
  }
}