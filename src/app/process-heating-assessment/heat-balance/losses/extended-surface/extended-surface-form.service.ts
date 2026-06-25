import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExtendedSurface } from '../../../../shared/models/phast/losses/extendedSurface';

export type ExtendedSurfaceForm = FormGroup<{
  surfaceArea: FormControl<number | null>;
  avgSurfaceTemp: FormControl<number | null>;
  ambientTemp: FormControl<number | null>;
  surfaceEmissivity: FormControl<number | null>;
}>;

@Injectable()
export class ExtendedSurfaceFormService {
  private readonly fb = inject(FormBuilder);

  initExtendedSurfaceForm(): ExtendedSurfaceForm {
    return this.fb.group({
      surfaceArea: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      avgSurfaceTemp: new FormControl<number | null>(null, Validators.required),
      ambientTemp: new FormControl<number | null>(null, Validators.required),
      surfaceEmissivity: new FormControl<number | null>(0.9, [Validators.required, Validators.min(0), Validators.max(1)]),
    }) as ExtendedSurfaceForm;
  }

  getExtendedSurfaceForm(extSurface: ExtendedSurface): ExtendedSurfaceForm {
    return this.fb.group({
      surfaceArea: new FormControl<number | null>(extSurface.surfaceArea ?? null, [Validators.required, Validators.min(0)]),
      avgSurfaceTemp: new FormControl<number | null>(extSurface.surfaceTemperature ?? null, Validators.required),
      ambientTemp: new FormControl<number | null>(extSurface.ambientTemperature ?? null, Validators.required),
      surfaceEmissivity: new FormControl<number | null>(extSurface.surfaceEmissivity ?? 0.9, [Validators.required, Validators.min(0), Validators.max(1)]),
    }) as ExtendedSurfaceForm;
  }

  buildExtendedSurface(form: ExtendedSurfaceForm): ExtendedSurface {
    const values = form.getRawValue();
    return {
      surfaceArea: values.surfaceArea ?? undefined,
      surfaceTemperature: values.avgSurfaceTemp ?? undefined,
      ambientTemperature: values.ambientTemp ?? undefined,
      surfaceEmissivity: values.surfaceEmissivity ?? undefined,
    };
  }
}
