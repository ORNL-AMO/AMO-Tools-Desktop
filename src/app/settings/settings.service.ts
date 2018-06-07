import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Settings } from '../shared/models/settings';
import { BehaviorSubject } from 'rxjs';
declare const packageJson;

@Injectable()
export class SettingsService {

  setDontShow: BehaviorSubject<boolean>;
  constructor(private formBuilder: FormBuilder) {
    this.setDontShow = new BehaviorSubject<boolean>(false);
  }

  getSettingsForm(): FormGroup {
    return this.formBuilder.group({
      'language': ['', Validators.required],
      'currency': ['', Validators.required],
      'unitsOfMeasure': ['', Validators.required],
      'distanceMeasurement': [''],
      'flowMeasurement': [''],
      'powerMeasurement': [''],
      'pressureMeasurement': [''],
      'steamPressureMeasurement': [''],
      'steamTemperatureMeasurement': [''],
      'steamSpecificEnthalpyMeasurement': [''],
      'steamSpecificEntropyMeasurement': [''],
      'steamSpecificVolumeMeasurement': [''],
      'steamMassFlowMeasurement': [''],
      'currentMeasurement': [''],
      'viscosityMeasurement': [''],
      'voltageMeasurement': [''],
      'energySourceType': [''],
      'furnaceType': [''],
      'energyResultUnit': [''],
      'customFurnaceName': [''],
      'temperatureMeasurement': [''],
      'phastRollupUnit': [''],
      'defaultPanelTab': [''],
      'fuelCost': [3.99],
      'steamCost': [4.69],
      'electricityCost': [.066],
      'densityMeasurement': ['']
    });
  }

  getFormFromSettings(settings: Settings): FormGroup {
    return this.formBuilder.group({
      'language': [settings.language, Validators.required],
      'currency': [settings.currency, Validators.required],
      'unitsOfMeasure': [settings.unitsOfMeasure, Validators.required],
      'distanceMeasurement': [settings.distanceMeasurement],
      'flowMeasurement': [settings.flowMeasurement],
      'powerMeasurement': [settings.powerMeasurement],
      'pressureMeasurement': [settings.pressureMeasurement],
      'steamPressureMeasurement': [settings.steamPressureMeasurement],
      'steamTemperatureMeasurement': [settings.steamTemperatureMeasurement],
      'steamSpecificEnthalpyMeasurement': [settings.steamSpecificEnthalpyMeasurement],
      'steamSpecificEntropyMeasurement': [settings.steamSpecificEntropyMeasurement],
      'steamSpecificVolumeMeasurement': [settings.steamSpecificVolumeMeasurement],
      'steamMassFlowMeasurement': [settings.steamMassFlowMeasurement],
      'currentMeasurement': [settings.currentMeasurement],
      'viscosityMeasurement': [settings.viscosityMeasurement],
      'voltageMeasurement': [settings.voltageMeasurement],
      'energySourceType': [settings.energySourceType],
      'furnaceType': [settings.furnaceType],
      'energyResultUnit': [settings.energyResultUnit],
      'customFurnaceName': [settings.customFurnaceName],
      'temperatureMeasurement': [settings.temperatureMeasurement],
      'phastRollupUnit': [settings.phastRollupUnit],
      'fanCurveType': [settings.fanCurveType],
      'fanConvertedConditions': [settings.fanConvertedConditions],
      'phastRollupFuelUnit': [settings.phastRollupFuelUnit],
      'phastRollupElectricityUnit': [settings.phastRollupElectricityUnit],
      'phastRollupSteamUnit': [settings.phastRollupSteamUnit],
      'defaultPanelTab': [settings.defaultPanelTab],
      'fuelCost': [settings.fuelCost || 3.99],
      'steamCost': [settings.steamCost || 4.69],
      'electricityCost': [settings.electricityCost || .066],
      'densityMeasurement': [settings.densityMeasurement || 'lbscf'],
      'fanFlowRate': [settings.fanFlowRate || 'ft3/h'],
      'fanPressureMeasurement': [settings.fanPressureMeasurement || 'inH2o']
    });
  }

