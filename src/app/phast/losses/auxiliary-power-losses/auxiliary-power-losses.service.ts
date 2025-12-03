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
      supplyVoltage: ['', [Validators.required, Validators.min(0)]],
      avgCurrent: ['', [Validators.required, Validators.min(0)]],
      powerFactor: ['', [Validators.required, Validators.min(0), Validators.max(1)]],
      operatingTime: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      name: ['Loss #' + lossNum, Validators.required]
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
      supplyVoltage: [loss.supplyVoltage, [Validators.required, Validators.min(0)]],
      avgCurrent: [loss.avgCurrent, [Validators.required, Validators.min(0)]],
      powerFactor: [loss.powerFactor, [Validators.required, Validators.min(0), Validators.max(1)]],
      operatingTime: [loss.operatingTime, [Validators.required, Validators.min(0), Validators.max(100)]],
      name: [loss.name, Validators.required]
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
