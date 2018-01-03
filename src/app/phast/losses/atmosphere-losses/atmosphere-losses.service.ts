import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AtmosphereLossesService {

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


  //get empty atmosphere form
  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'atmosphereGas': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'flowRate': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'name': ['Loss #'+lossNum]
    });
  }

  //get form from object
  getAtmosphereForm(loss: AtmosphereLoss): FormGroup {
    return this.formBuilder.group({
      'atmosphereGas': [loss.atmosphereGas, Validators.required],
      'specificHeat': [loss.specificHeat, Validators.required],
      'inletTemp': [loss.inletTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'flowRate': [loss.flowRate, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
      'name': [loss.name]
    });
  }

  getLossFromForm(form: FormGroup): AtmosphereLoss {
    let tmpLoss: AtmosphereLoss = {
      atmosphereGas: form.controls.atmosphereGas.value,
      specificHeat: form.controls.specificHeat.value,
      inletTemperature: form.controls.inletTemp.value,
      outletTemperature: form.controls.outletTemp.value,
      flowRate: form.controls.flowRate.value,
      correctionFactor: form.controls.correctionFactor.value,
      name: form.controls.name.value
    }
    return tmpLoss;
  }
}