  getSettingsFromForm(form: FormGroup) {
    let tmpSettings: Settings = {
      language: form.controls.language.value,
      currency: form.controls.currency.value,
      unitsOfMeasure: form.controls.unitsOfMeasure.value,
      distanceMeasurement: form.controls.distanceMeasurement.value,
      flowMeasurement: form.controls.flowMeasurement.value,
      powerMeasurement: form.controls.powerMeasurement.value,
      pressureMeasurement: form.controls.pressureMeasurement.value,
      steamPressureMeasurement: form.controls.steamPressureMeasurement.value,
      steamTemperatureMeasurement: form.controls.steamTemperatureMeasurement.value,
      steamSpecificEnthalpyMeasurement: form.controls.steamSpecificEnthalpyMeasurement.value,
      steamSpecificEntropyMeasurement: form.controls.steamSpecificEntropyMeasurement.value,
      steamSpecificVolumeMeasurement: form.controls.steamSpecificVolumeMeasurement.value,
      steamMassFlowMeasurement: form.controls.steamMassFlowMeasurement.value,
      currentMeasurement: form.controls.currentMeasurement.value,
      viscosityMeasurement: form.controls.viscosityMeasurement.value,
      voltageMeasurement: form.controls.voltageMeasurement.value,
      energySourceType: form.controls.energySourceType.value,
      furnaceType: form.controls.furnaceType.value,
      energyResultUnit: form.controls.energyResultUnit.value,
      customFurnaceName: form.controls.customFurnaceName.value,
      temperatureMeasurement: form.controls.temperatureMeasurement.value,
      appVersion: packageJson.version,
      fanCurveType: form.controls.fanCurveType.value,
      fanConvertedConditions: form.controls.fanConvertedConditions.value,
      phastRollupUnit: form.controls.phastRollupUnit.value,
      phastRollupFuelUnit: form.controls.phastRollupFuelUnit.value,
      phastRollupElectricityUnit: form.controls.phastRollupElectricityUnit.value,
      phastRollupSteamUnit: form.controls.phastRollupSteamUnit.value,
      defaultPanelTab: form.controls.defaultPanelTab.value,
      fuelCost: form.controls.fuelCost.value,
      steamCost: form.controls.steamCost.value,
      electricityCost: form.controls.electricityCost.value,
      densityMeasurement: form.controls.densityMeasurement.value,
      fanFlowRate: form.controls.fanFlowRate.value,
      fanPressureMeasurement: form.controls.fanPressureMeasurement.value
    };
    return tmpSettings;
  }

  getNewSettingFromSetting(settings: Settings): Settings {
    let newSettings: Settings = {
      language: settings.language,
      currency: settings.currency,
      unitsOfMeasure: settings.unitsOfMeasure,
      distanceMeasurement: settings.distanceMeasurement,
      flowMeasurement: settings.flowMeasurement,
      powerMeasurement: settings.powerMeasurement,
      pressureMeasurement: settings.pressureMeasurement,
      steamPressureMeasurement: settings.steamPressureMeasurement,
      steamTemperatureMeasurement: settings.steamTemperatureMeasurement,
      steamSpecificEnthalpyMeasurement: settings.steamSpecificEnthalpyMeasurement,
      steamSpecificEntropyMeasurement: settings.steamSpecificEntropyMeasurement,
      steamSpecificVolumeMeasurement: settings.steamSpecificVolumeMeasurement,
      steamMassFlowMeasurement: settings.steamMassFlowMeasurement,
      currentMeasurement: settings.currentMeasurement,
      viscosityMeasurement: settings.viscosityMeasurement,
      voltageMeasurement: settings.voltageMeasurement,
      energySourceType: settings.energySourceType,
      furnaceType: settings.furnaceType,
      customFurnaceName: settings.customFurnaceName,
      temperatureMeasurement: settings.temperatureMeasurement,
      phastRollupUnit: settings.phastRollupUnit,
      fanCurveType: settings.fanCurveType,
      fanConvertedConditions: settings.fanConvertedConditions,
      phastRollupFuelUnit: settings.phastRollupFuelUnit,
      phastRollupElectricityUnit: settings.phastRollupElectricityUnit,
      phastRollupSteamUnit: settings.phastRollupSteamUnit,
      defaultPanelTab: settings.defaultPanelTab,
      fuelCost: settings.fuelCost,
      steamCost: settings.steamCost,
      electricityCost: settings.electricityCost,
      densityMeasurement: settings.densityMeasurement,
      fanFlowRate: settings.fanFlowRate,
      fanPressureMeasurement: settings.fanPressureMeasurement
    }
    return newSettings;
  }

