import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';

@Injectable()
export class OtherLossesService {

  constructor(private formBuilder: UntypedFormBuilder) {
  }

  initForm(): UntypedFormGroup {
    return this.formBuilder.group({
      description: ['', Validators.required],
      heatLoss: [0.0, Validators.required]
    });
  }

  getLossFromForm(form: UntypedFormGroup): OtherLoss {
    let tmpLoss = {
      description: form.controls.description.value,
      heatLoss: form.controls.heatLoss.value
    };
    return tmpLoss;
  }

  getFormFromLoss(loss: OtherLoss): UntypedFormGroup {
    return this.formBuilder.group({
      description: [loss.description, Validators.required],
      heatLoss: [loss.heatLoss, Validators.required]
    });
  }
}
