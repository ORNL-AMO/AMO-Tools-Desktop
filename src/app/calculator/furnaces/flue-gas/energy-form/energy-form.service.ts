import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnergyData } from '../../../../shared/models/phast/losses/chargeMaterial';

@Injectable({
  providedIn: 'root'
})
export class EnergyFormService {
  
  constructor(private formBuilder: FormBuilder) { }
  
  initEnergyForm(): FormGroup {
    let formGroup = this.formBuilder.group({
      'hoursPerYear': [8760,  [Validators.required, Validators.min(0), Validators.max(8760)]],
      'fuelCost': ['', Validators.required],
    });
    return formGroup;
  }

  getEnergyForm(energyData: EnergyData): FormGroup {
    let formGroup = this.formBuilder.group({
      'hoursPerYear': [energyData.hoursPerYear,  [Validators.required, Validators.min(0), Validators.max(8760)]],
      'fuelCost': [energyData.fuelCost, Validators.required],
    });
    return formGroup;
  }

  buildEnergyData(energyForm: FormGroup): EnergyData {
    let energyData: EnergyData = {
      hoursPerYear: energyForm.controls.hoursPerYear.value,
      fuelCost: energyForm.controls.fuelCost.value,
    }
    return energyData;
  }
}
