import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';
import { SSMT } from '../../shared/models/steam/ssmt';
import { ConvertSsmtService } from '../convert-ssmt.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit, OnDestroy {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Output('emitSave')
  emitSave = new EventEmitter<Settings>();
  @Output('emitSaveSsmt')
  emitSaveSsmt = new EventEmitter<SSMT>();
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();

  settingsForm: FormGroup;
  oldSettings: Settings;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService, private convertSsmtService: ConvertSsmtService) { }


  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.assessment.ssmt.existingDataUnits && this.assessment.ssmt.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings();
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  save() {
    let id: number = this.settings.id;
    let createdDate = this.settings.createdDate;
    let assessmentId: number = this.settings.assessmentId;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.assessmentId = assessmentId;
    let settingsChanged: boolean = this.settings.steamPressureMeasurement != this.oldSettings.steamPressureMeasurement ||
      this.settings.steamTemperatureMeasurement != this.oldSettings.steamTemperatureMeasurement ||
      this.settings.steamSpecificEnthalpyMeasurement != this.oldSettings.steamSpecificEnthalpyMeasurement ||
      this.settings.steamSpecificEntropyMeasurement != this.oldSettings.steamSpecificEntropyMeasurement ||
      this.settings.steamSpecificVolumeMeasurement != this.oldSettings.steamSpecificVolumeMeasurement ||
      this.settings.steamMassFlowMeasurement != this.oldSettings.steamMassFlowMeasurement ||
      this.settings.steamEnergyMeasurement != this.oldSettings.steamEnergyMeasurement ||
      this.settings.steamPowerMeasurement != this.oldSettings.steamPowerMeasurement ||
      this.settings.steamVolumeMeasurement != this.oldSettings.steamVolumeMeasurement ||
      this.settings.steamVolumeFlowMeasurement != this.oldSettings.steamVolumeFlowMeasurement ||
      this.settings.steamVacuumPressure != this.oldSettings.steamVacuumPressure ||
      this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure;

    if (settingsChanged) {
      this.assessment.ssmt.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.emitSaveSsmt.emit(this.assessment.ssmt);
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage == true) {
      this.showSuccessMessage = false;
    }
    this.emitSave.emit(this.settings);
  }

  getExistingDataSettings(): Settings {
    let existingSettingsForm: FormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: this.assessment.ssmt.existingDataUnits});
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }

  updateData(showSuccess?: boolean) {
    this.assessment.ssmt = this.convertSsmtService.convertExistingData(this.assessment.ssmt, this.oldSettings, this.settings);  
    if(showSuccess) {
      this.initSuccessMessage();
    }
    this.showUpdateDataReminder = false;
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.assessment.ssmt.existingDataUnits = this.settings.unitsOfMeasure;
    this.emitSaveSsmt.emit(this.assessment.ssmt);
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
