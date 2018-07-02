import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';

@Injectable()
export class EnergyInputService {

  constructor(private formBuilder: FormBuilder) {
  }
  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      naturalGasHeatInput: ['', Validators.required],
      flowRateInput: [''],
      coalCarbonInjection: ['', Validators.required],
      coalHeatingValue: ['', Validators.required],
      electrodeUse: ['', Validators.required],
      electrodeHeatingValue: ['', Validators.required],
      otherFuels: ['', Validators.required],
      electricityInput: ['', Validators.required],
      name: ['Loss #'+lossNum]
    })
  }

  getLossFromForm(form: FormGroup): EnergyInputEAF {
    let tmpEnergyInput: EnergyInputEAF = {
      naturalGasHeatInput: form.controls.naturalGasHeatInput.value,
      flowRateInput: form.controls.flowRateInput.value,
      coalCarbonInjection: form.controls.coalCarbonInjection.value,
      coalHeatingValue: form.controls.coalHeatingValue.value,
      electrodeUse: form.controls.electrodeUse.value,
      electrodeHeatingValue: form.controls.electrodeHeatingValue.value,
      otherFuels: form.controls.otherFuels.value,
      electricityInput: form.controls.electricityInput.value,
      name: form.controls.name.value
    }
    return tmpEnergyInput;
  }

  getFormFromLoss(loss: EnergyInputEAF): FormGroup {
    return this.formBuilder.group({
      naturalGasHeatInput: [loss.naturalGasHeatInput, Validators.required],
      flowRateInput: [loss.flowRateInput],
      coalCarbonInjection: [loss.coalCarbonInjection, Validators.required],
      coalHeatingValue: [loss.coalHeatingValue, Validators.required],
      electrodeUse: [loss.electrodeUse, Validators.required],
      electrodeHeatingValue: [loss.electrodeHeatingValue, Validators.required],
      otherFuels: [loss.otherFuels, Validators.required],
      electricityInput: [loss.electricityInput, Validators.required],
      name: [loss.name]
    })
  }
}
