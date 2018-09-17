import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { PHAST } from '../../../shared/models/phast/phast';
import { OperatingCosts, OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class OperationsService {

  constructor(private formBuilder: FormBuilder) { }

  initForm(phast: PHAST): FormGroup {
    let form = this.formBuilder.group({
      weeksPerYear: [phast.operatingHours.weeksPerYear],
      daysPerWeek: [phast.operatingHours.daysPerWeek],
      shiftsPerDay: [phast.operatingHours.shiftsPerDay],
      hoursPerShift: [phast.operatingHours.hoursPerShift],
      hoursPerYear: [phast.operatingHours.hoursPerYear, Validators.required],
      fuelCost: [phast.operatingCosts.fuelCost, Validators.required],
      steamCost: [phast.operatingCosts.steamCost, Validators.required],
      electricityCost: [phast.operatingCosts.electricityCost, Validators.required],
      implementationCost: [phast.implementationCost]
    })
    return form;
  }

  getOperatingDataFromForm(form: FormGroup): { costs: OperatingCosts, hours: OperatingHours } {
    let costs: OperatingCosts = {
      electricityCost: form.controls.electricityCost.value,
      steamCost: form.controls.steamCost.value,
      fuelCost: form.controls.fuelCost.value
    }
    let hours: OperatingHours = {
      hoursPerShift: form.controls.hoursPerShift.value,
      hoursPerYear: form.controls.hoursPerYear.value,
      shiftsPerDay: form.controls.shiftsPerDay.value,
      daysPerWeek: form.controls.daysPerWeek.value,
      weeksPerYear: form.controls.weeksPerYear.value,
    }
    return {
      costs: costs,
      hours: hours
    }
  }

  checkWarnings(hours: OperatingHours): OperationsWarnings {
    return{
      timeWarning: this.checkTotalTime(hours),
      weeksPerYearWarning: this.checkWeeksPerYear(hours),
      daysPerWeekWarning: this.checkDaysPerWeek(hours),
      shiftsPerDayWarning: this.checkShiftsPerDay(hours),
      hoursPerShiftWarning: this.checkHoursPerShift(hours),
      hoursPerYearWarning: this.checkHoursPerYear(hours)
    }
  }
  checkTotalTime(hours: OperatingHours): string {
    let timeCheck = hours.shiftsPerDay * hours.hoursPerShift;
    if (timeCheck > 24) {
      return "You have exceeded 24 hours/day  " + " " + "(" + timeCheck.toFixed(2) + " " + "hours/day)" + " " + "Adjust your inputs for Shifts/Day and Hours/Shift.";
    } else {
      return null;
    }
  }
  checkWeeksPerYear(hours: OperatingHours): string {
    if (hours.weeksPerYear > 52) {
      return "The number of weeks/year must be less than or equal to 52";
    } else if (hours.weeksPerYear <= 0) {
      return "The number of weeks/year must be greater than 0";
    }
    else {
      return null;
    }
  }
  checkDaysPerWeek(hours: OperatingHours): string {
    if (hours.daysPerWeek > 7 || hours.daysPerWeek <= 0) {
      return "The number of day/week must be less than or equal to 7";
    } else if (hours.daysPerWeek <= 0) {
      return "The number of day/week must be greater than 0";
    } else {
      return null;
    }
  }
  checkShiftsPerDay(hours: OperatingHours): string {
    if (hours.shiftsPerDay <= 0) {
      return "Number of shifts/day must be greater than 0";
    } else {
      return null;
    }
  }
  checkHoursPerShift(hours: OperatingHours): string {
    if (hours.hoursPerShift > 24 ){
      return "Number of hours/shift must be less than or equal to 24";
    }
    else if(hours.hoursPerShift <= 0) {
      return "Number of hours/shift must be greater then 0";
    } else {
      return null;
    }
  }
  checkHoursPerYear(hours: OperatingHours): string {
    if (hours.hoursPerYear > 8760) {
      return "Number of hours/year is greater than hours in a year."
    } else {
      return null;
    }
  }

  checkWarningsExist(warnings: OperationsWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
}


export interface OperationsWarnings {
  timeWarning: string;
  weeksPerYearWarning: string;
  daysPerWeekWarning: string;
  shiftsPerDayWarning: string;
  hoursPerShiftWarning: string;
  hoursPerYearWarning: string;
}