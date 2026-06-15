import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PHAST } from '../../shared/models/phast/phast';
import { HeatingEquipmentConfiguration } from '../models/views';
import { deriveHeatingSystemEnergyType } from './process-heating-assessment.service';

export interface OperationsForm {
  hoursPerYear: FormControl<number>;
  fuelCost: FormControl<number>;
  steamCost: FormControl<number>;
  electricityCost: FormControl<number>;
  coalCarbonCost: FormControl<number>;
  electrodeCost: FormControl<number>;
  otherFuelCost: FormControl<number>;
}

@Injectable()
export class ProcessHeatingOperationsFormService {
  private readonly formBuilder = inject(FormBuilder);

  getForm(phast: PHAST, config?: HeatingEquipmentConfiguration): FormGroup<OperationsForm> {
    const { isFuelBased, isSteam, isElectro, isEAF } = deriveHeatingSystemEnergyType(config);

    const costs = phast.operatingCosts;
    const requiredMin = [Validators.required, Validators.min(0)];

    return this.formBuilder.group({
      hoursPerYear:    [phast.operatingHours?.hoursPerYear ?? null, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost:        [costs?.fuelCost        ?? null, isFuelBased ? requiredMin : []],
      steamCost:       [costs?.steamCost       ?? null, isSteam     ? requiredMin : []],
      electricityCost: [costs?.electricityCost ?? null, isElectro   ? requiredMin : []],
      coalCarbonCost:  [costs?.coalCarbonCost  ?? null, isEAF       ? requiredMin : []],
      electrodeCost:   [costs?.electrodeCost   ?? null, isEAF       ? requiredMin : []],
      otherFuelCost:   [costs?.otherFuelCost   ?? null, isEAF       ? requiredMin : []],
    });
  }
}
