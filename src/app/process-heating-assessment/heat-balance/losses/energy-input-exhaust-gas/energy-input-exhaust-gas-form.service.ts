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
    return this.fb.group({
      totalHeatInput: [loss.totalHeatInput ?? 0, Validators.required],
      availableHeat: [loss.availableHeat ?? 100, percentValidators],
      electricalHeaterEfficiency: [loss.electricalHeaterEfficiency ?? 100, percentValidators],
    });
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
