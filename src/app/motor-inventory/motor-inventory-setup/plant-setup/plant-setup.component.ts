import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-plant-setup',
  templateUrl: './plant-setup.component.html',
  styleUrls: ['./plant-setup.component.css']
})
export class PlantSetupComponent implements OnInit {

  settingsForm: FormGroup;
  constructor(private settingsDbService: SettingsDbService, private settingsService: SettingsService) { }

  ngOnInit(): void {
    let settings = this.settingsDbService.globalSettings;
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
  }

}
