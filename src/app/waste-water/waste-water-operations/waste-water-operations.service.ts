import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { WasteWaterOperations } from '../../shared/models/waste-water';

@Injectable()
export class WasteWaterOperationsService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: WasteWaterOperations): UntypedFormGroup{
    let form: UntypedFormGroup = this.formBuilder.group({
      MaxDays: [obj.MaxDays, [Validators.required, Validators.min(0)]],
      TimeIncrement: [obj.TimeIncrement, [Validators.required, Validators.min(0)]],
      operatingMonths: [obj.operatingMonths, [Validators.min(1), Validators.max(12)]],
      EnergyCostUnit: [obj.EnergyCostUnit, [Validators.required, Validators.min(0)]],
      implementationCosts: [obj.implementationCosts, [Validators.min(0)]]
    });
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): WasteWaterOperations{
    return {
      MaxDays: form.controls.MaxDays.value,
      TimeIncrement: form.controls.TimeIncrement.value,
      operatingMonths: form.controls.operatingMonths.value,
      EnergyCostUnit: form.controls.EnergyCostUnit.value,      
      implementationCosts: form.controls.implementationCosts.value
    }
  }
}
