import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

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
  settings: Settings;
  settingsForm: any;

  unitChange: boolean = false;


  //does directory have settings
  isDirectorySettings: boolean = false;
  constructor(private indexedDbService: IndexedDbService, private settingsService: SettingsService, private toastyService: ToastyService, private toastyConfig: ToastyConfig) { 
        this.toastyConfig.theme = 'bootstrap';
        this.toastyConfig.position = 'bottom-center';
  }

  ngOnInit() {
    this.indexedDbService.getDirectorySettings(this.directory.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
          this.isDirectorySettings = true;
        } else {
          this.getParentDirectorySettings(this.directory.parentDirectoryId);
        }
      }
    )

  }


  setUnits(){
    this.unitChange = !this.unitChange;
  }

  getParentDirectorySettings(parentDirectoryId: number) {
    //get parent directory
    this.indexedDbService.getDirectory(parentDirectoryId).then(
      results => {
        let parentDirectory = results;
        //get parent directory settings
        this.indexedDbService.getDirectorySettings(parentDirectory.id).then(
          results => {
            if (results.length != 0) {
              this.settings = results[0];
              this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
            } else {
              //no settings try again with parents parent directory
              this.getParentDirectorySettings(parentDirectory.parentDirectoryId)
            }
          })
      }
    )
  }

  saveSettings() {
    if (!this.isDirectorySettings) {
      let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      tmpSettings.directoryId = this.directory.id;
      tmpSettings.createdDate = new Date();
      tmpSettings.modifiedDate = new Date();
      this.indexedDbService.addSettings(tmpSettings).then(
        results => {
          console.log('setting added');
          this.isDirectorySettings = true;
          this.indexedDbService.getDirectorySettings(this.directory.id).then(
            results => {
              if (results.length != 0) {
                this.addToast();
                this.settings = results[0];
                this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
                this.isDirectorySettings = true;
              }
            }
          )
        }
      )
    }
    else {
      let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      tmpSettings.directoryId = this.directory.id;
      tmpSettings.id = this.settings.id;
      this.indexedDbService.putSettings(tmpSettings).then(
        results => {
          this.indexedDbService.getDirectorySettings(this.directory.id).then(
            results => {
              if (results.length != 0) {
                this.addToast();
                this.settings = results[0];
                this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
              }
            }
          )
        }
      )
    }
  }


  addToast() {
    let toastOptions: ToastOptions = {
      title: 'Settings Saved',
      timeout: 2000,
      showClose: true,
      theme: 'default'
    }
    this.toastyService.success(toastOptions);
  }

  resetData(){
    this.resetDataEmit.emit(true);
  }

}
