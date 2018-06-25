import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Assessment } from '../../shared/models/assessment';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PSAT } from '../../shared/models/psat';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
declare const packageJson;

@Component({
  selector: 'app-assessment-settings',
  templateUrl: './assessment-settings.component.html',
  styleUrls: ['./assessment-settings.component.css']
})
export class AssessmentSettingsComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('resetDataEmit')
  resetDataEmit = new EventEmitter<boolean>();
  @Output('emitUpdateDirectory')
  emitUpdateDirectory = new EventEmitter<boolean>();

  settings: Settings;
  settingsForm: any;

  unitChange: boolean = false;
  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  //add boolean for each section
  showGeneralSettings: boolean = true;

  constructor(private indexedDbService: IndexedDbService, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService, private settingsService: SettingsService, private convertUnitsService: ConvertUnitsService) {
  }

  ngOnInit() {
    let results = this.settingsDbService.getByDirectoryId(this.directory.id);
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
    let oldSettings = this.settings;
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
  resetData() {
    this.resetDataEmit.emit(true);
  }
  //simple toggle function needed for each section
  toggleGeneralSettings(){
    this.showGeneralSettings = !this.showGeneralSettings;
  }
}
