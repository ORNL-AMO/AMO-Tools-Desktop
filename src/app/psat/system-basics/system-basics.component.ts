import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ng2-bootstrap';
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

  unitChange: boolean = false;

  settingsForm: any;
  isFirstChange: boolean = true;

  newSettings: Settings;

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];

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
      if (this.psat.inputs.flow_rate || this.psat.inputs.head) {
        this.showSettingsModal();
      } else {
        this.updateData(false);
      }
    }
  }

  updateData(bool: boolean) {
    //convert if true
    if (bool == true) {
      if (this.psat.inputs.flow_rate) {
        this.psat.inputs.flow_rate = this.convertUnitsService.value(this.psat.inputs.flow_rate).from(this.settings.flowMeasurement).to(this.newSettings.flowMeasurement);
      }
      if (this.psat.inputs.head) {
        this.psat.inputs.head = this.convertUnitsService.value(this.psat.inputs.head).from(this.settings.distanceMeasurement).to(this.newSettings.distanceMeasurement);
      }
      if (this.psat.inputs.motor_rated_power) {
        this.psat.inputs.motor_rated_power = this.convertUnitsService.value(this.psat.inputs.motor_rated_power).from(this.settings.powerMeasurement).to(this.newSettings.powerMeasurement);
        if (this.settings.powerMeasurement == 'hp') {
          console.log('before')
          console.log(this.psat.inputs.motor_rated_power);
          this.psat.inputs.motor_rated_power = this.getClosest(this.psat.inputs.motor_rated_power, this.horsePowers);
          console.log('after')
          console.log(this.psat.inputs.motor_rated_power);
        } else {
          console.log('before')
          console.log(this.psat.inputs.motor_rated_power);
          this.psat.inputs.motor_rated_power = this.getClosest(this.psat.inputs.motor_rated_power, this.kWatts);
          console.log('after')
          console.log(this.psat.inputs.motor_rated_power);
        }
      }
    }
    this.newSettings.assessmentId = this.assessment.id;
    //assessment has existing settings
    if (this.isAssessmentSettings) {
      this.newSettings.id = this.settings.id;
      this.indexedDbService.putSettings(this.newSettings).then(
        results => {
          //get updated settings
          this.updateSettings.emit(bool);
        }
      )
    }
    //create settings for assessment
    else {
      this.newSettings.createdDate = new Date();
      this.newSettings.modifiedDate = new Date();
      this.indexedDbService.addSettings(this.newSettings).then(
        results => {
          this.isAssessmentSettings = true;
          //get updated settings
          this.updateSettings.emit(bool);
        }
      )
    }
    this.hideSettingsModal();
  }

  showSettingsModal() {
    this.settingsModal.show();
  }

  hideSettingsModal() {
    this.settingsModal.hide();
  }

  getSettingsForm() {
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
        }
      }
    )
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
}
