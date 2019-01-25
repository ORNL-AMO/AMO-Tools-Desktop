import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FSAT } from '../../../shared/models/fans';

@Injectable()
export class FanEfficiencyService {
  fanEfficiencyInputs: FanEfficiencyInputs;
  constructor(private formBuilder: FormBuilder) { }

  initForm(): FormGroup {
    return this.formBuilder.group({
      fanType: ['', Validators.required],
      fanSpeed: ['', [Validators.required, Validators.min(0)]],
      inletPressure: ['', Validators.required],
      outletPressure: ['', Validators.required],
      flowRate: ['', Validators.required],
      compressibility: ['', Validators.required]
    })
  }

  initFormFromFsat(fsat: FSAT): FormGroup {
    return this.formBuilder.group({
      fanType: ['', Validators.required],
      fanSpeed: ['', [Validators.required, Validators.min(0)]],
      inletPressure: ['', Validators.required],
      outletPressure: ['', Validators.required],
      flowRate: ['', Validators.required],
      compressibility: ['', Validators.required]
    })
  }

  initFormFromObj(obj: FanEfficiencyInputs): FormGroup {
    return this.formBuilder.group({
      fanType: [obj.fanType, Validators.required],
      fanSpeed: [obj.fanSpeed, [Validators.required, Validators.min(0)]],
      inletPressure: [obj.inletPressure, Validators.required],
      outletPressure: [obj.outletPressure, Validators.required],
      flowRate: [obj.flowRate, Validators.required],
      compressibility: [obj.compressibility, Validators.required]
    })
  }

  getObjFromForm(form: FormGroup): FanEfficiencyInputs {
    return {
      fanType: form.controls.fanType.value,
      fanSpeed: form.controls.fanSpeed.value,
      inletPressure: form.controls.inletPressure.value,
      outletPressure: form.controls.outletPressure.value,
      flowRate: form.controls.flowRate.value,
      compressibility: form.controls.compressibility.value
    }
  }
}


export interface FanEfficiencyInputs {
  fanType: number,
  fanSpeed: number,
  inletPressure: number,
  outletPressure: number,
  flowRate: number,
  compressibility: number
}