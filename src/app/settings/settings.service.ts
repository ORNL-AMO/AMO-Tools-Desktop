import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Settings } from '../shared/models/settings';
@Injectable()
export class SettingsService {

  constructor(private formBuilder: FormBuilder) { }

  getSettingsForm() {
    return this.formBuilder.group({
      'language': ['', Validators.required],
      'currency': ['', Validators.required],
      'unitsOfMeasure': ['', Validators.required],
      'distanceMeasurement': [''],
      'flowMeasurement': [''],
      'powerMeasurement': [''],
      'pressureMeasurement': ['']
    });
  }

  getFormFromSettings(settings: Settings) {
    return this.formBuilder.group({
      'language': [settings.language, Validators.required],
      'currency': [settings.currency, Validators.required],
      'unitsOfMeasure': [settings.unitsOfMeasure, Validators.required],
      'distanceMeasurement': [settings.distanceMeasurement],
      'flowMeasurement': [settings.flowMeasurement],
      'powerMeasurement': [settings.powerMeasurement],
      'pressureMeasurement': [settings.pressureMeasurement]
    });
  }

  getSettingsFromForm(form: any) {
    let tmpSettings: Settings = {
      language: form.value.language,
      currency: form.value.currency,
      unitsOfMeasure: form.value.unitsOfMeasure,
      distanceMeasurement: form.value.distanceMeasurement,
      flowMeasurement: form.value.flowMeasurement,
      powerMeasurement: form.value.powerMeasurement,
      pressureMeasurement: form.value.pressureMeasurement
    };
    return tmpSettings;
  }
}
