import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  saveClicked: boolean;
  @Input()
  settings: Settings;
  @Input()
  isAssessmentSettings: boolean;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Input()
  psat: PSAT;
  @Output('updateAssessment')
  updateAssessment = new EventEmitter<boolean>();
  @Output('nameUpdated')
  nameUpdated = new EventEmitter<boolean>();
  @Output('openModal')
  openModal = new EventEmitter<boolean>();
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();

  settingsForm: FormGroup;
  isFirstChange: boolean = true;

  oldSettings: Settings;

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];

  counter: any;


  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  @ViewChild('settingsModal') public settingsModal: ModalDirective;

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.saveClicked && !this.isFirstChange) {
  //     this.saveChanges();
  //   } else {
  //     this.isFirstChange = false;
  //   }
  // }

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
    if(this.showUpdateData == false){
      this.dataUpdated = true;
    }
    //save
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        //get updated settings
        this.updateSettings.emit(true);
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
    //update settings
    // this.indexedDbService.putSettings(this.settings).then(
    //   results => {
    //     //get updated settings
    //     this.updateSettings.emit(true);
    //   }
    // )
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
      if (this.settings.powerMeasurement == 'hp') {
        psat.inputs.motor_rated_power = this.getClosest(psat.inputs.motor_rated_power, this.horsePowers);
      } else {
        psat.inputs.motor_rated_power = this.getClosest(psat.inputs.motor_rated_power, this.kWatts);
      }
    }
    if (psat.inputs.fluidTemperature) {
      if (this.settings.temperatureMeasurement && this.oldSettings.temperatureMeasurement) {
        psat.inputs.fluidTemperature = this.convertUnitsService.value(psat.inputs.fluidTemperature).from(this.oldSettings.temperatureMeasurement).to(this.settings.temperatureMeasurement);
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

  // editName() {
  //   this.isEditingName = true;
  // }

  // doneEditingName() {
  //   this.isEditingName = false;
  // }

  startSavePolling(bool?: boolean) {
    this.saveChanges()
  }
}
