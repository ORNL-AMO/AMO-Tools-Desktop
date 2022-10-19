import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { AuxiliaryPowerLoss } from '../../../shared/models/phast/losses/auxiliaryPowerLoss';

@Injectable()
export class AuxiliaryPowerLossesService {

  constructor(private formBuilder: UntypedFormBuilder) {
  }

  initForm(lossNum: number): UntypedFormGroup {
    return this.formBuilder.group({
      motorPhase: ['', Validators.required],
      supplyVoltage: ['', Validators.required],
      avgCurrent: ['', Validators.required],
      powerFactor: ['', Validators.required],
      operatingTime: ['', Validators.required],
      name: ['Loss #' + lossNum]
    });
  }

  getLossFromForm(form: UntypedFormGroup): AuxiliaryPowerLoss {
    let tmpLoss: AuxiliaryPowerLoss = {
      motorPhase: form.controls.motorPhase.value,
      supplyVoltage: form.controls.supplyVoltage.value,
      avgCurrent: form.controls.avgCurrent.value,
      powerFactor: form.controls.powerFactor.value,
      operatingTime: form.controls.operatingTime.value,
      name: form.controls.name.value
    };
    return tmpLoss;
  }

  getFormFromLoss(loss: AuxiliaryPowerLoss): UntypedFormGroup {
    return this.formBuilder.group({
      motorPhase: [loss.motorPhase, Validators.required],
      supplyVoltage: [loss.supplyVoltage, Validators.required],
      avgCurrent: [loss.avgCurrent, Validators.required],
      powerFactor: [loss.powerFactor, Validators.required],
      operatingTime: [loss.operatingTime, Validators.required],
      name: [loss.name]
    });
  }

  checkWarnings(loss: AuxiliaryPowerLoss): string {
    if (loss.supplyVoltage < 0) {
      return 'Supply Voltage should be greater than 0 V';
    } else if (loss.supplyVoltage > 480) {
      return 'Supply Voltage should be less than 480 V';
    } else {
      return null;
    }
  }

}
