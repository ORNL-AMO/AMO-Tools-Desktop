import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreasureHunt } from '../../shared/models/treasure-hunt';
import { OperatingHours } from '../../shared/models/operations';

@Component({
  selector: 'app-operating-hours',
  templateUrl: './operating-hours.component.html',
  styleUrls: ['./operating-hours.component.css']
})
export class OperatingHoursComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitSave')
  emitSave = new EventEmitter<TreasureHunt>();

  timeError: string = null;
  weeksPerYearError: string = null;
  daysPerWeekError: string = null;
  shiftsPerDayError: string = null;
  hoursPerShiftError: string = null;
  hoursPerYearError: string = null;
  constructor() { }

  ngOnInit() {
    if (!this.treasureHunt.operatingHours) {
      let defaultHours: OperatingHours = {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: 3,
        hoursPerShift: 8,
        hoursPerYear: 8736
      }
      this.treasureHunt.operatingHours = defaultHours;
      this.calculatHrsPerYear();
    } else if (!this.treasureHunt.operatingHours.hoursPerYear) {
      this.calculatHrsPerYear();
    }
  }

  calculatHrsPerYear() {
    let timeCheck = this.treasureHunt.operatingHours.shiftsPerDay * this.treasureHunt.operatingHours.hoursPerShift;
    if (timeCheck > 24) {
      this.timeError = "You have exceeded 24 hours/day  " + " " + "(" + timeCheck.toFixed(2) + " " + "hours/day)" + " " + "Adjust your inputs for Shifts/Day and Hours/Shift.";
    } else {
      this.timeError = null;
    }
    if (this.treasureHunt.operatingHours.weeksPerYear > 52 || this.treasureHunt.operatingHours.weeksPerYear <= 0) {
      this.weeksPerYearError = "The number of weeks/year must me greater than 0 and equal or less than 52";
    } else {
      this.weeksPerYearError = null;
    }
    if (this.treasureHunt.operatingHours.daysPerWeek > 7 || this.treasureHunt.operatingHours.daysPerWeek <= 0) {
      this.daysPerWeekError = "The number of day/week must be greater than 0 and equal or less than 7";
    } else {
      this.daysPerWeekError = null;
    }
    if (this.treasureHunt.operatingHours.shiftsPerDay <= 0) {
      this.shiftsPerDayError = "Number of shifts/day must be greater than 0";
    } else {
      this.shiftsPerDayError = null;
    }
    if (this.treasureHunt.operatingHours.hoursPerShift > 24 || this.treasureHunt.operatingHours.hoursPerShift <= 0) {
      this.hoursPerShiftError = "Number of hours/shift must be greater then 0 and equal or less than 24 ";
    } else {
      this.hoursPerShiftError = null;
    }

    this.save();
    this.treasureHunt.operatingHours.isCalculated = true;
    this.treasureHunt.operatingHours.hoursPerYear = this.treasureHunt.operatingHours.hoursPerShift * this.treasureHunt.operatingHours.shiftsPerDay * this.treasureHunt.operatingHours.daysPerWeek * this.treasureHunt.operatingHours.weeksPerYear;
    if (this.treasureHunt.operatingHours.hoursPerYear > 8760) {
      this.hoursPerYearError = "Number of hours/year is greater than hours in a year."
    } else {
      this.hoursPerYearError = null;
    }
  }

  setNotCalculated() {
    this.save();
    this.treasureHunt.operatingHours.isCalculated = false;
  }

  addShift() {
    this.treasureHunt.operatingHours.shiftsPerDay += 1;
    this.calculatHrsPerYear();
  }

  subtractShift() {
    this.treasureHunt.operatingHours.shiftsPerDay -= 1;
    this.calculatHrsPerYear();
  }
  subtractShiftHr() {
    this.treasureHunt.operatingHours.hoursPerShift -= 1;
    this.calculatHrsPerYear();
  }
  addShiftHr() {
    this.treasureHunt.operatingHours.hoursPerShift += 1;
    this.calculatHrsPerYear();
  }

  subtractWeekDay() {
    this.treasureHunt.operatingHours.daysPerWeek -= 1;
    this.calculatHrsPerYear();
  }
  addWeekDay() {
    this.treasureHunt.operatingHours.daysPerWeek += 1;
    this.calculatHrsPerYear();
  }

  addWeek() {
    this.treasureHunt.operatingHours.weeksPerYear += 1;
    this.calculatHrsPerYear();
  }

  subtractWeek() {
    this.treasureHunt.operatingHours.weeksPerYear -= 1;
    this.calculatHrsPerYear();
  }

  save() {
    this.emitSave.emit(this.treasureHunt);
  }

  focusOut() {

  }

  focusField(str: string) {

  }
}
