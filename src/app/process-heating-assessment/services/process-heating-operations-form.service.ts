import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PHAST } from '../../shared/models/phast/phast';

export interface OperationsForm {
  hoursPerYear: FormControl<number>;
  fuelCost: FormControl<number>;
  steamCost: FormControl<number>;
  electricityCost: FormControl<number>;
}

@Injectable()
export class ProcessHeatingOperationsFormService {
  private readonly formBuilder = inject(FormBuilder);

  getForm(phast: PHAST): FormGroup<OperationsForm> {
    return this.formBuilder.group({
      hoursPerYear: [phast.operatingHours?.hoursPerYear ?? null, [
        Validators.required,
        Validators.min(0),
        Validators.max(8760),
      ]],
      fuelCost: [phast.operatingCosts?.fuelCost ?? null, [
        Validators.required,
        Validators.min(0),
      ]],
      steamCost: [phast.operatingCosts?.steamCost ?? null, [
        Validators.required,
        Validators.min(0),
      ]],
      electricityCost: [phast.operatingCosts?.electricityCost ?? null, [
        Validators.required,
        Validators.min(0),
      ]],
    });
  }
}
