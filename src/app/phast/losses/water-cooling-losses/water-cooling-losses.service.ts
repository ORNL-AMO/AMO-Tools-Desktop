import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { WaterCoolingLoss } from '../../../shared/models/losses/coolingLoss';

@Injectable()
export class WaterCoolingLossesService {

  constructor(private formBuilder: FormBuilder) { }


  initForm() {
    return this.formBuilder.group({
      'coolingMedium': [''],
      'avgSpecificHeat': [''],
      'density': [''],
      'flow': [''],
      'inletTemp': [''],
      'outletTemp': [''],
      'heatRequired': [{value: '', disabled: 'true'}],
      'correctionFactor': [''],
    })
  }
}
