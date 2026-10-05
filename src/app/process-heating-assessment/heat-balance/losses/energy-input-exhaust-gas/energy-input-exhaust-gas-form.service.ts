import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

export type EnergyInputExhaustGasForm = FormGroup<{
  totalHeatInput: FormControl<number | null>;
  availableHeat: FormControl<number | null>;
  electricalHeaterEfficiency: FormControl<number | null>;
}>;

@Injectable()
export class EnergyInputExhaustGasFormService {
  private readonly fb = inject(FormBuilder);

  getEnergyInputExhaustGasForm(loss: EnergyInputExhaustGasLoss = {}): EnergyInputExhaustGasForm {
    const percentValidators = [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)];
    const totalHeatInput = loss.totalHeatInput ?? 0;
    const form = this.fb.group({
      totalHeatInput: [totalHeatInput, [Validators.required, Validators.min(0)]],
      availableHeat: [totalHeatInput > 0 ? loss.availableHeat ?? 100 : 100, percentValidators],
      electricalHeaterEfficiency: [loss.electricalHeaterEfficiency ?? 100, percentValidators],
    });

    // The Available Heat field is hidden at zero heat input, so an invalid leftover value there would block the form with no visible error
    form.controls.totalHeatInput.valueChanges.subscribe(value => {
      if (!(value > 0)) {
        form.controls.availableHeat.setValue(100);
      }
    });
    return form;
  }

  buildEnergyInputExhaustGasLoss(form: EnergyInputExhaustGasForm): EnergyInputExhaustGasLoss {
    const values = form.getRawValue();
    return {
      totalHeatInput: values.totalHeatInput ?? undefined,
      otherLosses: 0,
      availableHeat: values.availableHeat ?? undefined,
      electricalHeaterEfficiency: values.electricalHeaterEfficiency ?? undefined,
    };
  }
}
