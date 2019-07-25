import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { OperatingHours } from '../models/operations';

@Component({
  selector: 'app-operating-hours-modal',
  templateUrl: './operating-hours-modal.component.html',
  styleUrls: ['./operating-hours-modal.component.css'],
  animations: [
    trigger('modal', [
      state('show', style({
        top: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
})
export class OperatingHoursModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<number>();
  @Input()
  width: number;

  showModal: string = 'hide';

  timeError: string = null;
  weeksPerYearError: string = null;
  daysPerWeekError: string = null;
  shiftsPerDayError: string = null;
  hoursPerShiftError: string = null;
  hoursPerYearError: string = null;
  operatingHours: OperatingHours;
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.showModal = 'show';
    }, 100)
    if (!this.operatingHours) {
      this.operatingHours = {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: 3,
        hoursPerShift: 8,
        hoursPerYear: 8736
      };
      this.calculatHrsPerYear();
    } else if (!this.operatingHours.hoursPerYear) {
      this.calculatHrsPerYear();
    }
  }

  calculatHrsPerYear() {
    let timeCheck = this.operatingHours.shiftsPerDay * this.operatingHours.hoursPerShift;
    if (timeCheck > 24) {
      this.timeError = "You have exceeded 24 hours/day  " + " " + "(" + timeCheck.toFixed(2) + " " + "hours/day)" + " " + "Adjust your inputs for Shifts/Day and Hours/Shift.";
    } else {
      this.timeError = null;
    }
    if (this.operatingHours.weeksPerYear > 52 || this.operatingHours.weeksPerYear <= 0) {
      this.weeksPerYearError = "The number of weeks/year must me greater than 0 and equal or less than 52";
    } else {
      this.weeksPerYearError = null;
    }
    if (this.operatingHours.daysPerWeek > 7 || this.operatingHours.daysPerWeek <= 0) {
      this.daysPerWeekError = "The number of day/week must be greater than 0 and equal or less than 7";
    } else {
      this.daysPerWeekError = null;
    }
    if (this.operatingHours.shiftsPerDay <= 0) {
      this.shiftsPerDayError = "Number of shifts/day must be greater than 0";
    } else {
      this.shiftsPerDayError = null;
    }
    if (this.operatingHours.hoursPerShift > 24 || this.operatingHours.hoursPerShift <= 0) {
      this.hoursPerShiftError = "Number of hours/shift must be greater then 0 and equal or less than 24 ";
    } else {
      this.hoursPerShiftError = null;
    }

    this.startSavePolling();
    this.operatingHours.isCalculated = true;
    this.operatingHours.hoursPerYear = this.operatingHours.hoursPerShift * this.operatingHours.shiftsPerDay * this.operatingHours.daysPerWeek * this.operatingHours.weeksPerYear;
    if (this.operatingHours.hoursPerYear > 8760) {
      this.hoursPerYearError = "Number of hours/year is greater than hours in a year.";
    } else {
      this.hoursPerYearError = null;
    }

    // this.operatingHours.hoursPerYear = this.operatingHours.hoursPerYear.toFixed(0);
  }

  setNotCalculated() {
    this.startSavePolling();
    this.operatingHours.isCalculated = false;
  }

  addShift() {
    this.operatingHours.shiftsPerDay += 1;
    this.calculatHrsPerYear();
  }

  subtractShift() {
    this.operatingHours.shiftsPerDay -= 1;
    this.calculatHrsPerYear();
  }
  subtractShiftHr() {
    this.operatingHours.hoursPerShift -= 1;
    this.calculatHrsPerYear();
  }
  addShiftHr() {
    this.operatingHours.hoursPerShift += 1;
    this.calculatHrsPerYear();
  }

  subtractWeekDay() {
    this.operatingHours.daysPerWeek -= 1;
    this.calculatHrsPerYear();
  }
  addWeekDay() {
    this.operatingHours.daysPerWeek += 1;
    this.calculatHrsPerYear();
  }

  addWeek() {
    this.operatingHours.weeksPerYear += 1;
    this.calculatHrsPerYear();
  }

  subtractWeek() {
    this.operatingHours.weeksPerYear -= 1;
    this.calculatHrsPerYear();
  }

  startSavePolling() {
    // this.save.emit(true);
  }

  close() {
    this.emitClose.emit(true);
  }

  save() {
    this.showModal = 'hide';
    setTimeout(() => {
      this.emitSave.emit(this.operatingHours.hoursPerYear);
    }, 500)
  }
}
