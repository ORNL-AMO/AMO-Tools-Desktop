import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WallLoss } from '../../../models/wall-loss';

export type WallLossForm = FormGroup<{
  surfaceArea: FormControl<number | null>;
  avgSurfaceTemp: FormControl<number | null>;
  ambientTemp: FormControl<number | null>;
  windVelocity: FormControl<number | null>;
  surfaceShape: FormControl<number | null>;
  conditionFactor: FormControl<number | null>;
  surfaceEmissivity: FormControl<number | null>;
  correctionFactor: FormControl<number | null>;
}>;

/** Starting values for a new entry; a saved entry rebuilds from exactly what was saved so a cleared field stays invalid. */
export const NEW_WALL_LOSS: WallLoss = { windVelocity: 0, conditionFactor: 1.394, surfaceEmissivity: 0.9, correctionFactor: 1.0 };

@Injectable()
export class WallLossesFormService {
  private readonly fb = inject(FormBuilder);

  getWallLossForm(wallLoss: WallLoss = NEW_WALL_LOSS): WallLossForm {
    const form: WallLossForm = this.fb.group({
      surfaceArea: [wallLoss.surfaceArea ?? null, [Validators.required, Validators.min(0)]],
      avgSurfaceTemp: [wallLoss.surfaceTemperature ?? null, Validators.required],
      ambientTemp: [wallLoss.ambientTemperature ?? null, Validators.required],
      windVelocity: [wallLoss.windVelocity ?? null, [Validators.required, Validators.min(0)]],
      surfaceShape: [wallLoss.surfaceShape ?? null, Validators.required],
      conditionFactor: [wallLoss.conditionFactor ?? null, Validators.required],
      surfaceEmissivity: [wallLoss.surfaceEmissivity ?? null, [Validators.required, Validators.min(0), Validators.max(1)]],
      correctionFactor: [wallLoss.correctionFactor ?? null, Validators.required],
    });
    return this.setSurfaceTempValidator(form);
  }

  buildWallLoss(form: WallLossForm): WallLoss {
    const values = form.getRawValue();
    return {
      surfaceArea: values.surfaceArea ?? undefined,
      surfaceTemperature: values.avgSurfaceTemp ?? undefined,
      ambientTemperature: values.ambientTemp ?? undefined,
      windVelocity: values.windVelocity ?? undefined,
      surfaceShape: values.surfaceShape ?? undefined,
      conditionFactor: values.conditionFactor ?? undefined,
      surfaceEmissivity: values.surfaceEmissivity ?? undefined,
      correctionFactor: values.correctionFactor ?? undefined,
    };
  }

  setSurfaceTempValidator(form: WallLossForm): WallLossForm {
    const ambientTemp = form.controls.ambientTemp.value;
    if (ambientTemp !== null) {
      form.controls.avgSurfaceTemp.setValidators([Validators.required, Validators.min(ambientTemp)]);
      form.controls.avgSurfaceTemp.markAsDirty();
      form.controls.avgSurfaceTemp.updateValueAndValidity({ emitEvent: false });
    }
    return form;
  }
}
