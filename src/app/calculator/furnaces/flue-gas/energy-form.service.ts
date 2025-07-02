import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { OpportunityUtilityType } from '../../../shared/models/treasure-hunt';

@Injectable()
export class EnergyFormService {

  constructor(private formBuilder: UntypedFormBuilder) {}

  initEnergyForm(): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'energySourceType': ['Fuel'],
      'utilityType': ['Natural Gas'],
      'hoursPerYear': [8760,  [Validators.required, Validators.min(0), Validators.max(8760)]],
      'fuelCost': ['', Validators.required],
      'availableHeat': [100, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]],
    });
    return formGroup;
  }

  getEnergyForm(energyData: FlueGasEnergyData): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'energySourceType': [energyData.energySourceType],
      'utilityType': [energyData.utilityType],
      'hoursPerYear': [energyData.hoursPerYear,  [Validators.required, Validators.min(0), Validators.max(8760)]],
      'fuelCost': [energyData.fuelCost, Validators.required],
      'availableHeat': [energyData.availableHeat, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]],
    });
    return formGroup;
  }

  buildEnergyData(energyForm: UntypedFormGroup): FlueGasEnergyData {
    let energyData: FlueGasEnergyData = {
      energySourceType: energyForm.controls.energySourceType.value,
      utilityType: energyForm.controls.utilityType.value,
      hoursPerYear: energyForm.controls.hoursPerYear.value,
      fuelCost: energyForm.controls.fuelCost.value,
      availableHeat: energyForm.controls.availableHeat.value
    }
    return energyData;
  }

}

export interface FlueGasEnergyData {
  energySourceType?: string;
  fuelCost?: number;
  utilityType?: OpportunityUtilityType;
  hoursPerYear?: number;
  availableHeat?: number;
}