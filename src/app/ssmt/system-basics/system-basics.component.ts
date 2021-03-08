import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';
import { SSMT } from '../../shared/models/steam/ssmt';
import { ConvertSsmtService } from '../convert-ssmt.service';

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
  @Input()
  ssmt: SSMT;
  @Output('emitSaveSsmt')
  emitSaveSsmt = new EventEmitter<SSMT>();
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();

  settingsForm: FormGroup;
  oldSettings: Settings;
  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  constructor(private settingsService: SettingsService, private convertSsmtService: ConvertSsmtService) { }


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
      this.settings.steamPressureMeasurement != this.oldSettings.steamPressureMeasurement ||
      this.settings.steamTemperatureMeasurement != this.oldSettings.steamTemperatureMeasurement ||
      this.settings.steamSpecificEnthalpyMeasurement != this.oldSettings.steamSpecificEnthalpyMeasurement ||
      this.settings.steamSpecificEntropyMeasurement != this.oldSettings.steamSpecificEntropyMeasurement ||
      this.settings.steamSpecificVolumeMeasurement != this.oldSettings.steamSpecificVolumeMeasurement ||
      this.settings.steamMassFlowMeasurement != this.oldSettings.steamMassFlowMeasurement ||
      this.settings.steamEnergyMeasurement != this.oldSettings.steamEnergyMeasurement ||
      this.settings.steamPowerMeasurement != this.oldSettings.steamPowerMeasurement ||
      this.settings.steamVolumeMeasurement != this.oldSettings.steamVolumeMeasurement ||
      this.settings.steamVolumeFlowMeasurement != this.oldSettings.steamVolumeFlowMeasurement ||
      this.settings.steamVacuumPressure != this.oldSettings.steamVacuumPressure
    ) {
      this.showUpdateData = true;
    }
    if (this.dataUpdated == true) {
      this.dataUpdated = false;
    }
    this.emitSave.emit(this.settings);
  }

  updateData() {
    this.assessment.ssmt = this.convertSsmtService.convertAllInputData(this.ssmt, this.oldSettings, this.settings);
    if(this.assessment.ssmt.modifications){
      this.assessment.ssmt.modifications.forEach(mod => {
        mod.ssmt = this.convertSsmtService.convertAllInputData(mod.ssmt, this.oldSettings, this.settings);
      })
    }
    this.emitSaveSsmt.emit(this.assessment.ssmt);
    this.dataUpdated = true;
    this.showUpdateData = false;
  }

  ngOnDestroy() {
    if(this.showUpdateData && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  saveChanges() {
    //TODO: save ssmt assessment changes
  }
}
