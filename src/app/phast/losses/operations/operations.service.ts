import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { PHAST } from '../../../shared/models/phast/phast';
import { OperatingCosts, OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class OperationsService {

  modalOpen: BehaviorSubject<boolean>;
  constructor(private formBuilder: FormBuilder) { 
    this.modalOpen = new BehaviorSubject<boolean>(false);

  }

  initForm(phast: PHAST, settings: Settings): FormGroup {
    let form = this.formBuilder.group({
      hoursPerYear: [phast.operatingHours.hoursPerYear, Validators.required],
      fuelCost: [phast.operatingCosts.fuelCost, Validators.required],
      coalCarbonCost: [phast.operatingCosts.coalCarbonCost],
      electrodeCost: [phast.operatingCosts.electrodeCost],
      otherFuelCost: [phast.operatingCosts.otherFuelCost],
      steamCost: [phast.operatingCosts.steamCost, Validators.required],
      electricityCost: [phast.operatingCosts.electricityCost, Validators.required],
      implementationCost: [phast.implementationCost]
    });

    if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
      form.controls.coalCarbonCost.setValidators([Validators.required]);
      form.controls.coalCarbonCost.markAsDirty();
      form.controls.coalCarbonCost.updateValueAndValidity();

      form.controls.electrodeCost.setValidators([Validators.required]);
      form.controls.electrodeCost.markAsDirty();
      form.controls.electrodeCost.updateValueAndValidity();
      
      form.controls.otherFuelCost.setValidators([Validators.required]);
      form.controls.otherFuelCost.markAsDirty();
      form.controls.otherFuelCost.updateValueAndValidity();
    }
    return form;
  }

  getOperatingDataFromForm(form: FormGroup): { costs: OperatingCosts, hours: OperatingHours } {
    let costs: OperatingCosts = {
      electricityCost: form.controls.electricityCost.value,
      steamCost: form.controls.steamCost.value,
      fuelCost: form.controls.fuelCost.value,
      coalCarbonCost: form.controls.coalCarbonCost.value,
      electrodeCost: form.controls.electrodeCost.value,
      otherFuelCost: form.controls.otherFuelCost.value,
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
