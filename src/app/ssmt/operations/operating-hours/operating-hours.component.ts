import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OperatingHours } from '../../../shared/models/operations';
import { CompareService } from '../../compare.service';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-operating-hours',
  templateUrl: './operating-hours.component.html',
  styleUrls: ['./operating-hours.component.css']
})
export class OperatingHoursComponent implements OnInit {
  @Input()
  operatingHours: OperatingHours;
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
  constructor(private compareService: CompareService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (!this.operatingHours) {
      let defaultHours: OperatingHours = {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: Infinity,
        hoursPerShift: 8,
        hoursPerYear: 8736
      }
      this.operatingHours = defaultHours;
      this.calculatHrsPerYear();
    } else if (!this.operatingHours.hoursPerYear) {
      this.calculatHrsPerYear();
    }
  }

  save(){
    this.emitSave.emit(true);
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

    this.operatingHours.isCalculated = true;
    this.operatingHours.hoursPerYear = this.operatingHours.hoursPerShift * this.operatingHours.shiftsPerDay * this.operatingHours.daysPerWeek * this.operatingHours.weeksPerYear;
    if(this.operatingHours.hoursPerYear > 8760){
      this.hoursPerYearError = "Number of hours/year is greater than hours in a year."
    }else{
      this.hoursPerYearError = null;
    }
    this.save();
    // this.operatingHours.hoursPerYear = this.operatingHours.hoursPerYear.toFixed(0);
  }

  setNotCalculated() {
    this.operatingHours.isCalculated = false;
    this.save();
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

  canCompare() {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isHoursPerYearDifferent(){
    if (this.canCompare()) {
      return this.compareService.isHoursPerYearDifferent();
    } else {
      return false;
    }
  }

  focusField(str: string){
    this.ssmtService.currentField.next(str);
  }
  
  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
