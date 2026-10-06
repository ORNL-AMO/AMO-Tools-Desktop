import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';

export type ExhaustGasForm = FormGroup<{
  offGasTemp: FormControl<number | null>;
  CO: FormControl<number | null>;
  H2: FormControl<number | null>;
  combustibleGases: FormControl<number | null>;
  vfr: FormControl<number | null>;
  dustLoading: FormControl<number | null>;
}>;

@Injectable()
export class ExhaustGasFormService {
  private readonly fb = inject(FormBuilder);

  getExhaustGasForm(loss: ExhaustGasEAF = {}): ExhaustGasForm {
    const percent = [Validators.required, Validators.min(0), Validators.max(100)];
    return this.fb.group({
      offGasTemp: [loss.offGasTemp ?? null, Validators.required],
      CO: [loss.CO ?? null, percent],
      H2: [loss.H2 ?? null, percent],
      combustibleGases: [loss.combustibleGases ?? null, percent],
      vfr: [loss.vfr ?? null, [Validators.required, Validators.min(0)]],
      dustLoading: [loss.dustLoading ?? null, [Validators.required, Validators.min(0)]],
    });
  }

  buildExhaustGas(form: ExhaustGasForm): ExhaustGasEAF {
    const values = form.getRawValue();
    return {
      offGasTemp: values.offGasTemp ?? undefined,
      CO: values.CO ?? undefined,
      H2: values.H2 ?? undefined,
      combustibleGases: values.combustibleGases ?? undefined,
      vfr: values.vfr ?? undefined,
      dustLoading: values.dustLoading ?? undefined,
      otherLosses: 0,
    };
  }
}
