import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HeatStorage } from '../../../shared/models/losses/heatStorage';

@Injectable()
export class HeatStorageService {

  constructor(private formBuilder: FormBuilder) { }

  initForm(){
    return this.formBuilder.group({
      'shape': [''],
      'area': [''],
      'furnaceTemp': [''],
      'ambientTemp': [''],
      'startingWallTemp': [''],
      'correctionFactor': [''],
    })
  }

  getFormFromLoss(loss: HeatStorage){

  }

  getLossFromForm(form: any){

  }

}
