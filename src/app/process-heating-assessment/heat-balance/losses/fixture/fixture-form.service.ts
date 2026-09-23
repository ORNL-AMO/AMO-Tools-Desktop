import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';

export type FixtureForm = FormGroup<{
  materialId: FormControl<number | null>;
  specificHeat: FormControl<number | null>;
  feedRate: FormControl<number | null>;
  initialTemp: FormControl<number | null>;
  finalTemp: FormControl<number | null>;
  correctionFactor: FormControl<number | null>;
  // Not rendered: copied from the selected solid material so a deleted material can be rebuilt.
  latentHeat: FormControl<number | null>;
  meltingPoint: FormControl<number | null>;
  specificHeatLiquid: FormControl<number | null>;
}>;

@Injectable()
export class FixtureFormService {
  private readonly fb = inject(FormBuilder);

  getFixtureForm(loss: FixtureLoss = {}): FixtureForm {
    return this.fb.group({
      materialId: [loss.materialName ?? null, Validators.required],
      specificHeat: [loss.specificHeat ?? null, [Validators.required, Validators.min(0)]],
      feedRate: [loss.feedRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      initialTemp: [loss.initialTemperature ?? null, Validators.required],
      finalTemp: [loss.finalTemperature ?? null, Validators.required],
      correctionFactor: [loss.correctionFactor ?? 1.0, Validators.required],
      latentHeat: [loss.latentHeat ?? null],
      meltingPoint: [loss.meltingPoint ?? null],
      specificHeatLiquid: [loss.specificHeatLiquid ?? null],
    });
  }

  buildFixtureLoss(form: FixtureForm): FixtureLoss {
    const values = form.getRawValue();
    return {
      materialName: values.materialId ?? undefined,
      specificHeat: values.specificHeat ?? undefined,
      feedRate: values.feedRate ?? undefined,
      initialTemperature: values.initialTemp ?? undefined,
      finalTemperature: values.finalTemp ?? undefined,
      correctionFactor: values.correctionFactor ?? undefined,
      latentHeat: values.latentHeat ?? undefined,
      meltingPoint: values.meltingPoint ?? undefined,
      specificHeatLiquid: values.specificHeatLiquid ?? undefined,
    };
  }
}
