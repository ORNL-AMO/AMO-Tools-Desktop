import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FixtureLoss } from '../../../shared/models/losses/fixtureLoss';

@Injectable()
export class FixtureLossesService {

  constructor(private formBuilder: FormBuilder) { }


  initForm() {
    return this.formBuilder.group({
      'type': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'initialTemp': ['', Validators.required],
      'finalTemp': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
    })
  }

  getFormFromLoss(loss: FixtureLoss){
  return this.formBuilder.group({
      'type': [loss.type, Validators.required],
      'feedRate': [loss.feedRate, Validators.required],
      'initialTemp': [loss.initialTemperature, Validators.required],
      'finalTemp': [loss.finalTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
    })
  }
}
