import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import * as _ from 'lodash';
import { Assessment } from '../shared/models/assessment';
import { SettingsService } from '../settings/settings.service';
import { DirectoryDbService } from './directory-db.service';
import { Directory } from '../shared/models/directory';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { combineLatestWith, firstValueFrom, Observable } from 'rxjs';
import { SettingsStoreMeta } from './dbConfig';

@Injectable()
export class SettingsDbService {
  allSettings: Array<Settings>;
  globalSettings: Settings;
  storeName: string = SettingsStoreMeta.store;
  constructor(
    private settingService: SettingsService, 
    private dbService: NgxIndexedDBService,
    private directoryDbService: DirectoryDbService) { }

  async setAll(settings?: Array<Settings>) {
    if (settings) {
      this.allSettings = settings;
    } else {
      this.allSettings = await firstValueFrom(this.getAllSettings());
    }
    this.globalSettings = this.getByDirectoryId(1);
    this.globalSettings = this.checkSettings(this.globalSettings);
  }

  getAllSettings(): Observable<Array<Settings>> {
    return this.dbService.getAll(this.storeName);
  }

  addWithObservable(settings: Settings): Observable<any> {
    settings.createdDate = new Date();
    settings.modifiedDate = new Date();
    return this.dbService.add(this.storeName, settings);
  }

  deleteByIdWithObservable(settingsId: number): Observable<any> {
    return this.dbService.delete(this.storeName, settingsId);
  }

  bulkDeleteWithObservable(calculatorIds: Array<number>): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.bulkDelete(this.storeName, calculatorIds);
  }

  updateWithObservable(settings: Settings): Observable<any> {
    settings.modifiedDate = new Date();
    return this.dbService.update(this.storeName, settings);
  }

  findById(id: number): Settings {
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
      selectedSettings = this.checkSettings(selectedSettings, assessment);
    }
    return selectedSettings;
  }


  checkSettings(settings: Settings, assessment?: Assessment): Settings {
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
      settings.wasteWaterRollupUnit = 'MWh';
    }
    if (!settings.compressedAirRollupUnit) {
      settings.compressedAirRollupUnit = 'MWh';
    }

    if (!settings.unitsOfMeasure) {
      settings.unitsOfMeasure = 'Imperial';
    }
    if (assessment && settings.unitsOfMeasure === 'Custom') {
      let hasCustomUnitOption: boolean = assessment.psat !== undefined || assessment.fsat !== undefined || assessment.ssmt !== undefined;  
      if (!hasCustomUnitOption) {
        settings.unitsOfMeasure = 'Imperial';
      }
    }
    return settings;
  }


}
