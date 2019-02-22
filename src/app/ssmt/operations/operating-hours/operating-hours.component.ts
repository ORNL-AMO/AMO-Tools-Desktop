import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OperatingHours } from '../../../shared/models/operations';
import { CompareService } from '../../compare.service';
import { SsmtService } from '../../ssmt.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-operating-hours',
  templateUrl: './operating-hours.component.html',
  styleUrls: ['./operating-hours.component.css']
})
export class OperatingHoursComponent implements OnInit {
  @Input()
  form: FormGroup;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  idString: string;

  timeError: string = null;
  weeksPerYearError: string = null;
  daysPerWeekError: string = null;
  shiftsPerDayError: string = null;
  hoursPerShiftError: string = null;
  hoursPerYearError: string = null;
  isCalculated: boolean = true;
  constructor(private compareService: CompareService, private ssmtService: SsmtService) { }

  ngOnInit() {
    let isCalculateCheck: number = this.form.controls.hoursPerShift.value * this.form.controls.shiftsPerDay.value * this.form.controls.daysPerWeek.value * this.form.controls.weeksPerYear.value;
    if(isCalculateCheck == this.form.controls.hoursPerYear.value){
      this.isCalculated = true;
    }
  }

  save() {
    this.emitSave.emit(true);
  }

  calculatHrsPerYear() {
    let timeCheck = this.form.controls.shiftsPerDay.value * this.form.controls.hoursPerShift.value;
    if (timeCheck > 24) {
      this.timeError = "You have exceeded 24 hours/day  " + " " + "(" + timeCheck.toFixed(2) + " " + "hours/day)" + " " + "Adjust your inputs for Shifts/Day and Hours/Shift.";
    } else {
      this.timeError = null;
    }
    if (this.form.controls.weeksPerYear.value > 52 || this.form.controls.weeksPerYear.value <= 0) {
      this.weeksPerYearError = "The number of weeks/year must me greater than 0 and equal or less than 52";
    } else {
      this.weeksPerYearError = null;
    }
    if (this.form.controls.daysPerWeek.value > 7 || this.form.controls.daysPerWeek.value <= 0) {
      this.daysPerWeekError = "The number of days/week must be greater than 0 and equal or less than 7";
    } else {
      this.daysPerWeekError = null;
    }
    if (this.form.controls.shiftsPerDay.value <= 0) {
      this.shiftsPerDayError = "Number of shifts/day must be greater than 0";
    } else {
      this.shiftsPerDayError = null;
    }
    if (this.form.controls.hoursPerShift.value > 24 || this.form.controls.hoursPerShift.value <= 0) {
      this.hoursPerShiftError = "Number of hours/shift must be greater then 0 and equal or less than 24 ";
    } else {
      this.hoursPerShiftError = null;
    }

    this.isCalculated = true;
    this.form.controls.hoursPerYear.setValue(
      this.form.controls.hoursPerShift.value *
      this.form.controls.shiftsPerDay.value *
      this.form.controls.daysPerWeek.value *
      this.form.controls.weeksPerYear.value);
    if (this.form.controls.hoursPerYear.value > 8760) {
      this.hoursPerYearError = "Number of hours/year is greater than hours in a year.";
    } else {
      this.hoursPerYearError = null;
    }
    this.save();
    // this.operatingHours.hoursPerYear = this.operatingHours.hoursPerYear.toFixed(0);
  }

  setNotCalculated() {
    this.isCalculated = false;
    this.save();
  }

  addShift() {
    this.form.controls.shiftsPerDay.setValue(this.form.controls.shiftsPerDay.value + 1);
    this.calculatHrsPerYear();
  }

  subtractShift() {
    this.form.controls.shiftsPerDay.setValue(this.form.controls.shiftsPerDay.value - 1);
    this.calculatHrsPerYear();
  }
  subtractShiftHr() {
    this.form.controls.hoursPerShift.setValue(this.form.controls.hoursPerShift.value - 1);
    this.calculatHrsPerYear();
  }
  addShiftHr() {
    this.form.controls.hoursPerShift.setValue(this.form.controls.hoursPerShift.value + 1);
    this.calculatHrsPerYear();
  }

  subtractWeekDay() {
    this.form.controls.daysPerWeek.setValue(this.form.controls.daysPerWeek.value - 1);
    this.calculatHrsPerYear();
  }
  addWeekDay() {
    this.form.controls.daysPerWeek.setValue(this.form.controls.daysPerWeek.value + 1);
    this.calculatHrsPerYear();
  }

  addWeek() {
    this.form.controls.weeksPerYear.setValue(this.form.controls.weeksPerYear.value + 1);
    this.calculatHrsPerYear();
  }

  subtractWeek() {
    this.form.controls.weeksPerYear.setValue(this.form.controls.weeksPerYear.value - 1);
    this.calculatHrsPerYear();
  }

  canCompare() {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isHoursPerYearDifferent() {
    if (this.canCompare()) {
      return this.compareService.isHoursPerYearDifferent();
    } else {
      return false;
    }
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
