import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuxiliaryPowerLoss } from '../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuxiliaryPowerLossesService {
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
      motorPhase: ['', Validators.required],
      supplyVoltage: ['', Validators.required],
      avgCurrent: ['', Validators.required],
      powerFactor: ['', Validators.required],
      operatingTime: ['', Validators.required],
      name: ['Loss #'+lossNum]
    })
  }

  getLossFromForm(form: FormGroup): AuxiliaryPowerLoss {
    let tmpLoss: AuxiliaryPowerLoss = {
      motorPhase: form.controls.motorPhase.value,
      supplyVoltage: form.controls.supplyVoltage.value,
      avgCurrent: form.controls.avgCurrent.value,
      powerFactor: form.controls.powerFactor.value,
      operatingTime: form.controls.operatingTime.value,
      name: form.controls.name.value
    }
    return tmpLoss;
  }

  getFormFromLoss(loss: AuxiliaryPowerLoss): FormGroup {
    return this.formBuilder.group({
      motorPhase: [loss.motorPhase, Validators.required],
      supplyVoltage: [loss.supplyVoltage, Validators.required],
      avgCurrent: [loss.avgCurrent, Validators.required],
      powerFactor: [loss.powerFactor, Validators.required],
      operatingTime: [loss.operatingTime, Validators.required],
      name: [loss.name]
    })
  }

}
