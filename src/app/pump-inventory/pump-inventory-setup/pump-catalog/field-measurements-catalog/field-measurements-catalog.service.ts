import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { FieldMeasurements } from '../../../pump-inventory';

@Injectable()
export class FieldMeasurementsCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromFieldMeasurements(fieldMeasurements: FieldMeasurements): FormGroup {
    let motorKwValidators: Array<ValidatorFn> = [];
    let motorAmpsValidators: Array<ValidatorFn> = [];
    if (fieldMeasurements.loadEstimationMethod == 0) {
      motorKwValidators = [Validators.required]
    } else if (fieldMeasurements.loadEstimationMethod == 1) {
      motorAmpsValidators = [Validators.required]
    }

    let form: UntypedFormGroup = this.formBuilder.group({
      pumpSpeed: [fieldMeasurements.pumpSpeed, [Validators.required, Validators.min(0)]],
      yearlyOperatingHours: [fieldMeasurements.yearlyOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      staticSuctionHead: [fieldMeasurements.staticSuctionHead, [Validators.min(0)]],
      staticDischargeHead: [fieldMeasurements.staticDischargeHead, [Validators.min(0)]],
      efficiency: [fieldMeasurements.efficiency, [Validators.min(0)]],
      assessmentDate: [fieldMeasurements.assessmentDate],
      loadEstimatedMethod: [fieldMeasurements.loadEstimationMethod],
      operatingFlowRate: [fieldMeasurements.operatingFlowRate, [Validators.required, Validators.min(0)]],
      operatingHead: [fieldMeasurements.operatingHead, [Validators.required, Validators.min(0.1)]], 
      measuredPower: [fieldMeasurements.measuredPower, motorKwValidators], 
      measuredCurrent: [fieldMeasurements.measuredCurrent, motorAmpsValidators], 
      measuredVoltage: [fieldMeasurements.measuredVoltage, Validators.required], 
     });

    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }

    return form;
  }

  changeLoadMethod(form: FormGroup) {
    let motorAmpsValidators: Array<ValidatorFn> = new Array();
    let motorKWValidators: Array<ValidatorFn> = new Array();

    if (form.controls.loadEstimatedMethod.value == 0) {
      motorKWValidators = [Validators.required];
    } else {
      motorAmpsValidators = [Validators.required];
    }
    form.controls.measuredCurrent.setValidators(motorAmpsValidators);
    form.controls.measuredCurrent.reset(form.controls.measuredCurrent.value);
    form.controls.measuredCurrent.markAsDirty();

    form.controls.measuredPower.setValidators(motorKWValidators);
    form.controls.measuredPower.reset(form.controls.measuredPower.value);
    form.controls.measuredPower.markAsDirty();
  }

  updateFieldMeasurementsFromForm(form: FormGroup, fieldMeasurements: FieldMeasurements): FieldMeasurements {
    fieldMeasurements.pumpSpeed = form.controls.pumpSpeed.value;
    fieldMeasurements.yearlyOperatingHours = form.controls.yearlyOperatingHours.value;
    fieldMeasurements.staticSuctionHead = form.controls.staticSuctionHead.value;
    fieldMeasurements.staticDischargeHead = form.controls.staticDischargeHead.value;
    fieldMeasurements.efficiency = form.controls.efficiency.value;
    fieldMeasurements.assessmentDate = form.controls.assessmentDate.value;
    fieldMeasurements.operatingFlowRate = form.controls.operatingFlowRate.value;
    fieldMeasurements.operatingHead = form.controls.operatingHead.value;
    fieldMeasurements.measuredPower = form.controls.measuredPower.value;
    fieldMeasurements.measuredCurrent = form.controls.measuredCurrent.value;
    fieldMeasurements.measuredVoltage = form.controls.measuredVoltage.value;
    fieldMeasurements.loadEstimationMethod = form.controls.loadEstimatedMethod.value;
    return fieldMeasurements;
  }
}
