import { Injectable } from '@angular/core';
import { ExhaustGasEAF } from '../../../shared/models/phast/losses/exhaustGasEAF';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';

@Injectable()
export class ExhaustGasService {

  constructor(private formBuilder: UntypedFormBuilder) {
  }

  initForm(lossNum: number): UntypedFormGroup {
    return this.formBuilder.group({
      'offGasTemp': ['', Validators.required],
      'CO': ['', Validators.required],
      'H2': ['', Validators.required],
      'combustibleGases': ['', Validators.required],
      'vfr': ['', Validators.required],
      'dustLoading': ['', Validators.required],
      'name': ['Loss #' + lossNum]
    });
  }

  getFormFromLoss(exhaustGas: ExhaustGasEAF): UntypedFormGroup {
    let tmpGroup = this.formBuilder.group({
      'offGasTemp': [exhaustGas.offGasTemp, Validators.required],
      'CO': [exhaustGas.CO, Validators.required],
      'H2': [exhaustGas.H2, Validators.required],
      'combustibleGases': [exhaustGas.combustibleGases, Validators.required],
      'vfr': [exhaustGas.vfr, Validators.required],
      'dustLoading': [exhaustGas.dustLoading, Validators.required],
      'name': exhaustGas.name
    });
    return tmpGroup;
  }

  getLossFromForm(form: UntypedFormGroup): ExhaustGasEAF {
    let tmpExhaustGas: ExhaustGasEAF = {
      offGasTemp: form.controls.offGasTemp.value,
      CO: form.controls.CO.value,
      H2: form.controls.H2.value,
      combustibleGases: form.controls.combustibleGases.value,
      vfr: form.controls.vfr.value,
      dustLoading: form.controls.dustLoading.value,
      otherLosses: 0.0,
      name: form.controls.name.value
    };
    return tmpExhaustGas;
  }
}
