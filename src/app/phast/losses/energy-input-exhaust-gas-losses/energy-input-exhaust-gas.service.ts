import { Injectable } from '@angular/core';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
@Injectable()
export class EnergyInputExhaustGasService {

  constructor(private formBuilder: FormBuilder) {
  }

  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'excessAir': [''],
      'combustionAirTemp': [''],
      'exhaustGasTemp': [''],
      'totalHeatInput': [0],
      'electricalPowerInput': [''],
      'name': ['Loss #'+lossNum]
    })
  }

  getFormFromLoss(energyInputExhaustGas: EnergyInputExhaustGasLoss): FormGroup {
    let tmpGroup = this.formBuilder.group({
      'excessAir': [energyInputExhaustGas.excessAir],
      'combustionAirTemp': [energyInputExhaustGas.combustionAirTemp],
      'exhaustGasTemp': [energyInputExhaustGas.exhaustGasTemp],
      'totalHeatInput': [energyInputExhaustGas.totalHeatInput],
      'electricalPowerInput': [energyInputExhaustGas.electricalPowerInput],
      'name': [energyInputExhaustGas.name]
    })
    return tmpGroup;
  }

  getLossFromForm(form: FormGroup): EnergyInputExhaustGasLoss {
    let tmpExhaustGas: EnergyInputExhaustGasLoss = {
      excessAir: form.controls.excessAir.value,
      combustionAirTemp: form.controls.combustionAirTemp.value,
      exhaustGasTemp: form.controls.exhaustGasTemp.value,
      totalHeatInput: form.controls.totalHeatInput.value,
      electricalPowerInput: form.controls.electricalPowerInput.value,
      otherLosses: 0.0,
      name: form.controls.name.value
    }
    return tmpExhaustGas;
  }
}