  setUnits(settingsForm: FormGroup): FormGroup {
    if (settingsForm.controls.unitsOfMeasure.value == 'Imperial') {
      settingsForm.patchValue({
        powerMeasurement: 'hp',
        flowMeasurement: 'gpm',
        distanceMeasurement: 'ft',
        pressureMeasurement: 'psi',
        temperatureMeasurement: 'F',
        steamTemperatureMeasurement: 'F',
        steamPressureMeasurement: 'psi',
        steamSpecificEnthalpyMeasurement: 'btulb',
        steamSpecificEntropyMeasurement: 'btulbF',
        steamSpecificVolumeMeasurement: 'ft3lb',
        steamMassFlowMeasurement: 'lbhr',
        energyResultUnit: 'MMBtu',
        phastRollupUnit: 'MMBtu',
        phastRollupFuelUnit: 'MMBtu',
        phastRollupElectricityUnit: 'MMBtu',
        phastRollupSteamUnit: 'MMBtu',
        densityMeasurement: 'lbscf',
        fanFlowRate: 'ft3/h',
        fanPressureMeasurement: 'inH2o'
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
        temperatureMeasurement: 'C',
        steamPressureMeasurement: 'kPa',
        steamTemperatureMeasurement: 'C',
        steamSpecificEnthalpyMeasurement: 'kJkg',
        steamSpecificEntropyMeasurement: 'kJkgK',
        steamSpecificVolumeMeasurement: 'm3kg',
        steamMassFlowMeasurement: 'kghr',
        energyResultUnit: 'GJ',
        phastRollupUnit: 'GJ',
        phastRollupFuelUnit: 'GJ',
        phastRollupElectricityUnit: 'GJ',
        phastRollupSteamUnit: 'GJ',
        densityMeasurement: 'kgNm3',
        fanFlowRate: 'm3/h',
        fanPressureMeasurement: 'mmH2o'
        // currentMeasurement: 'A',
        // viscosityMeasurement: 'cST',
        // voltageMeasurement: 'V'
      })
    }
    settingsForm = this.setEnergyResultUnit(settingsForm);
    return settingsForm;
  }

  setEnergyResultUnit(settingsForm: FormGroup): FormGroup {
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

  setPhastResultUnit(settings: Settings): Settings {
    if (settings.unitsOfMeasure == 'Imperial') {
      settings.phastRollupUnit = 'MMBtu'
    }
    else if (settings.unitsOfMeasure == 'Metric') {
      settings.phastRollupUnit = 'GJ';
    }

    if (settings.energySourceType == 'Electricity') {
      settings.phastRollupUnit = 'kWh';
    }
    return settings;
  }

  setTemperatureUnit(settings: Settings): Settings {
    if (settings.unitsOfMeasure == 'Imperial') {
      settings.temperatureMeasurement = 'F';
    } else if (settings.unitsOfMeasure == 'Metric') {
      settings.temperatureMeasurement = 'C';
      settings.steamTemperatureMeasurement = 'C';
    } else {
      settings.temperatureMeasurement = 'F';
      settings.steamTemperatureMeasurement = 'F';
    }
    return settings;
  }

  setSteamUnits(settings: Settings): Settings {
    if (settings.unitsOfMeasure === 'Imperial') {
      if (!settings.steamTemperatureMeasurement) {
        settings.steamTemperatureMeasurement = 'F';
      }
      if (!settings.steamPressureMeasurement) {
        settings.steamPressureMeasurement = 'psi';
      }
      if (!settings.steamSpecificEnthalpyMeasurement) {
        settings.steamSpecificEnthalpyMeasurement = 'Btu/lb';
      }
      if (!settings.steamSpecificEntropyMeasurement) {
        settings.steamSpecificEntropyMeasurement = 'Btu/lb-F';
      }
      if (!settings.steamSpecificVolumeMeasurement) {
        settings.steamSpecificVolumeMeasurement = 'ft3/lb';
      }
      if (!settings.steamMassFlowMeasurement) {
        settings.steamMassFlowMeasurement = 'lb/hr';
      }
    } else {
      if (!settings.steamTemperatureMeasurement) {
        settings.steamTemperatureMeasurement = 'C';
      }
      if (!settings.steamPressureMeasurement) {
        settings.steamPressureMeasurement = 'kPa';
      }
      if (!settings.steamSpecificEnthalpyMeasurement) {
        settings.steamSpecificEnthalpyMeasurement = 'kJ/kg';
      }
      if (!settings.steamSpecificEntropyMeasurement) {
        settings.steamSpecificEntropyMeasurement = 'kJ/kg/K';
      }
      if (!settings.steamSpecificVolumeMeasurement) {
        settings.steamSpecificVolumeMeasurement = 'm3/kg';
      }
      if (!settings.steamMassFlowMeasurement) {
        settings.steamMassFlowMeasurement = 'kg/hr';
      }
    }
    return settings;
  }

}
