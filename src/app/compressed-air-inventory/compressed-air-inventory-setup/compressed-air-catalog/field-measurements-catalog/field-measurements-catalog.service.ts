import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldMeasurements } from '../../../compressed-air-inventory';

@Injectable()
export class FieldMeasurementsCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromFieldMeasurements(fieldMeasurements: FieldMeasurements): FormGroup {
    return this.formBuilder.group({
      yearlyOperatingHours: [fieldMeasurements.yearlyOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
    });
  }

  updateFieldMeasurementsFromForm(form: FormGroup, fieldMeasurements: FieldMeasurements): FieldMeasurements {
    fieldMeasurements.yearlyOperatingHours = form.controls.yearlyOperatingHours.value;
    return fieldMeasurements;
  }
}