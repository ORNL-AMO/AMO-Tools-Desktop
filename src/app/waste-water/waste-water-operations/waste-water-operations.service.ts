import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WasteWaterOperations } from '../../shared/models/waste-water';

@Injectable()
export class WasteWaterOperationsService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: WasteWaterOperations): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      MaxDays: [obj.MaxDays, [Validators.required, Validators.min(0)]],
      operatingMonths: [obj.operatingMonths, [Validators.min(1), Validators.max(12)]],
      EnergyCostUnit: [obj.EnergyCostUnit, [Validators.required, Validators.min(0)]]
    });
    return form;
  }

  getObjFromForm(form: FormGroup): WasteWaterOperations{
    return {
      MaxDays: form.controls.MaxDays.value,
      operatingMonths: form.controls.operatingMonths.value,
      EnergyCostUnit: form.controls.EnergyCostUnit.value
    }
  }
}
