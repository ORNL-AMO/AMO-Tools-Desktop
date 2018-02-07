import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PHAST, OperatingHours } from '../../shared/models/phast/phast';

@Component({
  selector: 'app-operating-hours',
  templateUrl: 'operating-hours.component.html',
  styleUrls: ['operating-hours.component.css']
})
export class OperatingHoursComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  saveClicked: boolean;
  timeError: string = null;
  weeksPerYearError: string = null;
  daysPerWeekError: string = null;
  shiftsPerDayError: string = null;
  hoursPerShiftError: string = null;
  yearFormat: any;
  isFirstChange: boolean = true;
  counter: any;
  constructor() { }

  ngOnInit() {
    if (!this.phast.operatingHours) {
      let defaultHours: OperatingHours = {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: Infinity,
        hoursPerShift: 8,
        hoursPerYear: 8736
      }
      this.phast.operatingHours = defaultHours;
      this.calculatHrsPerYear();
    } else if (!this.phast.operatingHours.hoursPerYear) {
      this.calculatHrsPerYear();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      this.save.emit(true);
    } else {
      this.isFirstChange = false;
    }
  }

  calculatHrsPerYear() {
    let timeCheck = this.phast.operatingHours.shiftsPerDay * this.phast.operatingHours.hoursPerShift;
    if (timeCheck > 24) {
      this.timeError = "You have exceeded 24 hours/day  " + " " + "(" + timeCheck.toFixed(2) + " " + "hours/day)" + " " + "Adjust your inputs for Shifts/Day and Hours/Shift.";
    } else {
      this.timeError = null;
    }
    if (this.phast.operatingHours.weeksPerYear > 52 || this.phast.operatingHours.weeksPerYear <= 0) {
      this.weeksPerYearError = "The number of weeks/year must me greater than 0 and equal or less than 52";
    } else {
      this.weeksPerYearError = null;
    }
    if (this.phast.operatingHours.daysPerWeek > 7 || this.phast.operatingHours.daysPerWeek <= 0) {
      this.daysPerWeekError = "The number of day/week must be greater than 0 and equal or less than 7";
    } else {
      this.daysPerWeekError = null;
    }
    if (this.phast.operatingHours.shiftsPerDay <= 0) {
      this.shiftsPerDayError = "Number of shifts/day must be greater than 0";
    } else {
      this.shiftsPerDayError = null;
    }
    if (this.phast.operatingHours.hoursPerShift > 24 || this.phast.operatingHours.hoursPerShift <= 0) {
      this.hoursPerShiftError = " Number of hours/shift must be greater then 0 and equal or less than 24 ";
    } else {
      this.hoursPerShiftError = null;
    }
    this.startSavePolling();
    this.phast.operatingHours.isCalculated = true;
    this.phast.operatingHours.hoursPerYear = this.phast.operatingHours.hoursPerShift * this.phast.operatingHours.shiftsPerDay * this.phast.operatingHours.daysPerWeek * this.phast.operatingHours.weeksPerYear;
    this.yearFormat = this.phast.operatingHours.hoursPerYear.toFixed(0);
  }

  setNotCalculated() {
    this.startSavePolling();
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

  addWeek() {
    this.phast.operatingHours.weeksPerYear += 1;
    this.calculatHrsPerYear();
  }

  subtractWeek() {
    this.phast.operatingHours.weeksPerYear -= 1;
    this.calculatHrsPerYear();
  }

  startSavePolling() {
    this.save.emit(true);
  }

}
