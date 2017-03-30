import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OtherLoss } from '../../../shared/models/losses/otherLoss';

@Injectable()
export class OtherLossesService {

  constructor(private formBuilder: FormBuilder) { }

  initForm() {
    return this.formBuilder.group({
      description: ['', Validators.required],
      heatLoss: [0.0, Validators.required]
    })
  }

  getLossFromForm(form: any): OtherLoss {
    let tmpLoss = {
      description: form.value.description,
      heatLoss: form.value.heatLoss
    }
    return tmpLoss
  }

  getFormFromLoss(loss: OtherLoss) {
    return this.formBuilder.group({
      description: [loss.description, Validators.required],
      heatLoss: [loss.heatLoss, Validators.required]
    })
  }
}
