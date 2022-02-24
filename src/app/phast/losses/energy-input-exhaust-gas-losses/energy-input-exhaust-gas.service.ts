import { Injectable } from '@angular/core';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
@Injectable()
export class EnergyInputExhaustGasService {

  constructor(private formBuilder: FormBuilder) {
  }

  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'totalHeatInput': [0, Validators.required],
      'name': ['Loss #' + lossNum],
      'availableHeat': [100, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]]
    });
  }

  getFormFromLoss(energyInputExhaustGas: EnergyInputExhaustGasLoss): FormGroup {
    let tmpGroup = this.formBuilder.group({
      'totalHeatInput': [energyInputExhaustGas.totalHeatInput, Validators.required],
      'name': [energyInputExhaustGas.name],
      'availableHeat': [energyInputExhaustGas.availableHeat, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]]
    });
    return tmpGroup;
  }

  getLossFromForm(form: FormGroup): EnergyInputExhaustGasLoss {
    let tmpExhaustGas: EnergyInputExhaustGasLoss = {
      totalHeatInput: form.controls.totalHeatInput.value,
      otherLosses: 0.0,
      name: form.controls.name.value,
      availableHeat: form.controls.availableHeat.value
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
