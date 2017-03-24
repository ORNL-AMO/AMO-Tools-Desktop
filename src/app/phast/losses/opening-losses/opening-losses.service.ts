import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { OpeningLoss } from '../../../shared/models/losses/openingLoss';
@Injectable()
export class OpeningLossesService {

  constructor(private formBuilder: FormBuilder) { }

  initForm() {
    return this.formBuilder.group({
      'openingType': [''],
      'wallThickness': [''],
      'lengthOfOpenings': [''],
      'heightOfOpenings': [''],
      'viewFactor': [''],
      'totalOpeningArea': [''],
      'insideTemp': [''],
      'outsideTemp': [''],
      'percentTimeOpen': [''],
      'openingLoss': [{ value: '', disabled: 'true' }]
    })
  }

  getFormFromLoss(loss: OpeningLoss){

  }

  getLossFromForm(form: any){
    
  }

}
