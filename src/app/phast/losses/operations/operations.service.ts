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
      hoursPerYear: [phast.operatingHours.hoursPerYear, Validators.required],
      fuelCost: [phast.operatingCosts.fuelCost, Validators.required],
      steamCost: [phast.operatingCosts.steamCost, Validators.required],
      electricityCost: [phast.operatingCosts.electricityCost, Validators.required],
      implementationCost: [phast.implementationCost]
    });
    return form;
  }

  getOperatingDataFromForm(form: FormGroup): { costs: OperatingCosts, hours: OperatingHours } {
    let costs: OperatingCosts = {
      electricityCost: form.controls.electricityCost.value,
      steamCost: form.controls.steamCost.value,
      fuelCost: form.controls.fuelCost.value
    };
    let hours: OperatingHours = {
      hoursPerYear: form.controls.hoursPerYear.value,
    };
    return {
      costs: costs,
      hours: hours
    };
  }

  checkWarnings(hours: OperatingHours): OperationsWarnings {
    return {
      hoursPerYearWarning: this.checkHoursPerYear(hours)
    };
  }
  
  checkHoursPerYear(hours: OperatingHours): string {
    if (hours.hoursPerYear > 8760) {
      return "Number of hours/year is greater than hours in a year.";
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
  hoursPerYearWarning: string;
}
