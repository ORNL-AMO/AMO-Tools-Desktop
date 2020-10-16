import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SystemBasics, WasteWater } from '../../shared/models/waste-water';
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
  constructor(private settingsService: SettingsService, private systemBasicsService: SystemBasicsService, private wasteWaterService: WasteWaterService) { }


  ngOnInit() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    this.systemBasicsForm = this.systemBasicsService.getFormFromObj(wasteWater.systemBasics);
    let settings: Settings = this.wasteWaterService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }

  saveSystemBasics(){
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let systemBasics: SystemBasics = this.systemBasicsService.getObjFromForm(this.systemBasicsForm);
    wasteWater.systemBasics = systemBasics;
    this.wasteWaterService.wasteWater.next(wasteWater);
  }

  saveSettings(){}
}
