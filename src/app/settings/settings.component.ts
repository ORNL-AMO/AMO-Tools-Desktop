import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  settingsForm: any;
  currentSettings: Settings;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.indexedDbService.getDirectorySettings(1).then(
      results => {
        if (results.length != 0) {
          this.currentSettings = results[0];
          this.settingsForm = this.settingsService.getFormFromSettings(results[0]);
        } else {
          this.settingsForm = this.settingsService.getSettingsForm();
        }
      }
    )
  }

  saveSettings() {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.currentSettings.currency = tmpSettings.currency;
    this.currentSettings.language = tmpSettings.language;
    this.currentSettings.unitsOfMeasure = tmpSettings.unitsOfMeasure;
    this.currentSettings.flowMeasurement = tmpSettings.flowMeasurement;
    this.currentSettings.distanceMeasurement = tmpSettings.distanceMeasurement;
    this.indexedDbService.putSettings(this.currentSettings).then(
      results => {
        this.indexedDbService.getDirectorySettings(1).then(
          results => {
            this.settingsForm = this.settingsService.getFormFromSettings(results[0]);
          }
        )
      }
    )
  }
}
