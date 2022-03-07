import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SettingsService } from '../../settings/settings.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ConvertPhastService } from '../convert-phast.service';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import * as _ from 'lodash';


@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Input()
  assessment: Assessment;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Output('openUpdateUnitsModal')
  openUpdateUnitsModal = new EventEmitter<Settings>();


  settingsForm: FormGroup;
  oldSettings: Settings;
  lossesExist: boolean;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertPhastService: ConvertPhastService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    if (this.settingsForm.controls.energyResultUnit.value === '' || !this.settingsForm.controls.energyResultUnit.value) {
      this.settingsForm = this.settingsService.setEnergyResultUnit(this.settingsForm);
      this.saveSettings();
    }
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.phast.lossDataUnits && this.phast.lossDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings();
      this.showUpdateDataReminder = true;
    }
    this.lossesExist = this.lossExists(this.phast);
  }

  ngOnDestroy() {
    if (this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  lossExists(phast: PHAST) {
    let phastLosses: boolean = phast.losses && Object.keys(phast.losses).length !== 0;
    let lossesExist = false;

    if (phastLosses) {
      // if a loss is added and removed, phast.losses object still has array
      lossesExist = Object.keys(phast.losses).some((key, index) => {
        return phast.losses[key]?.length > 0;
      });
    }

    return lossesExist;
  }
  
  saveSettings() {
    let id = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;

    if (this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure) {
      if (this.lossesExist) {
        this.phast.lossDataUnits = this.oldSettings.unitsOfMeasure;
        this.showUpdateDataReminder = true;
      }
    }
    this.indexedDbService.putSettings(this.settings).then(() => {
      this.settingsDbService.setAll().then(() => {
        this.updateSettings.emit(true);
      });
    });
  }

  getExistingDataSettings(): Settings {
    let existingSettingsForm: FormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: this.phast.lossDataUnits});
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }

  updateData(showSuccess?: boolean) {
    if (this.phast.losses) {
      this.phast = this.convertPhastService.convertExistingData(this.phast, this.oldSettings, this.settings);
      if (showSuccess) {
        this.initSuccessMessage();
      }
      this.showUpdateDataReminder = false;
      this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      this.phast.lossDataUnits = this.settings.unitsOfMeasure;
      this.save.emit(true);
    }
  }

  initSuccessMessage() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }
  
  dismissSuccessMessage() {
    this.showSuccessMessage = false;
  }

}
