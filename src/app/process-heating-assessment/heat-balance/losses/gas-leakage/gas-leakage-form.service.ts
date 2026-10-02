import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';

export type GasLeakageForm = FormGroup<{
  draftPressure: FormControl<number | null>;
  openingArea: FormControl<number | null>;
  leakageGasTemperature: FormControl<number | null>;
  ambientTemperature: FormControl<number | null>;
  coefficient: FormControl<number | null>;
  specificGravity: FormControl<number | null>;
  correctionFactor: FormControl<number | null>;
}>;

@Injectable()
export class GasLeakageFormService {
  private readonly fb = inject(FormBuilder);

  getGasLeakageForm(loss: LeakageLoss = {}): GasLeakageForm {
    return this.fb.group({
      draftPressure: [loss.draftPressure ?? null, [Validators.required, Validators.min(0)]],
      openingArea: [loss.openingArea ?? null, [Validators.required, Validators.min(0)]],
      leakageGasTemperature: [loss.leakageGasTemperature ?? null, Validators.required],
      ambientTemperature: [loss.ambientTemperature ?? null, Validators.required],
      coefficient: [loss.coefficient ?? 0.8052, Validators.required],
      specificGravity: [loss.specificGravity ?? 1, [Validators.required, Validators.min(0)]],
      correctionFactor: [loss.correctionFactor ?? 1, Validators.required],
    });
  }

  buildGasLeakageLoss(form: GasLeakageForm): LeakageLoss {
    const values = form.getRawValue();
    return {
      draftPressure: values.draftPressure ?? undefined,
      openingArea: values.openingArea ?? undefined,
      leakageGasTemperature: values.leakageGasTemperature ?? undefined,
      ambientTemperature: values.ambientTemperature ?? undefined,
      coefficient: values.coefficient ?? undefined,
      specificGravity: values.specificGravity ?? undefined,
      correctionFactor: values.correctionFactor ?? undefined,
    };
  }
}
