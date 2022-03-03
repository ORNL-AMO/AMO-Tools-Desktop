import { Injectable } from '@angular/core';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
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
      'name': ['Loss #' + lossNum]
    });
  }

  getFormFromLoss(energyInputExhaustGas: EnergyInputExhaustGasLoss): FormGroup {
    let tmpGroup = this.formBuilder.group({
      'excessAir': [energyInputExhaustGas.excessAir, Validators.required],
      'combustionAirTemp': [energyInputExhaustGas.combustionAirTemp, Validators.required],
      'exhaustGasTemp': [energyInputExhaustGas.exhaustGasTemp, Validators.required],
      'totalHeatInput': [energyInputExhaustGas.totalHeatInput, Validators.required],
      'name': [energyInputExhaustGas.name]
    });
    return tmpGroup;
  }

  getLossFromForm(form: FormGroup): EnergyInputExhaustGasLoss {
    let tmpExhaustGas: EnergyInputExhaustGasLoss = {
      excessAir: form.controls.excessAir.value,
      combustionAirTemp: form.controls.combustionAirTemp.value,
      exhaustGasTemp: form.controls.exhaustGasTemp.value,
      totalHeatInput: form.controls.totalHeatInput.value,
      otherLosses: 0.0,
      name: form.controls.name.value
    };
    return tmpExhaustGas;
  }

  checkWarnings(energyInputExhaustGas: EnergyInputExhaustGasLoss, settings: Settings): { combustionTempWarning: string, heatWarning: string } {
    return {
      combustionTempWarning: this.checkCombustionTemp(energyInputExhaustGas),
      heatWarning: this.checkHeatInput(energyInputExhaustGas, settings)
    };
  }
  checkHeatInput(energyInputExhaustGas: EnergyInputExhaustGasLoss, settings: Settings): string {
    if (settings.unitsOfMeasure === 'Imperial') {
      if (energyInputExhaustGas.totalHeatInput > 0 && energyInputExhaustGas.exhaustGasTemp < 40) {
        return 'Exhaust Gas Temperature cannot be less than 40 ';
      } else {
        return null;
      }
    }
    if (settings.unitsOfMeasure === 'Metric') {
      if (energyInputExhaustGas.totalHeatInput > 0 && energyInputExhaustGas.exhaustGasTemp < 4) {
        return 'Exhaust Gas Temperature cannot be less than 4 ';
      } else {
        return null;
      }
    }
  }

  checkCombustionTemp(energyInputExhaustGas: EnergyInputExhaustGasLoss): string {
    if (energyInputExhaustGas.totalHeatInput > 0 && energyInputExhaustGas.combustionAirTemp >= energyInputExhaustGas.exhaustGasTemp) {
      return 'Combustion air temperature must be less than exhaust gas temperature';
    }
    else {
      return null;
    }
  }

}
