import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { PsatInputs } from '../../shared/models/psat';

@Injectable()
export class FieldDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(psatInputs: PsatInputs, isBaseline: boolean, isWhatIfScenario?: boolean): FormGroup {
    let loadEstimationMethodValidators: Array<ValidatorFn> = [];
    let motorKwValidators: Array<ValidatorFn> = [];
    let motorAmpsValidators: Array<ValidatorFn> = [];
    let measuredVoltageValidators: Array<ValidatorFn> = [];
    if (isBaseline || !psatInputs.whatIfScenario) {
      loadEstimationMethodValidators = [Validators.required];
      measuredVoltageValidators = [Validators.required];
      if (psatInputs.load_estimation_method == 0) {
        motorKwValidators = [Validators.required]
      } else if (psatInputs.load_estimation_method == 1) {
        motorAmpsValidators = [Validators.required]
      }
    }
    let form: FormGroup = this.formBuilder.group({
      flowRate: [psatInputs.flow_rate, [Validators.required, Validators.min(0)]],
      head: [psatInputs.head, [Validators.required, Validators.min(0.1)]],
      loadEstimatedMethod: [psatInputs.load_estimation_method, loadEstimationMethodValidators],
      motorKW: [psatInputs.motor_field_power, motorKwValidators],
      motorAmps: [psatInputs.motor_field_current, motorAmpsValidators],
      measuredVoltage: [psatInputs.motor_field_voltage, measuredVoltageValidators],
      implementationCosts: [psatInputs.implementationCosts]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }


  getPsatInputsFromForm(form: FormGroup, psatInputs: PsatInputs): PsatInputs {
    psatInputs.flow_rate = form.controls.flowRate.value;
    psatInputs.head = form.controls.head.value;
    psatInputs.load_estimation_method = form.controls.loadEstimatedMethod.value;
    psatInputs.motor_field_power = form.controls.motorKW.value;
    psatInputs.motor_field_current = form.controls.motorAmps.value;
    psatInputs.motor_field_voltage = form.controls.measuredVoltage.value;
    psatInputs.implementationCosts = form.controls.implementationCosts.value;
    return psatInputs;

  }
}
