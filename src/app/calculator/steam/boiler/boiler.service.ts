import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoilerInput } from '../../../shared/models/steam';

@Injectable()
export class BoilerService {

  constructor(private formBuilder: FormBuilder) { }

  initForm(): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      deaeratorPressure: [10, Validators.required],
      combustionEfficiency: [10, Validators.required],
      blowdownRate: [2, Validators.required],
      steamPressure: [20, Validators.required],
      thermodynamicQuantity: [1, Validators.required],
      quantityValue: [2000, Validators.required],
      steamMassFlow: [45, Validators.required],
    })
    return form;
  }

  getObjFromForm(form: FormGroup): BoilerInput {
    let input: BoilerInput = {
      deaeratorPressure: form.controls.deaeratorPressure.value,
      combustionEfficiency: form.controls.combustionEfficiency.value,
      blowdownRate: form.controls.blowdownRate.value,
      steamPressure: form.controls.steamPressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      steamMassFlow: form.controls.steamMassFlow.value,
    }
    return input;
  }
}
