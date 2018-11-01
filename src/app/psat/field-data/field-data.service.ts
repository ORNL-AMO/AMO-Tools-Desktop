import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { PsatInputs } from '../../shared/models/psat';

@Injectable()
export class FieldDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(psatInputs: PsatInputs, isBaseline: boolean): FormGroup {
    let loadEstimationMethodValidators: Array<ValidatorFn> = [];
    let motorKwValidators: Array<ValidatorFn> = [];
    let motorAmpsValidators: Array<ValidatorFn> = [];
    let measuredVoltageValidators: Array<ValidatorFn> = [];
    let sizeMarginValidators: Array<ValidatorFn> = [];
    if (isBaseline) {
      loadEstimationMethodValidators = [Validators.required];
      measuredVoltageValidators = [Validators.required];
      if (psatInputs.load_estimation_method == 0) {
        motorKwValidators = [Validators.required]
      } else if (psatInputs.load_estimation_method == 1) {
        motorAmpsValidators = [Validators.required]
      }
    } else {
      sizeMarginValidators = [Validators.required, Validators.min(0), Validators.max(100)];
    }
    let form: FormGroup = this.formBuilder.group({
      operatingFraction: [psatInputs.operating_fraction, [Validators.required]],
      costKwHr: [psatInputs.cost_kw_hour, [Validators.required, Validators.min(0), Validators.max(1)]],
      flowRate: [psatInputs.flow_rate, [Validators.required, Validators.min(0)]],
      head: [psatInputs.head, [Validators.required, Validators.min(0)]],
      loadEstimatedMethod: [psatInputs.load_estimation_method, loadEstimationMethodValidators],
      motorKW: [psatInputs.motor_field_power, motorKwValidators],
      motorAmps: [psatInputs.motor_field_current, motorAmpsValidators],
      measuredVoltage: [psatInputs.motor_field_voltage, measuredVoltageValidators],
      optimizeCalculation: [psatInputs.optimize_calculation],
      sizeMargin: [psatInputs.margin, sizeMarginValidators],
      implementationCosts: [psatInputs.cost]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }


  getPsatInputsFromForm(form: FormGroup, psatInputs: PsatInputs): PsatInputs {
    psatInputs.operating_fraction = form.controls.operatingFraction.value;
    psatInputs.cost_kw_hour = form.controls.costKwHr.value;
    psatInputs.flow_rate = form.controls.flowRate.value;
    psatInputs.head = form.controls.head.value;
    psatInputs.load_estimation_method = form.controls.loadEstimatedMethod.value;
    psatInputs.motor_field_power = form.controls.motorKW.value;
    psatInputs.motor_field_current = form.controls.motorAmps.value;
    psatInputs.motor_field_voltage = form.controls.measuredVoltage.value;
    psatInputs.optimize_calculation = form.controls.optimizeCalculation.value;
    psatInputs.margin = form.controls.sizeMargin.value;
    psatInputs.implementationCosts = form.controls.implementationCosts.value;
    return psatInputs;

  }
}
