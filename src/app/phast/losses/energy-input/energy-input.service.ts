import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class EnergyInputService {

  deleteLossIndex: BehaviorSubject<number>;
  // addLossBaselineMonitor: BehaviorSubject<any>;
  // addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    // this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    // this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  // addLoss(bool: boolean) {
  //   if (bool) {
  //     this.addLossModificationMonitor.next(true);
  //   } else {
  //     this.addLossBaselineMonitor.next(true);
  //   }
  // }
  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      naturalGasHeatInput: ['', Validators.required],
      flowRateInput: [''],
     // naturalGasFlow: ['', Validators.required],
     // measuredOxygenFlow: ['', Validators.required],
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
     // naturalGasFlow: form.controls.naturalGasFlow.value,
     // measuredOxygenFlow: form.controls.measuredOxygenFlow.value,
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
     // naturalGasFlow: [loss.naturalGasFlow, Validators.required],
     // measuredOxygenFlow: [loss.measuredOxygenFlow, Validators.required],
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
