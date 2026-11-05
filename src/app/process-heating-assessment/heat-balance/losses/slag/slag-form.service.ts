import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Slag } from '../../../../shared/models/phast/losses/slag';

export type SlagForm = FormGroup<{
  weight: FormControl<number | null>;
  inletTemperature: FormControl<number | null>;
  outletTemperature: FormControl<number | null>;
  specificHeat: FormControl<number | null>;
  correctionFactor: FormControl<number | null>;
}>;

/** Starting values for a new entry; a saved entry rebuilds from exactly what was saved so a cleared field stays invalid. */
export const NEW_SLAG_LOSS: Slag = { correctionFactor: 1 };

@Injectable()
export class SlagFormService {
  private readonly fb = inject(FormBuilder);

  getSlagForm(loss: Slag = NEW_SLAG_LOSS): SlagForm {
    return this.fb.group({
      weight: [loss.weight ?? null, [Validators.required, Validators.min(0)]],
      inletTemperature: [loss.inletTemperature ?? null, Validators.required],
      outletTemperature: [loss.outletTemperature ?? null, Validators.required],
      specificHeat: [loss.specificHeat ?? null, [Validators.required, Validators.min(0)]],
      correctionFactor: [loss.correctionFactor ?? null, [Validators.required, Validators.min(0)]],
    });
  }

  buildSlag(form: SlagForm): Slag {
    const values = form.getRawValue();
    return {
      weight: values.weight ?? undefined,
      inletTemperature: values.inletTemperature ?? undefined,
      outletTemperature: values.outletTemperature ?? undefined,
      specificHeat: values.specificHeat ?? undefined,
      correctionFactor: values.correctionFactor ?? undefined,
    };
  }
}
