import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { ConvertFsatService } from '../convert-fsat.service';
import { FSAT } from '../../shared/models/fans';
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
  @Output('emitSaveFsat')
  emitSaveFsat = new EventEmitter<FSAT>();
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();

  settingsForm: UntypedFormGroup; 
  oldSettings: Settings;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService, 
            private convertFsatService: ConvertFsatService) { }


  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.assessment.fsat.existingDataUnits && this.assessment.fsat.existingDataUnits != this.oldSettings.unitsOfMeasure) {
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

    let settingsChanged: boolean = this.settings.temperatureMeasurement !== this.oldSettings.temperatureMeasurement ||
        this.settings.densityMeasurement !== this.oldSettings.densityMeasurement ||
        this.settings.fanBarometricPressure !== this.oldSettings.fanBarometricPressure ||
        this.settings.fanPressureMeasurement !== this.oldSettings.fanPressureMeasurement ||
        this.settings.fanFlowRate !== this.oldSettings.fanFlowRate ||
        this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure;

    if (settingsChanged) {
      this.assessment.fsat.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.emitSaveFsat.emit(this.assessment.fsat);
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }
    this.emitSave.emit(this.settings);
  }

  getExistingDataSettings(): Settings {
    let existingSettingsForm: UntypedFormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: this.assessment.fsat.existingDataUnits});
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }

  updateData(showSuccess?: boolean) {
    this.assessment.fsat = this.convertFsatService.convertExistingData(this.assessment.fsat, this.oldSettings, this.settings);  
    if(showSuccess) {
      this.initSuccessMessage();
    }
    this.showUpdateDataReminder = false;
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.assessment.fsat.existingDataUnits = this.settings.unitsOfMeasure;
    this.emitSaveFsat.emit(this.assessment.fsat);
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
