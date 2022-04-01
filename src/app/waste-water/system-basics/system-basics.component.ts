import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../../settings/settings.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SystemBasics, WasteWater } from '../../shared/models/waste-water';
import { ConvertWasteWaterService } from '../convert-waste-water.service';
import { WasteWaterService } from '../waste-water.service';
import { SystemBasicsService } from './system-basics.service';

import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit, OnDestroy {
  @Input()
  assessment: Assessment;

  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();
  
  settingsForm: FormGroup;
  oldSettings: Settings;
  systemBasicsForm: FormGroup;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService, private systemBasicsService: SystemBasicsService,
    private wasteWaterService: WasteWaterService, private convertWasteWaterService: ConvertWasteWaterService,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService) { }


  ngOnInit() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    this.systemBasicsForm = this.systemBasicsService.getFormFromObj(wasteWater.systemBasics);
    let settings: Settings = this.wasteWaterService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.assessment.wasteWater.existingDataUnits && this.assessment.wasteWater.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings(wasteWater);
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  saveSystemBasics() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let systemBasics: SystemBasics = this.systemBasicsService.getObjFromForm(this.systemBasicsForm);
    wasteWater.systemBasics = systemBasics;
    this.wasteWaterService.updateWasteWater(wasteWater);
  }

  async saveSettings() {
    let currentSettings: Settings = this.wasteWaterService.settings.getValue();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (newSettings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      wasteWater.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.wasteWaterService.updateWasteWater(wasteWater);
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }

    newSettings.id = id;
    newSettings.createdDate = createdDate;
    newSettings.assessmentId = assessmentId;
    await firstValueFrom(this.settingsDbService.updateWithObservable(newSettings));
    this.settingsDbService.setAll();
    this.wasteWaterService.settings.next(newSettings);

  }

  updateData(showSuccess?: boolean) {
    if(showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    wasteWater = this.convertWasteWaterService.convertWasteWater(wasteWater, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    wasteWater.existingDataUnits = newSettings.unitsOfMeasure;
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.oldSettings = newSettings;
  }

  focusField(str: string) {
    this.wasteWaterService.focusedField.next(str);
  }

  getExistingDataSettings(wasteWater: WasteWater): Settings {
    let existingSettingsForm: FormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: wasteWater.existingDataUnits});
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }

  initSuccessMessage() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  dismissSuccessMessage() {
    this.showSuccessMessage = false;
  }
}
