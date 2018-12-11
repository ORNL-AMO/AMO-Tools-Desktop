import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-assessment-settings',
  templateUrl: './assessment-settings.component.html',
  styleUrls: ['./assessment-settings.component.css']
})
export class AssessmentSettingsComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('resetSystemSettingsEmit')
  resetSystemSettingsEmit = new EventEmitter<boolean>();
  @Output('emitUpdateDirectory')
  emitUpdateDirectory = new EventEmitter<boolean>();

  settings: Settings;
  settingsForm: FormGroup;

  unitChange: boolean = false;
//add boolean for each section
  showGeneralSettings: boolean = false;
  showPsatSettings: boolean = false;
  showPhastSettings:boolean = false;
  showSteamSettings: boolean = false;
  showFsatSettings: boolean = false;
  showTutorialSettings: boolean = false;
  showSettingsModal: boolean = false;

  constructor(private indexedDbService: IndexedDbService, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService, private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.initializeSettings();
  }

  initializeSettings(){
    let results: Settings = this.settingsDbService.getByDirectoryId(this.directory.id);
    if (results) {
      this.settings = results;
      this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    } else {
      this.getParentDirectorySettings(this.directory.parentDirectoryId);
    }
  }

  setUnits() {
    this.unitChange = !this.unitChange;
  }

  getParentDirectorySettings(parentDirectoryId: number) {
    //get parent directory
    let parentDirectory = this.directoryDbService.getById(parentDirectoryId);
    //get parent directory settings
    this.settings = this.settingsDbService.getByDirectoryId(parentDirectory.id);
    if (this.settings) {
      this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    } else {
      //no settings try again with parents parent directory
      this.getParentDirectorySettings(parentDirectory.parentDirectoryId)
    }
  }

  updateSettings(updateData: boolean) {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    tmpSettings.directoryId = this.directory.id;
    tmpSettings.id = this.settings.id;
    tmpSettings.appVersion = this.settings.appVersion;
    tmpSettings.disableTutorial = this.settings.disableTutorial;
    this.indexedDbService.putSettings(tmpSettings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          this.settings = this.settingsDbService.getByDirectoryId(this.directory.id);
          this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
          this.emitUpdateDirectory.emit(true);
        })
      }
    )
  }

  saveTutorialChanges(){
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          this.settings = this.settingsDbService.getByDirectoryId(this.directory.id);
          this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
          this.emitUpdateDirectory.emit(true);
        })
      }
    )
  }

  //simple toggle function needed for each section
  toggleGeneralSettings(){
    this.showGeneralSettings = !this.showGeneralSettings;
  }
  togglePsatSettings(){
    this.showPsatSettings = !this.showPsatSettings;
  }
  togglePhastSettings(){
    this.showPhastSettings = !this.showPhastSettings;
  }
  toggleSteamSettings(){
    this.showSteamSettings = !this.showSteamSettings;
  }

  toggleFsatSettings(){
    this.showFsatSettings = !this.showFsatSettings;
  }

  toggleTutorialSettings(){
    this.showTutorialSettings = !this.showTutorialSettings;
  }

  showResetSystemSettingsModal() {
    this.showSettingsModal = true;
   }

   hideResetSystemSettingsModal() {
    this.showSettingsModal = false;
    this.initializeSettings();
    this.emitUpdateDirectory.emit(true);
   }
}
