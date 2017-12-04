import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

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

  unitChange: boolean = false;

  settingsForm: any;
  isFirstChange: boolean = true;

  newSettings: Settings;

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];

  counter: any;

  isEditingName: boolean = false;
  didNameChange: boolean = false;


  @ViewChild('settingsModal') public settingsModal: ModalDirective;

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      this.saveChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  ngOnDestroy() {
    clearTimeout(this.counter);
  }

  setUnits() {
    this.unitChange = !this.unitChange;
  }

  saveChanges() {
    this.newSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (
      this.settings.currency != this.newSettings.currency ||
      this.settings.distanceMeasurement != this.newSettings.distanceMeasurement ||
      this.settings.flowMeasurement != this.newSettings.flowMeasurement ||
      this.settings.language != this.newSettings.language ||
      this.settings.powerMeasurement != this.newSettings.powerMeasurement ||
      this.settings.pressureMeasurement != this.newSettings.pressureMeasurement ||
      this.settings.unitsOfMeasure != this.newSettings.unitsOfMeasure
    ) {
      if (this.psat.inputs.flow_rate || this.psat.inputs.head || this.psat.inputs.motor_rated_power) {
        this.showSettingsModal();
      } else {
        this.updateData(false);
      }
    }

    if (this.didNameChange) {
      this.updateAssessment.emit(true);
    }
  }

  updateData(bool: boolean) {
    //convert if true
    if (bool == true) {
      this.psat = this.convertPsatData(this.psat);
      if (this.psat.modifications) {
        this.psat.modifications.forEach(mod => {
          mod.psat = this.convertPsatData(mod.psat);
        })
      }
      this.updateAssessment.emit(true);
    }
    //update settings
    this.newSettings.assessmentId = this.assessment.id;
    this.newSettings.id = this.settings.id;
    this.indexedDbService.putSettings(this.newSettings).then(
      results => {
        //get updated settings
        this.updateSettings.emit(true);
      }
    )
    this.hideSettingsModal();
  }

  convertPsatData(psat: PSAT) {
    if (psat.inputs.flow_rate) {
      psat.inputs.flow_rate = this.convertUnitsService.value(psat.inputs.flow_rate).from(this.settings.flowMeasurement).to(this.newSettings.flowMeasurement);
      psat.inputs.flow_rate = this.convertUnitsService.roundVal(psat.inputs.flow_rate, 2);
    }
    if (psat.inputs.head) {
      psat.inputs.head = this.convertUnitsService.value(psat.inputs.head).from(this.settings.distanceMeasurement).to(this.newSettings.distanceMeasurement);
      psat.inputs.head = this.convertUnitsService.roundVal(psat.inputs.head, 2);
    }
    if (psat.inputs.motor_rated_power) {
      psat.inputs.motor_rated_power = this.convertUnitsService.value(psat.inputs.motor_rated_power).from(this.settings.powerMeasurement).to(this.newSettings.powerMeasurement);
      if (this.newSettings.powerMeasurement == 'hp') {
        psat.inputs.motor_rated_power = this.getClosest(psat.inputs.motor_rated_power, this.horsePowers);
      } else {
        psat.inputs.motor_rated_power = this.getClosest(psat.inputs.motor_rated_power, this.kWatts);
      }
    }
    return psat;
  }

  showSettingsModal() {
    this.settingsModal.show();
  }

  hideSettingsModal() {
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

  editName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  startSavePolling(bool?: boolean) {
    if (bool) {
      this.didNameChange = true;
    }
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.saveChanges()
    }, 3500)
  }
}
