import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatService } from '../psat.service';

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
  @Input()
  psat: PSAT;
  @Output('updateAssessment')
  updateAssessment = new EventEmitter<boolean>();
  @Output('openModal')
  openModal = new EventEmitter<boolean>();
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();

  settingsForm: FormGroup;
  oldSettings: Settings;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  @ViewChild('settingsModal', { static: false }) public settingsModal: ModalDirective;

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService, private settingsDbService: SettingsDbService, private psatService: PsatService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }

  saveChanges() {
    let id = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;
    if (
      this.settings.currency != this.oldSettings.currency ||
      this.settings.distanceMeasurement != this.oldSettings.distanceMeasurement ||
      this.settings.flowMeasurement != this.oldSettings.flowMeasurement ||
      this.settings.language != this.oldSettings.language ||
      this.settings.powerMeasurement != this.oldSettings.powerMeasurement ||
      this.settings.pressureMeasurement != this.oldSettings.pressureMeasurement ||
      this.settings.unitsOfMeasure != this.oldSettings.unitsOfMeasure ||
      this.settings.temperatureMeasurement != this.oldSettings.temperatureMeasurement ||
      this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure
    ) {
      if (this.psat.inputs.flow_rate || this.psat.inputs.head || this.psat.inputs.motor_rated_power || this.psat.inputs.fluidTemperature) {
        this.showUpdateDataReminder = true;
      }
    }
    if (this.showSuccessMessage == true) {
      this.showSuccessMessage = false;
    }
    //save
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          //get updated settings
          this.updateSettings.emit(true);
        })
      }
    )
  }

  updateData(showSuccess?: boolean) {
    this.psat = this.psatService.convertExistingData(this.psat, this.oldSettings, this.settings);
    if (this.psat.modifications) {
      this.psat.modifications.forEach(mod => {
        mod.psat = this.psatService.convertExistingData(this.psat, this.oldSettings, this.settings, mod.psat);
      })
    }
    if(showSuccess) {
      this.initSuccessMessage();
    }
    this.showUpdateDataReminder = false;
    this.updateAssessment.emit(true);
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

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }
}
