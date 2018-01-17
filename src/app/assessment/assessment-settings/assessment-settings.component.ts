import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { ModalDirective } from 'ngx-bootstrap';
import { Assessment } from '../../shared/models/assessment';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PSAT } from '../../shared/models/psat';
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
  editName: boolean = false;
  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];

  //does directory have settings
  isDirectorySettings: boolean = false;
  constructor(private indexedDbService: IndexedDbService, private settingsService: SettingsService, private toastyService: ToastyService, private toastyConfig: ToastyConfig, private convertUnitsService: ConvertUnitsService) {
    this.toastyConfig.theme = 'bootstrap';
  }

  @ViewChild('settingsModal') public settingsModal: ModalDirective;

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

  // checkForUpdates(){

  // }

  showSettingsModal(_oldSettings?: Settings, _newSettings?: Settings) {
    let settingsChanged;
    //check if settings have changed
    if (!_oldSettings && !_newSettings) {
      let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      tmpSettings.directoryId = this.directory.id;
      tmpSettings.id = this.settings.id;
      let oldSettings = this.settings;
      settingsChanged = this.checkNewSettings(tmpSettings, oldSettings);
    } else {
      settingsChanged = this.checkNewSettings(_oldSettings, _newSettings);
    }
    if (settingsChanged) {
      this.settingsModal.show();
    }
  }

  hideSettingsModal() {
    this.settingsModal.hide();
  }

  setUnits() {
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
    if (this.directory.name && this.directory.id != 1) {
      this.indexedDbService.putDirectory(this.directory).then(
        results => {
          this.emitUpdateDirectory.emit(true)
        }
      );
    }


    if (!this.isDirectorySettings) {
      //TODO: logic for flow, creating settings inside populated directory
      this.createSettings();
    }
    else {
      //TODO: only show modal if there will be assessments effected by change
      this.showSettingsModal();
    }
  }

  updateSettings(updateData: boolean) {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    tmpSettings.directoryId = this.directory.id;
    tmpSettings.id = this.settings.id;
    let oldSettings = this.settings;
    this.indexedDbService.putSettings(tmpSettings).then(
      results => {
        this.indexedDbService.getDirectorySettings(this.directory.id).then(
          results => {
            if (results.length != 0) {
              this.addToast('Settings Updated');
              this.settings = results[0];
              if (updateData) {
                this.updateAssessments(this.directory, oldSettings, this.settings);
              } else {
                this.hideSettingsModal();
              }
              this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
            }
          }
        )
      }
    )
  }

  createSettings() {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    tmpSettings.directoryId = this.directory.id;
    tmpSettings.createdDate = new Date();
    tmpSettings.modifiedDate = new Date();
    let oldSettings = this.settings;
    tmpSettings.appVersion = packageJson.version;
    this.indexedDbService.addSettings(tmpSettings).then(
      results => {
        this.isDirectorySettings = true;
        this.indexedDbService.getDirectorySettings(this.directory.id).then(
          results => {
            if (results.length != 0) {
              this.addToast('Settings Created for this folder');
              this.settings = results[0];
              this.showSettingsModal(oldSettings, this.settings);
              this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
              this.isDirectorySettings = true;
            }
          }
        )
      }
    )
  }


  updateAssessments(directory: Directory, oldSettings: Settings, newSettings: Settings) {
    //update directory assessments
    if (directory.assessments) {
      directory.assessments.forEach(assessment => {
        //check assessments for settings
        this.indexedDbService.getAssessmentSettings(assessment.id).then(
          results => {
            //if no settings
            if (results.length == 0) {
              if (assessment.psat) {
                //convert psat
                let tmpResults = this.convertPsat(assessment.psat, oldSettings, newSettings);
                assessment.psat = tmpResults.psat;
                //convert mods
                if (assessment.psat.modifications) {
                  assessment.psat.modifications.forEach(mod => {
                    mod = this.convertPsat(mod.psat, oldSettings, newSettings);
                  })
                }
                if (tmpResults.updated) {
                  //update assessment
                  this.indexedDbService.putAssessment(assessment).then(results => { this.addToast('Assessment Updated') });
                }
              } else {
                //TODO PHAST
              }
            }
          }
        )
      })
    }
    //get/update sub directory assessments
    if (directory.id != this.directory.id && !directory.assessments) {
      this.indexedDbService.getDirectoryAssessments(directory.id).then(
        results => {
          if (results.length != 0) {
            results.forEach(assessment => {
              //check assessments for settings
              this.indexedDbService.getAssessmentSettings(assessment.id).then(
                results => {
                  //if no settings
                  if (results.length == 0) {
                    if (assessment.psat) {
                      //convert psat
                      let tmpResults = this.convertPsat(assessment.psat, oldSettings, newSettings);
                      assessment.psat = tmpResults.psat;
                      //convert mods
                      if (assessment.psat.modifications) {
                        assessment.psat.modifications.forEach(mod => {
                          mod = this.convertPsat(mod.psat, oldSettings, newSettings);
                        })
                      }
                      if (tmpResults.updated) {
                        //update assessment
                        this.indexedDbService.putAssessment(assessment).then(results => { this.addToast('Assessment Data Updated') });
                      }
                    } else {
                      //TODO PHAST
                    }
                  }
                }
              )
            })
          }
        }
      )
    }

    //update subDirectories
    if (directory.subDirectory) {
      directory.subDirectory.forEach(dir => {
        //check if sub directories have settings
        this.indexedDbService.getDirectorySettings(dir.id).then(
          results => {
            if (results.length == 0) {
              this.updateAssessments(dir, oldSettings, newSettings);
            }
          }
        )
      })
    }
    //check for subDirectory if none
    else {
      this.indexedDbService.getChildrenDirectories(directory.id).then(
        results => {
          if (results.length != 0) {
            results.forEach(dir => {
              this.updateAssessments(dir, oldSettings, newSettings);
            })
          }
        }
      )
    }
    this.hideSettingsModal();
  }

  convertPsat(psat: PSAT, oldSettings: Settings, newSettings: Settings) {
    let updated: boolean = false;
    if (psat.inputs.flow_rate) {
      psat.inputs.flow_rate = this.convertUnitsService.value(psat.inputs.flow_rate).from(oldSettings.flowMeasurement).to(newSettings.flowMeasurement);
      psat.inputs.flow_rate = this.convertUnitsService.roundVal(psat.inputs.flow_rate, 2);
      updated = true;
    }
    if (psat.inputs.head) {
      psat.inputs.head = this.convertUnitsService.value(psat.inputs.head).from(oldSettings.distanceMeasurement).to(newSettings.distanceMeasurement);
      psat.inputs.head = this.convertUnitsService.roundVal(psat.inputs.head, 2);
      updated = true;
    }
    if (psat.inputs.motor_rated_power) {
      psat.inputs.motor_rated_power = this.convertUnitsService.value(psat.inputs.motor_rated_power).from(oldSettings.powerMeasurement).to(newSettings.powerMeasurement);
      if (newSettings.powerMeasurement == 'hp') {
        psat.inputs.motor_rated_power = this.getClosest(psat.inputs.motor_rated_power, this.horsePowers);
        updated = true;
      } else {
        psat.inputs.motor_rated_power = this.getClosest(psat.inputs.motor_rated_power, this.kWatts);
        updated = true;
      }
    }
    let results = {
      psat: psat,
      updated: updated
    }
    return results;
  }


  //check if new settings different then old
  checkNewSettings(newSettings: Settings, oldSettings: Settings) {
    if (
      oldSettings.currency != newSettings.currency ||
      oldSettings.distanceMeasurement != newSettings.distanceMeasurement ||
      oldSettings.flowMeasurement != newSettings.flowMeasurement ||
      oldSettings.language != newSettings.language ||
      oldSettings.powerMeasurement != newSettings.powerMeasurement ||
      oldSettings.pressureMeasurement != newSettings.pressureMeasurement ||
      oldSettings.unitsOfMeasure != newSettings.unitsOfMeasure ||
      oldSettings.energySourceType != newSettings.energySourceType ||
      oldSettings.phastRollupUnit != newSettings.phastRollupUnit
    ) {
      return true;
    } else {
      return false;
    }
  }


  addToast(str: string) {
    let toastOptions: ToastOptions = {
      title: str,
      timeout: 2000,
      showClose: true,
      theme: 'default'
    }
    this.toastyService.success(toastOptions);
  }

  resetData() {
    this.resetDataEmit.emit(true);
  }

  getClosest(num: number, arr: Array<number>) {
    let closest;
    let diff = Infinity;
    arr.forEach(val => {
      let tmpDiff = Math.abs(num - val);
      if (tmpDiff < diff) {
        diff = tmpDiff
        closest = val;
      }
    })
    return closest;
  }

  editDirectoryName() {
    this.editName = true;
  }

  doneEditingName() {
    this.editName = false;
    if (this.directory.name) {
      this.indexedDbService.putDirectory(this.directory).then(
        results => {
          this.emitUpdateDirectory.emit(true)
        }
      );
    }
  }

}
