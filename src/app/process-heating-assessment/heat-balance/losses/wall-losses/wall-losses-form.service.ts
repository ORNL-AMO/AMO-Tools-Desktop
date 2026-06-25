import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';

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

@Injectable()
export class WallLossesFormService {
  private readonly fb = inject(FormBuilder);

  initWallLossForm(lossNumber: number = 1): WallLossForm {
    return this.fb.group({
      surfaceArea: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      avgSurfaceTemp: new FormControl<number | null>(null, Validators.required),
      ambientTemp: new FormControl<number | null>(null, Validators.required),
      windVelocity: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      surfaceShape: new FormControl<number | null>(null, Validators.required),
      conditionFactor: new FormControl<number | null>(1.394, Validators.required),
      surfaceEmissivity: new FormControl<number | null>(0.9, [Validators.required, Validators.min(0), Validators.max(1)]),
      correctionFactor: new FormControl<number | null>(1.0, Validators.required),
    }) as WallLossForm;
  }

  getWallLossForm(wallLoss: WallLoss): WallLossForm {
    const form = this.fb.group({
      surfaceArea: new FormControl<number | null>(wallLoss.surfaceArea ?? null, [Validators.required, Validators.min(0)]),
      avgSurfaceTemp: new FormControl<number | null>(wallLoss.surfaceTemperature ?? null, Validators.required),
      ambientTemp: new FormControl<number | null>(wallLoss.ambientTemperature ?? null, Validators.required),
      windVelocity: new FormControl<number | null>(wallLoss.windVelocity ?? 0, [Validators.required, Validators.min(0)]),
      surfaceShape: new FormControl<number | null>(wallLoss.surfaceShape ?? null, Validators.required),
      conditionFactor: new FormControl<number | null>(wallLoss.conditionFactor ?? 1.394, Validators.required),
      surfaceEmissivity: new FormControl<number | null>(wallLoss.surfaceEmissivity ?? 0.9, [Validators.required, Validators.min(0), Validators.max(1)]),
      correctionFactor: new FormControl<number | null>(wallLoss.correctionFactor ?? 1.0, Validators.required),
    }) as WallLossForm;
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
