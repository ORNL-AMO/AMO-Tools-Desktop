import { Injectable } from '@angular/core';
import { Slag } from '../../../shared/models/losses/slag';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class SlagService {

  constructor(private formBuilder: FormBuilder) { }

  initForm() {
    return this.formBuilder.group({
      'weight': ['', Validators.required],
      'inletTemperature': ['', Validators.required],
      'outletTemperature': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'correctionFactor': ['', Validators.required]
    })
  }

  getFormFromLoss(slag: Slag) {
    return this.formBuilder.group({
      'weight': [slag.weight, Validators.required],
      'inletTemperature': [slag.inletTemperature, Validators.required],
      'outletTemperature': [slag.outletTemperature, Validators.required],
      'specificHeat': [slag.specificHeat, Validators.required],
      'correctionFactor': [slag.correctionFactor, Validators.required]
    })
  }

  getLossFromForm(form: any): Slag {
    let tmpSlag: Slag = {
      weight: form.value.weight,
      inletTemperature: form.value.inletTemperature,
      outletTemperature: form.value.outletTemperature,
      specificHeat: form.value.specificHeat,
      correctionFactor: form.value.correctionFactor
    }
    return tmpSlag;
  }
}
