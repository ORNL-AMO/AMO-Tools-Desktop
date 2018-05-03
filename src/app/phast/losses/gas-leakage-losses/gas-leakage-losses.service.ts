import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Losses } from '../../../shared/models/phast/phast';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
@Injectable()
export class GasLeakageLossesService {

  constructor(private formBuilder: FormBuilder) {
  }
  initForm(lossNum:number): FormGroup {
    return this.formBuilder.group({
      draftPressure: ['', Validators.required],
      openingArea: ['', Validators.required],
      leakageGasTemperature: ['', Validators.required],
      ambientTemperature: ['', Validators.required],
      coefficient: [.8052, Validators.required],
      specificGravity: [1.0, Validators.required],
      correctionFactor: [1.0, Validators.required],
      name: ['Loss #'+lossNum]
    })
  }

  initFormFromLoss(loss: LeakageLoss): FormGroup {
    return this.formBuilder.group({
      draftPressure: [loss.draftPressure, Validators.required],
      openingArea: [loss.openingArea, Validators.required],
      leakageGasTemperature: [loss.leakageGasTemperature, Validators.required],
      ambientTemperature: [loss.ambientTemperature, Validators.required],
      coefficient: [loss.coefficient, Validators.required],
      specificGravity: [loss.specificGravity, Validators.required],
      correctionFactor: [loss.correctionFactor, Validators.required],
      name: [loss.name]
    })
  }

  initLossFromForm(form: FormGroup): LeakageLoss {
    let tmpLoss: LeakageLoss = {
      draftPressure: form.controls.draftPressure.value,
      openingArea: form.controls.openingArea.value,
      leakageGasTemperature: form.controls.leakageGasTemperature.value,
      ambientTemperature: form.controls.ambientTemperature.value,
      coefficient: form.controls.coefficient.value,
      specificGravity: form.controls.specificGravity.value,
      correctionFactor: form.controls.correctionFactor.value,
      name: form.controls.name.value
    }
    return tmpLoss;
  }


}
