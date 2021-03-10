import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { ConvertFsatService } from '../convert-fsat.service';
import { FSAT } from '../../shared/models/fans';

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

  settingsForm: FormGroup; 
  oldSettings: Settings;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService, private convertFsatService: ConvertFsatService) { }


  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }


  save() {
    let id: number = this.settings.id;
    let createdDate = this.settings.createdDate;
    let assessmentId: number = this.settings.assessmentId;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.assessmentId = assessmentId;
    if (
      this.settings.temperatureMeasurement !== this.oldSettings.temperatureMeasurement ||
      this.settings.densityMeasurement !== this.oldSettings.densityMeasurement ||
      this.settings.fanBarometricPressure !== this.oldSettings.fanBarometricPressure ||
      this.settings.fanPressureMeasurement !== this.oldSettings.fanPressureMeasurement ||
      this.settings.fanFlowRate !== this.oldSettings.fanFlowRate ||
      this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure
    ) {
      this.showUpdateDataReminder = true;
    }
       if (this.showSuccessMessage === true) {
         this.showSuccessMessage = false;
    }
    this.emitSave.emit(this.settings);
  }

  updateData(showSuccess?: boolean) {
  this.convertFsatService.convertExistingData(this.assessment.fsat, this.oldSettings, this.settings);  
  if(showSuccess) {
    this.initSuccessMessage();
  }
  this.showUpdateDataReminder = false;
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

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }
}
