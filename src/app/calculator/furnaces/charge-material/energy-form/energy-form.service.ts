import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnergyData } from '../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class EnergyFormService {

  constructor(private formBuilder: FormBuilder) { }
  
  initEnergyForm(): FormGroup {
    let formGroup = this.formBuilder.group({
      'energySourceType': ['Fuel'],
      'hoursPerYear': [8760,  [Validators.required, Validators.min(0), Validators.max(8760)]],
      'fuelCost': ['', Validators.required],
      'availableHeat': [100, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]],
    });
    return formGroup;
  }

  getEnergyForm(energyData: EnergyData): FormGroup {
    let formGroup = this.formBuilder.group({
      'energySourceType': [energyData.energySourceType],
      'hoursPerYear': [energyData.hoursPerYear,  [Validators.required, Validators.min(0), Validators.max(8760)]],
      'fuelCost': [energyData.fuelCost, Validators.required],
      'availableHeat': [energyData.availableHeat, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]],
    });
    return formGroup;
  }

  buildEnergyData(energyForm: FormGroup): EnergyData {
    let energyData: EnergyData = {
      energySourceType: energyForm.controls.energySourceType.value,
      hoursPerYear: energyForm.controls.hoursPerYear.value,
      fuelCost: energyForm.controls.fuelCost.value,
      availableHeat: energyForm.controls.availableHeat.value
    }
    return energyData;
  }
}
