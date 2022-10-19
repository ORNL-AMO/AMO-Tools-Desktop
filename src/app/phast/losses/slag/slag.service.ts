import { Injectable } from '@angular/core';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
@Injectable()
export class SlagService {

  constructor(private formBuilder: UntypedFormBuilder) {
  }

  initForm(lossNum: number): UntypedFormGroup {
    return this.formBuilder.group({
      'weight': ['', Validators.required],
      'inletTemperature': ['', Validators.required],
      'outletTemperature': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'name': ['Loss #' + lossNum]
    });
  }

  getFormFromLoss(slag: Slag): UntypedFormGroup {
    return this.formBuilder.group({
      'weight': [slag.weight, Validators.required],
      'inletTemperature': [slag.inletTemperature, Validators.required],
      'outletTemperature': [slag.outletTemperature, Validators.required],
      'specificHeat': [slag.specificHeat, Validators.required],
      'correctionFactor': [slag.correctionFactor, Validators.required],
      'name': [slag.name]
    });
  }

  getLossFromForm(form: UntypedFormGroup): Slag {
    let tmpSlag: Slag = {
      weight: form.controls.weight.value,
      inletTemperature: form.controls.inletTemperature.value,
      outletTemperature: form.controls.outletTemperature.value,
      specificHeat: form.controls.specificHeat.value,
      correctionFactor: form.controls.correctionFactor.value,
      name: form.controls.name.value
    };
    return tmpSlag;
  }
}
