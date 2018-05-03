import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';

@Injectable()
export class OtherLossesService {

  constructor(private formBuilder: FormBuilder) {
  }

  initForm(): FormGroup {
    return this.formBuilder.group({
      description: ['', Validators.required],
      heatLoss: [0.0, Validators.required]
    })
  }

  getLossFromForm(form: FormGroup): OtherLoss {
    let tmpLoss = {
      description: form.controls.description.value,
      heatLoss: form.controls.heatLoss.value
    }
    return tmpLoss
  }

  getFormFromLoss(loss: OtherLoss): FormGroup {
    return this.formBuilder.group({
      description: [loss.description, Validators.required],
      heatLoss: [loss.heatLoss, Validators.required]
    })
  }
}
