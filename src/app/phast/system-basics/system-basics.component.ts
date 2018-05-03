import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SettingsService } from '../../settings/settings.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ConvertPhastService } from '../convert-phast.service';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isAssessmentSettings: boolean;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Input()
  assessment: Assessment;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();

  settingsForm: FormGroup;
  oldSettings: Settings;
  lossesExist: boolean;
  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertPhastService: ConvertPhastService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    //get settings form (used as input into shared settings components)
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    //phast need energyResultUnit
    if (this.settingsForm.controls.energyResultUnit.value == '' || !this.settingsForm.controls.energyResultUnit.value) {
      this.settingsForm = this.settingsService.setEnergyResultUnit(this.settingsForm);
      this.saveChanges();
    }
    //oldSettings used for comparing if units update needed
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    //disables portion of form if exists
    this.lossesExist = this.lossExists(this.phast);
  }

  lossExists(phast: PHAST) {
    if (phast.losses) {
      return true;
    } else {
      return false;
    }
  }
  //save changes to settings
  saveChanges(bool?: boolean) {
    //save id, doesn't persist form
    let id = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;
    //compare to check if data update needed
    if (this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure) {
      if (this.phast.losses) {
        this.showUpdateData = true;
      }
    }
    //used to inform user data updated
    if (this.showUpdateData == false && this.phast.losses && !bool) {
      this.dataUpdated = true;
    }
    //if assessment already has settings, update them
    if (this.isAssessmentSettings) {
      this.indexedDbService.putSettings(this.settings).then(
        results => {
          this.settingsDbService.setAll().then(() => {
            //get updated settings
            this.updateSettings.emit(true);
          })
        }
      )
    }
    //else if assessement does not have own settings create settings for assessment
    //base on setup in phast.component this should probably not occur but keeping for now
    else {
      this.settings.createdDate = new Date();
      this.settings.modifiedDate = new Date();
      this.indexedDbService.addSettings(this.settings).then(
        results => {
          this.settingsDbService.setAll().then(() => {
            this.isAssessmentSettings = true;
            //get updated settings
            this.updateSettings.emit(true);
          })
        }
      )
    }
  }
  //update/convert assessment data for new units
  updateData(bool?: boolean) {
    if (this.phast.losses) {
      this.phast.losses = this.convertPhastService.convertPhastLosses(this.phast.losses, this.oldSettings, this.settings);
      if (this.phast.meteredEnergy) {
        this.phast.meteredEnergy = this.convertPhastService.convertMeteredEnergy(this.phast.meteredEnergy, this.oldSettings, this.settings);
      }
      if (this.phast.designedEnergy) {
        this.phast.designedEnergy = this.convertPhastService.convertDesignedEnergy(this.phast.designedEnergy, this.oldSettings, this.settings);
      }
      if (this.phast.modifications) {
        this.phast.modifications.forEach(mod => {
          if (mod.phast.losses) {
            mod.phast.losses = this.convertPhastService.convertPhastLosses(mod.phast.losses, this.oldSettings, this.settings);
          }
          if (mod.phast.meteredEnergy) {
            mod.phast.meteredEnergy = this.convertPhastService.convertMeteredEnergy(mod.phast.meteredEnergy, this.oldSettings, this.settings);
          }
          if (mod.phast.designedEnergy) {
            mod.phast.designedEnergy = this.convertPhastService.convertDesignedEnergy(mod.phast.designedEnergy, this.oldSettings, this.settings);
          }
        })
      }
      //tell parent to save new data
      this.save.emit(true);
      //update oldSettings with currentSettings
      this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      this.showUpdateData = false;
      this.dataUpdated = true;
    }
  }
}
