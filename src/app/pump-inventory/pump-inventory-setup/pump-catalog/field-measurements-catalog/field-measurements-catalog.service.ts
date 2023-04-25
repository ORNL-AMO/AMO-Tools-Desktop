import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldMeasurements } from '../../../pump-inventory';

@Injectable()
export class FieldMeasurementsCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromFieldMeasurements(fieldMeasurements: FieldMeasurements): FormGroup {
    return this.formBuilder.group({
      pumpSpeed: [fieldMeasurements.pumpSpeed, [Validators.min(0)]],
      yearlyOperatingHours: [fieldMeasurements.yearlyOperatingHours, [Validators.min(0)]],
      staticSuctionHead: [fieldMeasurements.staticSuctionHead, [Validators.min(0)]],
      staticDischargeHead: [fieldMeasurements.staticDischargeHead, [Validators.min(0)]],
      efficiency: [fieldMeasurements.efficiency, [Validators.min(0)]],
      assessmentDate: [fieldMeasurements.assessmentDate],
      operatingFlowRate: [fieldMeasurements.operatingFlowRate, [Validators.min(0)]],
      operatingHead: [fieldMeasurements.operatingHead, [Validators.min(0)]], 
      measuredPower: [fieldMeasurements.measuredPower, [Validators.min(0)]], 
      measuredCurrent: [fieldMeasurements.measuredCurrent, [Validators.min(0)]], 
      measuredVoltage: [fieldMeasurements.measuredVoltage, [Validators.min(0)]], 
      system: [fieldMeasurements.system],
      location: [fieldMeasurements.location],
     });
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
    fieldMeasurements.system = form.controls.system.value;
    fieldMeasurements.location = form.controls.location.value;
    return fieldMeasurements;
  }
}
