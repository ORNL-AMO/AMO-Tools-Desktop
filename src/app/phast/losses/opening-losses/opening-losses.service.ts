import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OpeningLoss } from '../../../shared/models/losses/openingLoss';
@Injectable()
export class OpeningLossesService {

  constructor(private formBuilder: FormBuilder) { }

  initForm() {
    return this.formBuilder.group({
      'numberOfOpenings': [1, Validators.required],
      'openingType': ['Round', Validators.required],
      'wallThickness': ['', Validators.required],
      'lengthOfOpening': ['', Validators.required],
      'heightOfOpening': ['', Validators.required],
      'viewFactor': ['', Validators.required],
      'insideTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'percentTimeOpen': ['', Validators.required],
      'emissivity': ['', Validators.required]
    })
  }

  getFormFromLoss(loss: OpeningLoss) {
    return this.formBuilder.group({
      'numberOfOpenings': [loss.numberOfOpenings],
      'openingType': [loss.openingType],
      'wallThickness': [loss.thickness],
      'lengthOfOpening': [loss.lengthOfOpening],
      'heightOfOpening': [loss.heightOfOpening],
      'viewFactor': [loss.viewFactor],
      'insideTemp': [loss.insideTemperature],
      'ambientTemp': [loss.ambientTemperature],
      'percentTimeOpen': [loss.percentTimeOpen],
      'emissivity': [loss.emessivity]
    })
  }

  getLossFromForm(form: any): OpeningLoss {
    let tmpLoss: OpeningLoss = {
      numberOfOpenings: form.value.numberOfOpenings,
      emessivity: form.value.emissivity,
      thickness: form.value.wallThickness,
      ambientTemperature: form.value.ambientTemp,
      insideTemperature: form.value.insideTemp,
      percentTimeOpen: form.value.percentTimeOpen,
      viewFactor: form.value.viewFactor,
      openingType: form.value.openingType,
      lengthOfOpening: form.value.lengthOfOpening,
      heightOfOpening: form.value.heightOfOpening,
    }
    return tmpLoss;
  }

}
