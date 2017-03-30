import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FlueGas } from '../../../shared/models/losses/flueGas';

@Injectable()
export class FlueGasLossesService {

  constructor(private formBuilder: FormBuilder) { }


  initForm(){
    return this.formBuilder.group({
      'furnaceFlueGasTemp': [''],
      'input': [''],
      'oxygenInFlueGas': [''],
      'excessAir': [''],
      'combustionAirTemp': [''],
      'calculatedO2InFlueGas': [''],
      'availableHeatInput': [''],
    })
  }
}
