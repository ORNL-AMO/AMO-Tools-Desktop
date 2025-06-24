import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ProcessCoolingSystemBasics } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class SystemBasicsFormService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: ProcessCoolingSystemBasics): UntypedFormGroup{
    return this.formBuilder.group({
      'utilityType': [obj.utilityType, Validators.required],
      'electricityCost': [obj.electricityCost, [Validators.required, Validators.min(0)]],
      'fuelCost': [obj.fuelCost, [Validators.required, Validators.min(0)]],
      'location': [obj.location, Validators.required],
      'numberOfChillers': [obj.numberOfChillers, Validators.required],
      'waterSupplyTemperature': [obj.waterSupplyTemperature, Validators.required],
      'condenserCoolingMethod': [obj.condenserCoolingMethod, Validators.required],
      'notes': [obj.notes]
    });
  }

  getObjFromForm(form: UntypedFormGroup): ProcessCoolingSystemBasics {
    return {
      utilityType: form.controls.utilityType.value,
      electricityCost: form.controls.electricityCost.value,
      fuelCost: form.controls.fuelCost.value,
      notes: form.controls.notes.value,
      location: form.controls.location.value,
      numberOfChillers: form.controls.numberOfChillers.value,
      waterSupplyTemperature: form.controls.waterSupplyTemperature.value,
      condenserCoolingMethod: form.controls.condenserCoolingMethod.value,
    }
  }
}
