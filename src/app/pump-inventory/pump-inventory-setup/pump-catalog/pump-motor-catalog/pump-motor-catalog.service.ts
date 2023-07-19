import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { PumpMotorProperties } from '../../../pump-inventory';
import { MotorService } from '../../../../psat/motor/motor.service';

@Injectable()
export class PumpMotorCatalogService {


  constructor(private formBuilder: FormBuilder, private motorService: MotorService) { }

  getFormFromPumpMotor(pumpMotor: PumpMotorProperties): FormGroup {
    let efficiencyValidators: Array<ValidatorFn> = this.motorService.getEfficiencyValidators(pumpMotor.motorEfficiencyClass);
    let form: UntypedFormGroup = this.formBuilder.group({
      motorRPM: [pumpMotor.motorRPM, Validators.required],
      lineFrequency: [pumpMotor.lineFrequency],
      motorRatedPower: [pumpMotor.motorRatedPower, Validators.required],
      motorEfficiencyClass: [pumpMotor.motorEfficiencyClass],
      motorRatedVoltage: [pumpMotor.motorRatedVoltage, Validators.required],
      motorFullLoadAmps: [pumpMotor.motorFullLoadAmps, Validators.required],
      motorEfficiency: [pumpMotor.motorEfficiency, efficiencyValidators],
    });
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  updateFormEfficiencyValidators(form: UntypedFormGroup): UntypedFormGroup {
    let tmpEfficiencyValidators: Array<ValidatorFn> = this.motorService.getEfficiencyValidators(form.controls.motorEfficiencyClass.value);
    form.controls.motorEfficiency.setValidators(tmpEfficiencyValidators);
    form.controls.motorEfficiency.reset(form.controls.motorEfficiency.value);
    if (form.controls.motorEfficiency.value) {
      form.controls.motorEfficiency.markAsDirty();
    }
    return form;
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