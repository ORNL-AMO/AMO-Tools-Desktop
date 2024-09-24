import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { WaterSystemBasics } from '../../shared/models/water-assessment';

@Injectable({
  providedIn: 'root'
})
export class SystemBasicsService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: WaterSystemBasics): UntypedFormGroup{
    let form: UntypedFormGroup = this.formBuilder.group({
      notes: [obj.notes],
      utilityType: [obj.utilityType],
      electricityCost: [obj.electricityCost],
      conductivityUnit: [obj.conductivityUnit],
    });
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): WaterSystemBasics {
    return {    
      notes: form.controls.notes.value,
      electricityCost: form.controls.electricityCost.value,
      utilityType: form.controls.utilityType.value,
      conductivityUnit: form.controls.conductivityUnit.value,
    }
  }
}
