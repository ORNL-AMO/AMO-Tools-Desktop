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
      'customFurnaceName': [''],
      'temperatureMeasurement': ['']
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
      'customFurnaceName': [settings.customFurnaceName],
      'temperatureMeasurement': [settings.temperatureMeasurement]
    });
  }

  getSettingsFromForm(form: any) {
    let tmpSettings: Settings = {
      language: form.controls.language.value,
      currency: form.controls.currency.value,
      unitsOfMeasure: form.controls.unitsOfMeasure.value,
      distanceMeasurement: form.controls.distanceMeasurement.value,
      flowMeasurement: form.controls.flowMeasurement.value,
      powerMeasurement: form.controls.powerMeasurement.value,
      pressureMeasurement: form.controls.pressureMeasurement.value,
      currentMeasurement: form.controls.currentMeasurement.value,
      viscosityMeasurement: form.controls.viscosityMeasurement.value,
      voltageMeasurement: form.controls.voltageMeasurement.value,
      energySourceType: form.controls.energySourceType.value,
      furnaceType: form.controls.furnaceType.value,
      energyResultUnit: form.controls.energyResultUnit.value,
      customFurnaceName: form.controls.customFurnaceName.value,
      temperatureMeasurement: form.controls.temperatureMeasurement.value
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
      customFurnaceName: settings.customFurnaceName,
      temperatureMeasurement: settings.temperatureMeasurement,
    }
    return newSettings;
  }

  setUnits(settingsForm: any): any {
    if (settingsForm.controls.unitsOfMeasure.value == 'Imperial') {
      settingsForm.patchValue({
        powerMeasurement: 'hp',
        flowMeasurement: 'gpm',
        distanceMeasurement: 'ft',
        pressureMeasurement: 'psi',
        temperatureMeasurement: 'F'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      })

    } else if (settingsForm.controls.unitsOfMeasure.value == 'Metric') {
      settingsForm.patchValue({
        powerMeasurement: 'kW',
        flowMeasurement: 'm3/h',
        distanceMeasurement: 'm',
        pressureMeasurement: 'kPa',
        temperatureMeasurement: 'C'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      })
    }
    settingsForm = this.setEnergyResultUnit(settingsForm);
    return settingsForm;
  }

  setEnergyResultUnit(settingsForm: any): any {
    if (settingsForm.controls.unitsOfMeasure.value == 'Imperial') {
      settingsForm.patchValue({
        energyResultUnit: 'MMBtu'
      })
    }
    else if (settingsForm.controls.unitsOfMeasure.value == 'Metric') {
      settingsForm.patchValue({
        energyResultUnit: 'GJ'
      })
    }

    if (settingsForm.controls.energySourceType.value == 'Electricity') {
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

  setTemperatureUnit(settings: Settings){
    if(settings.unitsOfMeasure == 'Imperial'){
      settings.temperatureMeasurement = 'F';
    }else if(settings.unitsOfMeasure == 'Metric'){
      settings.temperatureMeasurement = 'C';
    }else{
      settings.temperatureMeasurement = 'F';
    }
    return settings;
  }
}
