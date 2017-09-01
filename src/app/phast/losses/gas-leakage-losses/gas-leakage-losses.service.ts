import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Losses } from '../../../shared/models/phast/phast';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class GasLeakageLossesService {

  deleteLossIndex: BehaviorSubject<number>;
  addLossBaselineMonitor: BehaviorSubject<any>;
  addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  addLoss(bool: boolean) {
    if (bool) {
      this.addLossModificationMonitor.next(true);
    } else {
      this.addLossBaselineMonitor.next(true);
    }
  }

  initForm() {
    return this.formBuilder.group({
      draftPressure: ['', Validators.required],
      openingArea: ['', Validators.required],
      leakageGasTemperature: ['', Validators.required],
      ambientTemperature: ['', Validators.required],
      coefficient: [.8052, Validators.required],
      specificGravity: ['', Validators.required],
      correctionFactor: [1.0, Validators.required]
    })
  }

  initFormFromLoss(loss: LeakageLoss) {
    return this.formBuilder.group({
      draftPressure: [loss.draftPressure, Validators.required],
      openingArea: [loss.openingArea, Validators.required],
      leakageGasTemperature: [loss.leakageGasTemperature, Validators.required],
      ambientTemperature: [loss.ambientTemperature, Validators.required],
      coefficient: [loss.coefficient, Validators.required],
      specificGravity: [loss.specificGravity, Validators.required],
      correctionFactor: [loss.correctionFactor, Validators.required]
    })
  }

  initLossFromForm(form: any): LeakageLoss {
    let tmpLoss: LeakageLoss = {
      draftPressure: form.value.draftPressure,
      openingArea: form.value.openingArea,
      leakageGasTemperature: form.value.leakageGasTemperature,
      ambientTemperature: form.value.ambientTemperature,
      coefficient: form.value.coefficient,
      specificGravity: form.value.specificGravity,
      correctionFactor: form.value.correctionFactor
    }
    return tmpLoss;
  }


}
