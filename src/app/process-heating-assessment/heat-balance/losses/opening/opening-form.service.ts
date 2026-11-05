import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';

export type OpeningForm = FormGroup<{
  numberOfOpenings: FormControl<number | null>;
  thickness: FormControl<number | null>;
  openingType: FormControl<string | null>;
  lengthOfOpening: FormControl<number | null>;
  heightOfOpening: FormControl<number | null>;
  viewFactor: FormControl<number | null>;
  insideTemperature: FormControl<number | null>;
  ambientTemperature: FormControl<number | null>;
  emissivity: FormControl<number | null>;
  percentTimeOpen: FormControl<number | null>;
}>;

/** Starting values for a new entry; a saved entry rebuilds from exactly what was saved so a cleared field stays invalid. */
export const NEW_OPENING_LOSS: OpeningLoss = { openingType: 'Round', emissivity: 0.9 };

@Injectable()
export class OpeningFormService {
  private readonly fb = inject(FormBuilder);

  getOpeningForm(loss: OpeningLoss = NEW_OPENING_LOSS): OpeningForm {
    const form: OpeningForm = this.fb.group({
      numberOfOpenings: [loss.numberOfOpenings ?? null, [Validators.required, Validators.min(0)]],
      thickness: [loss.thickness ?? null, [Validators.required, Validators.min(0)]],
      openingType: [loss.openingType ?? null, Validators.required],
      lengthOfOpening: [loss.lengthOfOpening ?? null],
      heightOfOpening: [loss.heightOfOpening ?? null],
      viewFactor: [loss.viewFactor ?? null, [Validators.required, Validators.min(0)]],
      insideTemperature: [loss.insideTemperature ?? null, Validators.required],
      ambientTemperature: [loss.ambientTemperature ?? null],
      emissivity: [loss.emissivity ?? null, [Validators.required, Validators.min(0), Validators.max(1)]],
      percentTimeOpen: [loss.percentTimeOpen ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
    this.setDimensionValidators(form);
    return this.setAmbientTempValidator(form);
  }

  buildOpeningLoss(form: OpeningForm): OpeningLoss {
    const values = form.getRawValue();
    return {
      numberOfOpenings: values.numberOfOpenings ?? undefined,
      thickness: values.thickness ?? undefined,
      openingType: values.openingType ?? undefined,
      lengthOfOpening: values.lengthOfOpening ?? undefined,
      heightOfOpening: values.heightOfOpening ?? undefined,
      viewFactor: values.viewFactor ?? undefined,
      insideTemperature: values.insideTemperature ?? undefined,
      ambientTemperature: values.ambientTemperature ?? undefined,
      emissivity: values.emissivity ?? undefined,
      percentTimeOpen: values.percentTimeOpen ?? undefined,
    };
  }

  /** `heightOfOpening` only applies to a Rectangular opening; reset unconditionally on every type change. */
  setDimensionValidators(form: OpeningForm): OpeningForm {
    const isRound = form.controls.openingType.value === 'Round';
    form.controls.lengthOfOpening.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
    form.controls.heightOfOpening.setValidators(isRound ? [] : [Validators.required, GreaterThanValidator.greaterThan(0)]);
    form.controls.lengthOfOpening.markAsDirty();
    form.controls.heightOfOpening.markAsDirty();
    form.controls.lengthOfOpening.updateValueAndValidity({ emitEvent: false });
    form.controls.heightOfOpening.updateValueAndValidity({ emitEvent: false });
    return form;
  }

  setAmbientTempValidator(form: OpeningForm): OpeningForm {
    const insideTemp = form.controls.insideTemperature.value;
    form.controls.ambientTemperature.setValidators(
      insideTemp !== null ? [Validators.required, Validators.max(insideTemp)] : [Validators.required]
    );
    form.controls.ambientTemperature.markAsDirty();
    form.controls.ambientTemperature.updateValueAndValidity({ emitEvent: false });
    return form;
  }
}
