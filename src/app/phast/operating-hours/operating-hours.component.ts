import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PHAST, OperatingHours } from '../../shared/models/phast/phast';

@Component({
  selector: 'app-operating-hours',
  templateUrl: 'operating-hours.component.html',
  styleUrls: ['operating-hours.component.css']
})
export class OperatingHoursComponent implements OnInit {
  @Input()
  phast: PHAST;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (!this.phast.operatingHours) {
      let defaultHours: OperatingHours = {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: 3,
        hoursPerShift: 8,
      }
      this.phast.operatingHours = defaultHours;
      this.calculatHrsPerYear();
    }
  }

  calculatHrsPerYear() {
    this.phast.operatingHours.isCalculated = true;
    this.phast.operatingHours.hoursPerYear = this.phast.operatingHours.hoursPerShift * this.phast.operatingHours.shiftsPerDay * this.phast.operatingHours.daysPerWeek * this.phast.operatingHours.weeksPerYear;
  }

  setNotCalculated() {
    this.phast.operatingHours.isCalculated = false;
  }

  addShift() {
    this.phast.operatingHours.shiftsPerDay += 1;
    this.calculatHrsPerYear();
  }

  subtractShift() {
    this.phast.operatingHours.shiftsPerDay -= 1;
    this.calculatHrsPerYear();
  }
  subtractShiftHr() {
    this.phast.operatingHours.hoursPerShift -= 1;
    this.calculatHrsPerYear();
  }
  addShiftHr() {
    this.phast.operatingHours.hoursPerShift += 1;
    this.calculatHrsPerYear();
  }

  subtractWeekDay() {
    this.phast.operatingHours.daysPerWeek -= 1;
    this.calculatHrsPerYear();
  }
  addWeekDay() {
    this.phast.operatingHours.daysPerWeek += 1;
    this.calculatHrsPerYear();
  }

  addWeek(num: number) {
    this.phast.operatingHours.weeksPerYear += 1;
    this.calculatHrsPerYear();
  }

  subtractWeek(num: number) {
    this.phast.operatingHours.weeksPerYear -= 1;
    this.calculatHrsPerYear();
  }
}
