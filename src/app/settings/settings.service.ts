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
      'pressureMeasurement': [''],
      'currentMeasurement': [''],
      'viscosityMeasurement': [''],
      'voltageMeasurement': [''],
      'energySourceType': [''],
      'furnaceType': ['']
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
      'pressureMeasurement': [settings.pressureMeasurement],
      'currentMeasurement': [settings.currentMeasurement],
      'viscosityMeasurement': [settings.viscosityMeasurement],
      'voltageMeasurement': [settings.voltageMeasurement],
      'energySourceType': [settings.energySourceType],
      'furnaceType': [settings.furnaceType]
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
      pressureMeasurement: form.value.pressureMeasurement,
      currentMeasurement: form.value.currentMeasurement,
      viscosityMeasurement: form.value.viscosityMeasurement,
      voltageMeasurement: form.value.voltageMeasurement,
      energySourceType: form.value.energySourceType,
      furnaceType: form.value.furnaceType
    };
    return tmpSettings;
  }

  getNewSettingFromSetting(settings: Settings): Settings{
    let newSettings: Settings = {
      language: settings.language,
      currency: settings.currency,
      unitsOfMeasure: settings.unitsOfMeasure,
      distanceMeasurement: settings.distanceMeasurement,
      flowMeasurement: settings.flowMeasurement,
      powerMeasurement: settings.powerMeasurement,
      pressureMeasurement: settings.pressureMeasurement,
      currentMeasurement: settings.currentMeasurement,
      viscosityMeasurement: settings.viscosityMeasurement,
      voltageMeasurement: settings.voltageMeasurement,
      energySourceType: settings.energySourceType,
      furnaceType: settings.furnaceType
    }
    return newSettings;
  }
}
