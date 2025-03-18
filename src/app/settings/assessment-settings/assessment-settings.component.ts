import { Component, OnInit } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../settings.service'
 
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { UntypedFormGroup } from '@angular/forms';
import { EGridService } from '../../shared/helper-services/e-grid.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-assessment-settings',
    templateUrl: './assessment-settings.component.html',
    styleUrls: ['./assessment-settings.component.css'],
    standalone: false
})
export class AssessmentSettingsComponent implements OnInit {

  settings: Settings;
  settingsForm: UntypedFormGroup;

  //add boolean for each section
  showGeneralSettings: boolean = false;
  showPsatSettings: boolean = false;
  showPhastSettings: boolean = false;
  showSteamSettings: boolean = false;
  showFsatSettings: boolean = false;
  showTutorialSettings: boolean = false;
  showPrintSettings: boolean = false;
  showSettingsModal: boolean = false;
  showCo2Settings: boolean = false;

  constructor(   
    private egridService: EGridService, private settingsDbService: SettingsDbService, private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.egridService.getAllSubRegions();
    this.initializeSettings();
  }

  initializeSettings() {
    this.settings = this.settingsDbService.globalSettings;
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  async updateSettings() {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    tmpSettings.directoryId = this.settings.directoryId;
    tmpSettings.id = this.settings.id;
    tmpSettings.appVersion = this.settings.appVersion;
    tmpSettings.disableTutorial = this.settings.disableTutorial;
    await firstValueFrom(this.settingsDbService.updateWithObservable(tmpSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.findById(this.settings.id);
  }

  async saveSettings() {
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.getByDirectoryId(this.settings.id);
  }

  //simple toggle function needed for each section
  toggleGeneralSettings() {
    this.showGeneralSettings = !this.showGeneralSettings;
  }
  togglePsatSettings() {
    this.showPsatSettings = !this.showPsatSettings;
  }
  togglePhastSettings() {
    this.showPhastSettings = !this.showPhastSettings;
  }
  toggleSteamSettings() {
    this.showSteamSettings = !this.showSteamSettings;
  }

  toggleFsatSettings() {
    this.showFsatSettings = !this.showFsatSettings;
  }

  toggleTutorialSettings() {
    this.showTutorialSettings = !this.showTutorialSettings;
  }

  togglePrintSettings() {
    this.showPrintSettings = !this.showPrintSettings;
  }

  toggleCo2Settings() {
    this.showCo2Settings = !this.showCo2Settings;
  }

  showResetSystemSettingsModal() {
    this.showSettingsModal = true;
  }

  hideResetSystemSettingsModal() {
    this.showSettingsModal = false;
    this.initializeSettings();
  }
}
