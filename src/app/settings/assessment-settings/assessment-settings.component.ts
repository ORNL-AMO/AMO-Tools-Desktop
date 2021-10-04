import { Component, OnInit } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../settings.service'
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-assessment-settings',
  templateUrl: './assessment-settings.component.html',
  styleUrls: ['./assessment-settings.component.css']
})
export class AssessmentSettingsComponent implements OnInit {

  settings: Settings;
  settingsForm: FormGroup;

  //add boolean for each section
  showGeneralSettings: boolean = false;
  showPsatSettings: boolean = false;
  showPhastSettings: boolean = false;
  showSteamSettings: boolean = false;
  showFsatSettings: boolean = false;
  showTutorialSettings: boolean = false;
  showPrintSettings: boolean = false;
  showSettingsModal: boolean = false;

  constructor(private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.initializeSettings();
  }

  initializeSettings() {
    this.settings = this.settingsDbService.globalSettings;
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  updateSettings() {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    tmpSettings.directoryId = this.settings.directoryId;
    tmpSettings.id = this.settings.id;
    tmpSettings.appVersion = this.settings.appVersion;
    tmpSettings.disableTutorial = this.settings.disableTutorial;
    this.indexedDbService.putSettings(tmpSettings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          this.settings = this.settingsDbService.getById(this.settings.id);
          // this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
          // this.emitUpdateDirectory.emit(true);
        });
      }
    );
  }

  saveTutorialChanges() {
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          this.settings = this.settingsDbService.getByDirectoryId(this.settings.id);
          // this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
          // this.emitUpdateDirectory.emit(true);
        });
      }
    );
  }

  savePrintSettings(){
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          this.settings = this.settingsDbService.getByDirectoryId(this.settings.id);
        });
      }
    );
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

  showResetSystemSettingsModal() {
    this.showSettingsModal = true;
  }

  hideResetSystemSettingsModal() {
    this.showSettingsModal = false;
    this.initializeSettings();
  }
}
