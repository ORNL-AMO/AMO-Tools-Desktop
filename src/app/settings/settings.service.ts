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
      'furnaceType': [''],
      'energyResultUnit': [''],
      'customFurnaceName': ['']
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
      'furnaceType': [settings.furnaceType],
      'energyResultUnit': [settings.energyResultUnit],
      'customFurnaceName': [settings.customFurnaceName]
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
      furnaceType: form.value.furnaceType,
      energyResultUnit: form.value.energyResultUnit,
      customFurnaceName: form.value.customFurnaceName
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
      furnaceType: settings.furnaceType,
      customFurnaceName: settings.customFurnaceName
    }
    return newSettings;
  }

  setUnits(settingsForm: any): any {
    if (settingsForm.value.unitsOfMeasure == 'Imperial') {
      settingsForm.patchValue({
        powerMeasurement: 'hp',
        flowMeasurement: 'gpm',
        distanceMeasurement: 'ft',
        pressureMeasurement: 'psi'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      })

    } else if (settingsForm.value.unitsOfMeasure == 'Metric') {
      settingsForm.patchValue({
        powerMeasurement: 'kW',
        flowMeasurement: 'm3/h',
        distanceMeasurement: 'm',
        pressureMeasurement: 'kPa'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      })
    }
    settingsForm = this.setEnergyResultUnit(settingsForm);
    return settingsForm;
  }

  setEnergyResultUnit(settingsForm: any): any {
    if (settingsForm.value.unitsOfMeasure == 'Imperial') {
      settingsForm.patchValue({
        energyResultUnit: 'MMBtu'
      })
    }
    else if (settingsForm.value.unitsOfMeasure == 'Metric') {
      settingsForm.patchValue({
        energyResultUnit: 'GJ'
      })
    }

    if (settingsForm.value.energySourceType == 'Electricity') {
      settingsForm.patchValue({
        energyResultUnit: 'kWh'
      })
    }
    return settingsForm;
  }

  setEnergyResultUnitSetting(settings: Settings): Settings {
    if (settings.unitsOfMeasure == 'Imperial') {
      settings.energyResultUnit = 'MMBtu'
    }
    else if (settings.unitsOfMeasure == 'Metric') {
      settings.energyResultUnit = 'GJ';
    }

    if (settings.energySourceType == 'Electricity') {
      settings.energyResultUnit = 'kWh';
    }
    return settings;
  }
}
