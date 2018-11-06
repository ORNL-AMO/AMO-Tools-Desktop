import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
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

  settingsForm: FormGroup;
  oldSettings: Settings;
  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  @ViewChild('settingsModal') public settingsModal: ModalDirective;

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService, private settingsDbService: SettingsDbService) { }

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
      this.settings.temperatureMeasurement != this.oldSettings.temperatureMeasurement
    ) {
      if (this.psat.inputs.flow_rate || this.psat.inputs.head || this.psat.inputs.motor_rated_power || this.psat.inputs.fluidTemperature) {
        this.showUpdateData = true;
      }
    }
    if (this.showUpdateData == false) {
      this.dataUpdated = true;
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

  updateData() {
    this.psat = this.convertPsatData(this.psat);
    if (this.psat.modifications) {
      this.psat.modifications.forEach(mod => {
        mod.psat = this.convertPsatData(mod.psat);
      })
    }
    this.updateAssessment.emit(true);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.showUpdateData = false;
    this.dataUpdated = true;
  }

  convertPsatData(psat: PSAT) {
    if (psat.inputs.flow_rate) {
      psat.inputs.flow_rate = this.convertUnitsService.value(psat.inputs.flow_rate).from(this.oldSettings.flowMeasurement).to(this.settings.flowMeasurement);
      psat.inputs.flow_rate = this.convertUnitsService.roundVal(psat.inputs.flow_rate, 2);
    }
    if (psat.inputs.head) {
      psat.inputs.head = this.convertUnitsService.value(psat.inputs.head).from(this.oldSettings.distanceMeasurement).to(this.settings.distanceMeasurement);
      psat.inputs.head = this.convertUnitsService.roundVal(psat.inputs.head, 2);
    }
    if (psat.inputs.motor_rated_power) {
      psat.inputs.motor_rated_power = this.convertUnitsService.value(psat.inputs.motor_rated_power).from(this.oldSettings.powerMeasurement).to(this.settings.powerMeasurement);
      psat.inputs.motor_rated_power = this.convertUnitsService.roundVal(psat.inputs.motor_rated_power, 2)
    }
    if (psat.inputs.fluidTemperature) {
      if (this.settings.temperatureMeasurement && this.oldSettings.temperatureMeasurement) {
        psat.inputs.fluidTemperature = this.convertUnitsService.value(psat.inputs.fluidTemperature).from(this.oldSettings.temperatureMeasurement).to(this.settings.temperatureMeasurement);
        psat.inputs.fluidTemperature = this.convertUnitsService.roundVal(psat.inputs.fluidTemperature, 2);
      }
    }
    return psat;
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
}
