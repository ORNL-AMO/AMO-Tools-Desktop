import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class OperationsService {

  constructor(private formBuilder: FormBuilder) { }

  initForm(phast: PHAST) {
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

}
