import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';

export type AtmosphereForm = FormGroup<{
  materialId: FormControl<number | null>;
  specificHeat: FormControl<number | null>;
  inletTemp: FormControl<number | null>;
  outletTemp: FormControl<number | null>;
  flowRate: FormControl<number | null>;
  correctionFactor: FormControl<number | null>;
}>;

@Injectable()
export class AtmosphereFormService {
  private readonly fb = inject(FormBuilder);

  getAtmosphereForm(loss: AtmosphereLoss = {}): AtmosphereForm {
    const form: AtmosphereForm = this.fb.group({
      materialId: [loss.atmosphereGas ?? null, Validators.required],
      specificHeat: [loss.specificHeat ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      inletTemp: [loss.inletTemperature ?? null, Validators.required],
      outletTemp: [loss.outletTemperature ?? null, Validators.required],
      flowRate: [loss.flowRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      correctionFactor: [loss.correctionFactor ?? 1.0, Validators.required],
    });
    return this.setOutletTempValidator(form);
  }

  buildAtmosphereLoss(form: AtmosphereForm): AtmosphereLoss {
    const values = form.getRawValue();
    return {
      atmosphereGas: values.materialId ?? undefined,
      specificHeat: values.specificHeat ?? undefined,
      inletTemperature: values.inletTemp ?? undefined,
      outletTemperature: values.outletTemp ?? undefined,
      flowRate: values.flowRate ?? undefined,
      correctionFactor: values.correctionFactor ?? undefined,
    };
  }

  setOutletTempValidator(form: AtmosphereForm): AtmosphereForm {
    const inletTemp = form.controls.inletTemp.value;
    form.controls.outletTemp.setValidators(
      inletTemp !== null ? [Validators.required, Validators.min(inletTemp)] : [Validators.required]
    );
    form.controls.outletTemp.markAsDirty();
    form.controls.outletTemp.updateValueAndValidity({ emitEvent: false });
    return form;
  }
}
