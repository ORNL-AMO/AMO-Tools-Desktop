import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PHAST } from '../models/phast';
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
    const costs = phast.operatingCosts;

    const form = this.formBuilder.group({
      hoursPerYear:    [phast.operatingHours?.hoursPerYear ?? null, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost:        [costs?.fuelCost        ?? null],
      steamCost:       [costs?.steamCost       ?? null],
      electricityCost: [costs?.electricityCost ?? null],
      coalCarbonCost:  [costs?.coalCarbonCost  ?? null],
      electrodeCost:   [costs?.electrodeCost   ?? null],
      otherFuelCost:   [costs?.otherFuelCost   ?? null],
    });
    this.applyConfigValidators(form, config);
    return form;
  }

  applyConfigValidators(form: FormGroup<OperationsForm>, config?: HeatingEquipmentConfiguration): void {
    const { isFuelBased, isSteam, isElectro, isEAF } = deriveHeatingSystemEnergyType(config);
    const requiredMin = [Validators.required, Validators.min(0)];

    form.controls.fuelCost.setValidators(isFuelBased ? requiredMin : []);
    form.controls.steamCost.setValidators(isSteam ? requiredMin : []);
    form.controls.electricityCost.setValidators(isElectro ? requiredMin : []);
    form.controls.coalCarbonCost.setValidators(isEAF ? requiredMin : []);
    form.controls.electrodeCost.setValidators(isEAF ? requiredMin : []);
    form.controls.otherFuelCost.setValidators(isEAF ? requiredMin : []);

    form.controls.fuelCost.updateValueAndValidity({ emitEvent: false });
    form.controls.steamCost.updateValueAndValidity({ emitEvent: false });
    form.controls.electricityCost.updateValueAndValidity({ emitEvent: false });
    form.controls.coalCarbonCost.updateValueAndValidity({ emitEvent: false });
    form.controls.electrodeCost.updateValueAndValidity({ emitEvent: false });
    form.controls.otherFuelCost.updateValueAndValidity({ emitEvent: false });
  }
}
