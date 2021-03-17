import { Component, Input, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  assessment: Assessment;

  settingsForm: FormGroup;
  oldSettings: Settings;
  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  systemBasicsForm: FormGroup;
  constructor(private settingsService: SettingsService, private systemBasicsService: SystemBasicsService,
    private wasteWaterService: WasteWaterService, private convertWasteWaterService: ConvertWasteWaterService,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService) { }


  ngOnInit() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    this.systemBasicsForm = this.systemBasicsService.getFormFromObj(wasteWater.systemBasics);
    let settings: Settings = this.wasteWaterService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }

  saveSystemBasics() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let systemBasics: SystemBasics = this.systemBasicsService.getObjFromForm(this.systemBasicsForm);
    wasteWater.systemBasics = systemBasics;
    this.wasteWaterService.updateWasteWater(wasteWater);
  }

  saveSettings() {
    let currentSettings: Settings = this.wasteWaterService.settings.getValue();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    this.showUpdateData = false;
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.showUpdateData = newSettings.unitsOfMeasure != this.oldSettings.unitsOfMeasure;
    newSettings.id = id;
    newSettings.createdDate = createdDate;
    newSettings.assessmentId = assessmentId;
    this.indexedDbService.putSettings(newSettings).then(() => {
      this.settingsDbService.setAll();
    });
    this.wasteWaterService.settings.next(newSettings);

  }

  updateData() {
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    wasteWater = this.convertWasteWaterService.convertWasteWater(wasteWater, this.oldSettings, newSettings);
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.oldSettings = newSettings;
    this.dataUpdated = true;
    this.showUpdateData = false;
  }

  focusField(str: string) {
    this.wasteWaterService.focusedField.next(str);
  }
}
