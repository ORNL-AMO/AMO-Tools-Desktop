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
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'flowRate': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
    });
  }

  //get form from object
  getAtmosphereForm(loss: AtmosphereLoss) {
    return this.formBuilder.group({
      'atmosphereGas': [loss.atmosphereGas, Validators.required],
      'specificHeat': [loss.specificHeat, Validators.required],
      'inletTemp': [loss.inletTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'flowRate': [loss.flowRate, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required]
    });
  }

  getLossFromForm(form: any): AtmosphereLoss {
    let tmpLoss: AtmosphereLoss = {
      atmosphereGas: form.value.atmosphereGas,
      specificHeat: form.value.specificHeat,
      inletTemperature: form.value.inletTemp,
      outletTemperature: form.value.outletTemp,
      flowRate: form.value.flowRate,
      correctionFactor: form.value.correctionFactor
    }
    return tmpLoss;
  }
}
