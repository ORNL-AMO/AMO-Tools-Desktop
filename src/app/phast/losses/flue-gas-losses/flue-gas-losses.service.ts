import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FlueGas } from '../../../shared/models/losses/flueGas';

@Injectable()
export class FlueGasLossesService {

  constructor(private formBuilder: FormBuilder) { }


  initForm() {
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

  initFormVolume() {
    return this.formBuilder.group({
      'gasType': [''],
      'flueGasTemperature': [''],
      'excessAirPercentage': [''],
      'combustionAirTemperature': [''],
      'CH4': [''],
      'C2H6': [''],
      'N2': [''],
      'H2': [''],
      'C3H8': [''],
      'C4H10_CnH2n': [''],
      'H2O': [''],
      'CO': [''],
      'CO2': [''],
      'SO2': [''],
      'O2': ['']
    })
  }

  initFormMass() {
    return this.formBuilder.group({
      'gasType': [''],
      'flueGasTemperature': [''],
      'excessAirPercentage': [''],
      'combustionAirTemperature': [''],
      'fuelTemperature': [''],
      'moistureInAirComposition': [''],
      'ashDischargeTemperature': [''],
      'unburnedCarbonInAsh': [''],
      'carbon': [''],
      'hydrogen': [''],
      'sulphur': [''],
      'inertAsh': [''],
      'o2': [''],
      'moisture': [''],
      'nitrogen': ['']
    })
  }

  initFormFromLoss(loss: FlueGas){

  }

  initLossFromForm(){
    
  }
}
