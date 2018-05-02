import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../shared/models/settings";
import { SettingsService } from "../../../settings/settings.service";
import { ConvertUnitsService } from "../../../shared/convert-units/convert-units.service";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-steam-properties',
  templateUrl: './steam-properties.component.html',
  styleUrls: ['./steam-properties.component.css']
})
export class SteamPropertiesComponent implements OnInit {
  @Input()
  settings: Settings;

  steamPropertiesForm: FormGroup;
  tabSelect = 'results';

  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.steamPropertiesForm = this.formBuilder.group({
      'pressure': [0, Validators.required],
      'thermodynamicQuantity': [0, Validators.required],
      'quantityValue': [0, Validators.required]
    });

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

}
