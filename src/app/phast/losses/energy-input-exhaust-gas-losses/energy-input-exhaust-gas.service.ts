import { Injectable } from '@angular/core';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
@Injectable()
export class EnergyInputExhaustGasService {

  constructor(private formBuilder: FormBuilder) {
  }

  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'excessAir': ['', Validators.required],
      'combustionAirTemp': ['', Validators.required],
      'exhaustGasTemp': ['', Validators.required],
      'totalHeatInput': [0, Validators.required],
      'electricalPowerInput': ['', Validators.required],
      'name': ['Loss #'+lossNum]
    })
  }

  getFormFromLoss(energyInputExhaustGas: EnergyInputExhaustGasLoss): FormGroup {
    let tmpGroup = this.formBuilder.group({
      'excessAir': [energyInputExhaustGas.excessAir, Validators.required],
      'combustionAirTemp': [energyInputExhaustGas.combustionAirTemp, Validators.required],
      'exhaustGasTemp': [energyInputExhaustGas.exhaustGasTemp, Validators.required],
      'totalHeatInput': [energyInputExhaustGas.totalHeatInput, Validators.required],
      'electricalPowerInput': [energyInputExhaustGas.electricalPowerInput, Validators.required],
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
