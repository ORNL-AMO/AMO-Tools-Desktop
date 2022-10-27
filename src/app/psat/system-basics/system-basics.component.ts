import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
 
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatService } from '../psat.service';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit, OnDestroy {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Output('updateAssessment')
  updateAssessment = new EventEmitter<PSAT>();
  @Output('openModal')
  openModal = new EventEmitter<boolean>();
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();

  settingsForm: UntypedFormGroup;
  oldSettings: Settings;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  @ViewChild('settingsModal', { static: false }) public settingsModal: ModalDirective;

  constructor(private settingsService: SettingsService,    private settingsDbService: SettingsDbService, private psatService: PsatService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.assessment.psat.existingDataUnits && this.assessment.psat.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings();
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  async saveChanges() {
    let id = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;

    let settingsChanged: boolean = this.settings.distanceMeasurement != this.oldSettings.distanceMeasurement ||
      this.settings.flowMeasurement != this.oldSettings.flowMeasurement ||
      this.settings.language != this.oldSettings.language ||
      this.settings.powerMeasurement != this.oldSettings.powerMeasurement ||
      this.settings.pressureMeasurement != this.oldSettings.pressureMeasurement ||
      this.settings.unitsOfMeasure != this.oldSettings.unitsOfMeasure ||
      this.settings.temperatureMeasurement != this.oldSettings.temperatureMeasurement ||
      this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure;
    let hasData: boolean = Boolean(this.assessment.psat.inputs.flow_rate || this.assessment.psat.inputs.head || this.assessment.psat.inputs.motor_rated_power || this.assessment.psat.inputs.fluidTemperature);

    if (hasData && settingsChanged) {
      this.assessment.psat.existingDataUnits = this.oldSettings.unitsOfMeasure;

      this.showUpdateDataReminder = true;
      this.updateAssessment.emit(this.assessment.psat);
    }
    if (this.showSuccessMessage == true) {
      this.showSuccessMessage = false;
    }
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings))
    this.settingsDbService.setAll(updatedSettings);
    this.updateSettings.emit(true);
  }

  getExistingDataSettings(): Settings {
    let existingSettingsForm: UntypedFormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: this.assessment.psat.existingDataUnits});
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }

  updateData(showSuccess?: boolean) {
    this.assessment.psat = this.psatService.convertExistingData(this.assessment.psat, this.oldSettings, this.settings);
    if (this.assessment.psat.modifications) {
      this.assessment.psat.modifications.forEach(mod => {
        this.psatService.convertExistingData(mod.psat, this.oldSettings, this.settings, mod.psat);
      })
    }

    if(showSuccess) {
      this.initSuccessMessage();
    }

    this.showUpdateDataReminder = false;
    this.assessment.psat.existingDataUnits = this.settings.unitsOfMeasure;
    this.updateAssessment.emit(this.assessment.psat);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }

  showSettingsModal() {
    this.openModal.emit(true);
    this.settingsModal.show();
  }

  hideSettingsModal() {
    this.closeModal.emit(true);
    this.settingsModal.hide();
  }

  startSavePolling() {
    this.saveChanges()
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
