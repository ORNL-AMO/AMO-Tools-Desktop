import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OtherLoss } from '../../../../shared/models/phast/losses/otherLoss';

export type OtherForm = FormGroup<{
  description: FormControl<string | null>;
  heatLoss: FormControl<number | null>;
}>;

@Injectable()
export class OtherFormService {
  private readonly fb = inject(FormBuilder);

  getOtherForm(loss: OtherLoss = {}): OtherForm {
    return this.fb.group({
      description: [loss.description ?? null, Validators.required],
      heatLoss: [loss.heatLoss ?? null, Validators.required],
    });
  }

  buildOtherLoss(form: OtherForm): OtherLoss {
    const values = form.getRawValue();
    return {
      description: values.description ?? undefined,
      heatLoss: values.heatLoss ?? undefined,
    };
  }
}
