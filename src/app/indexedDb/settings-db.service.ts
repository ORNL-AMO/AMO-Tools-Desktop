import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';
import { Assessment } from '../shared/models/assessment';
import { SettingsService } from '../settings/settings.service';
import { DirectoryDbService } from './directory-db.service';
import { Directory } from '../shared/models/directory';
import { InventoryItem } from '../shared/models/inventory/inventory';

@Injectable()
export class SettingsDbService {
  allSettings: Array<Settings>;
  globalSettings: Settings;
  constructor(private indexedDbService: IndexedDbService, private settingService: SettingsService, private directoryDbService: DirectoryDbService) { }

  setAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.indexedDbService.db) {
        this.indexedDbService.getAllSettings().then(settings => {
          this.allSettings = settings;
          this.globalSettings = this.getByDirectoryId(1);
          this.globalSettings = this.checkSettings(this.globalSettings);
          resolve(true);
        });
      } else {
        this.allSettings = [];
        resolve(false);
      }
    });
  }

  getAll(): Array<Settings> {
    return this.allSettings;
  }

  getById(id: number): Settings {
    let selectedSettings: Settings = _.find(this.allSettings, (settings) => { return settings.id === id; });
    selectedSettings = this.checkSettings(selectedSettings);
    return selectedSettings;
  }

  getByDirectoryId(id: number): Settings {
    let selectedSettings: Settings = _.find(this.allSettings, (settings) => { return settings.directoryId === id; });
    if (!selectedSettings) {
      let directory: Directory = this.directoryDbService.getById(id);
      if (directory.parentDirectoryId) {
        return this.getByDirectoryId(directory.parentDirectoryId);
      } else {
        selectedSettings = this.globalSettings;
      }
    }
    selectedSettings = this.checkSettings(selectedSettings);
    return selectedSettings;
  }

  getByInventoryId(inventoryItem: InventoryItem): Settings {
    let selectedSettings: Settings = _.find(this.allSettings, (settings) => { return settings.inventoryId === inventoryItem.id; });
    if (!selectedSettings) {
      let directory: Directory = this.directoryDbService.getById(inventoryItem.directoryId);
      if (directory.parentDirectoryId) {
        return this.getByDirectoryId(directory.parentDirectoryId);
      } else {
        selectedSettings = this.globalSettings;
      }
    }
    selectedSettings = this.checkSettings(selectedSettings);
    return selectedSettings;
  }

  getByAssessmentId(assessment: Assessment, neededFromAssessment?: boolean): Settings {
    let selectedSettings: Settings = _.find(this.allSettings, (settings) => { return settings.assessmentId === assessment.id; });
    if (!selectedSettings && !neededFromAssessment) {
      selectedSettings = this.getByDirectoryId(assessment.directoryId);
    }
    if (!selectedSettings && !neededFromAssessment) {
      selectedSettings = this.globalSettings;
    }
    if (selectedSettings) {
      selectedSettings = this.checkSettings(selectedSettings);
    }
    return selectedSettings;
  }


  checkSettings(settings: Settings): Settings {
    if (!settings.energyResultUnit) {
      settings = this.settingService.setEnergyResultUnitSetting(settings);
    }
    if (settings.currency == "$ - US Dollar") {
      settings.currency = "$";
    }
    if (!settings.temperatureMeasurement) {
      settings = this.settingService.setTemperatureUnit(settings);
    }
    if (!settings.steamTemperatureMeasurement) {
      settings = this.settingService.setSteamUnits(settings);
    }

    if (!settings.steamMassFlowMeasurement || settings.steamMassFlowMeasurement === 'kghr' || settings.steamMassFlowMeasurement === 'lbhr') {
      settings.steamMassFlowMeasurement = 'klb';
    }

    if (!settings.steamPowerMeasurement || settings.steamPowerMeasurement === 'MMBtu') {
      settings.steamPowerMeasurement = 'kW';
    }

    if (!settings.steamEnergyMeasurement) {
      settings.steamEnergyMeasurement = 'MMBtu';
    }

    if (!settings.steamVolumeMeasurement) {
      settings.steamVolumeMeasurement = 'gal';
    }

    if (!settings.densityMeasurement ||
      !settings.fanFlowRate ||
      !settings.fanPressureMeasurement ||
      !settings.fanBarometricPressure ||
      !settings.fanSpecificHeatGas ||
      !settings.fanPowerMeasurement) {
      settings = this.settingService.setFanUnits(settings);
    }

    if (settings.fuelCost == undefined) {
      settings.fuelCost = 3.99;
    }
    if (settings.steamCost == undefined) {
      settings.steamCost = 4.69;
    }
    if (settings.electricityCost == undefined) {
      settings.electricityCost = .066;
    }
    if (settings.compressedAirCost == undefined) {
      settings.compressedAirCost = 0.022;
    }
    if (!settings.commonRollupUnit) {
      settings.commonRollupUnit = settings.energyResultUnit;
    }
    if (!settings.pumpsRollupUnit) {
      settings.pumpsRollupUnit = 'MWh';
    }
    if (!settings.fansRollupUnit) {
      settings.fansRollupUnit = 'MWh';
    }
    if (!settings.steamRollupUnit) {
      settings.steamRollupUnit = 'MMBtu';
    }
    if (!settings.wasteWaterRollupUnit) {
      settings.wasteWaterRollupUnit = 'kWh';
    }
    if (!settings.compressedAirRollupUnit) {
      settings.compressedAirRollupUnit = 'kWh';
    }
    return settings;
  }

}
