import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { SettingsService } from "../../../settings/settings.service";
import {Settings} from "../../../shared/models/settings";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-saturated-properties',
  templateUrl: './saturated-properties.component.html',
  styleUrls: ['./saturated-properties.component.css']
})
export class SaturatedPropertiesComponent implements OnInit {
  @Input()
  settings: Settings;

  saturatedPropertiesForm: FormGroup;
  tabSelect = 'results';

  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.saturatedPropertiesForm = this.formBuilder.group({
      'pressureOrTemperature': [0, Validators.required],
      'saturatedPressure': [0, Validators.required],
      'saturatedTemperature': [0, Validators.required]
    });

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

}
