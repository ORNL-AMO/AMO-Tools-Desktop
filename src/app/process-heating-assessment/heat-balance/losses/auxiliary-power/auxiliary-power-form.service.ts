import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';

export type AuxiliaryPowerForm = FormGroup<{
  motorPhase: FormControl<number | null>;
  supplyVoltage: FormControl<number | null>;
  avgCurrent: FormControl<number | null>;
  powerFactor: FormControl<number | null>;
  operatingTime: FormControl<number | null>;
}>;

@Injectable()
export class AuxiliaryPowerFormService {
  private readonly fb = inject(FormBuilder);

  getAuxiliaryPowerForm(loss: AuxiliaryPowerLoss = {}): AuxiliaryPowerForm {
    return this.fb.group({
      motorPhase: [loss.motorPhase ?? null, Validators.required],
      supplyVoltage: [loss.supplyVoltage ?? null, [Validators.required, Validators.min(0)]],
      avgCurrent: [loss.avgCurrent ?? null, [Validators.required, Validators.min(0)]],
      powerFactor: [loss.powerFactor ?? null, [Validators.required, Validators.min(0), Validators.max(1)]],
      operatingTime: [loss.operatingTime ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  buildAuxiliaryPowerLoss(form: AuxiliaryPowerForm): AuxiliaryPowerLoss {
    const values = form.getRawValue();
    return {
      motorPhase: values.motorPhase ?? undefined,
      supplyVoltage: values.supplyVoltage ?? undefined,
      avgCurrent: values.avgCurrent ?? undefined,
      powerFactor: values.powerFactor ?? undefined,
      operatingTime: values.operatingTime ?? undefined,
    };
  }
}
