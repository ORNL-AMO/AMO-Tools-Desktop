import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExtendedSurface } from '../../../models/extended-surface';

export type ExtendedSurfaceForm = FormGroup<{
  surfaceArea: FormControl<number | null>;
  avgSurfaceTemp: FormControl<number | null>;
  ambientTemp: FormControl<number | null>;
  surfaceEmissivity: FormControl<number | null>;
}>;

/** Starting values for a new entry; a saved entry rebuilds from exactly what was saved so a cleared field stays invalid. */
export const NEW_EXTENDED_SURFACE: ExtendedSurface = { surfaceEmissivity: 0.9 };

@Injectable()
export class ExtendedSurfaceFormService {
  private readonly fb = inject(FormBuilder);

  getExtendedSurfaceForm(extSurface: ExtendedSurface = NEW_EXTENDED_SURFACE): ExtendedSurfaceForm {
    return this.fb.group({
      surfaceArea: [extSurface.surfaceArea ?? null, [Validators.required, Validators.min(0)]],
      avgSurfaceTemp: [extSurface.surfaceTemperature ?? null, Validators.required],
      ambientTemp: [extSurface.ambientTemperature ?? null, Validators.required],
      surfaceEmissivity: [extSurface.surfaceEmissivity ?? null, [Validators.required, Validators.min(0), Validators.max(1)]],
    });
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
