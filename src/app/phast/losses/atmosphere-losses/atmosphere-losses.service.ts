import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AtmosphereLoss } from '../../../shared/models/losses/atmosphereLoss';
@Injectable()
export class AtmosphereLossesService {

  constructor(private formBuilder: FormBuilder) { }

  //get empty atmosphere form
  initForm() {
    return this.formBuilder.group({
      'atmosphereGas': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'initialTemp': ['', Validators.required],
      'finalTemp': ['', Validators.required],
      'flowRate': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
    });
  }

  //get form from object
  getAtmosphereForm(loss: AtmosphereLoss) {
    return this.formBuilder.group({
      'atmosphereGas': [loss.atmosphereGas, Validators.required],
      'specificHeat': [loss.specificHeat, Validators.required],
      'initialTemp': [loss.initialTemperature, Validators.required],
      'finalTemp': [loss.finalTemperature, Validators.required],
      'flowRate': [loss.flowRate, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required]
    });
  }

  getLossFromForm(form: any): AtmosphereLoss {
    let tmpLoss: AtmosphereLoss = {
      atmosphereGas: form.value.atmosphereGas,
      specificHeat: form.value.specificHeat,
      initialTemperature: form.value.initialTemp,
      finalTemperature: form.value.finalTemp,
      flowRate: form.value.flowRate,
      correctionFactor: form.value.correctionFactor

    }
    return tmpLoss;
  }
}
