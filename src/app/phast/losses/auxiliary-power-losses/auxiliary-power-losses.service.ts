import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuxiliaryPowerLoss } from '../../../shared/models/losses/auxiliaryPowerLoss';

@Injectable()
export class AuxiliaryPowerLossesService {

  constructor(private formBuilder: FormBuilder) { }

  initForm() {
    return this.formBuilder.group({
      motorPhase: ['', Validators.required],
      supplyVoltage: ['', Validators.required],
      avgCurrent: ['', Validators.required],
      powerFactor: ['', Validators.required],
      operatingTime: ['', Validators.required],
    })
  }

  getLossFromForm(form: any): AuxiliaryPowerLoss {
    let tmpLoss: AuxiliaryPowerLoss = {
      motorPhase: form.value.motorPhase,
      supplyVoltage: form.value.supplyVoltage,
      avgCurrent: form.value.avgCurrent,
      powerFactor: form.value.powerFactor,
      operatingTime: form.value.operatingTime,
    }
    return tmpLoss;
  }

  getFormFromLoss(loss: AuxiliaryPowerLoss) {
    return this.formBuilder.group({
      motorPhase: [loss.motorPhase, Validators.required],
      supplyVoltage: [loss.supplyVoltage, Validators.required],
      avgCurrent: [loss.avgCurrent, Validators.required],
      powerFactor: [loss.powerFactor, Validators.required],
      operatingTime: [loss.operatingTime, Validators.required],
    })
  }

}
