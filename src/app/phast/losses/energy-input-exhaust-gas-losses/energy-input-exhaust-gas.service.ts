import { Injectable } from '@angular/core';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { UntypedFormBuilder, Validators, UntypedFormGroup, FormGroup } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
@Injectable()
export class EnergyInputExhaustGasService {

  constructor(private formBuilder: UntypedFormBuilder) {
  }

  initForm(lossNum: number): UntypedFormGroup {
    let form: FormGroup = this.formBuilder.group({
      'totalHeatInput': [0, Validators.required],
      'name': ['Loss #' + lossNum],
      'availableHeat': [100, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      'electricalHeaterEfficiency': [100, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]]
    });

    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }

    return form;
  }

  getFormFromLoss(energyInputExhaustGas: EnergyInputExhaustGasLoss): UntypedFormGroup {
    let form: FormGroup = this.formBuilder.group({
      'totalHeatInput': [energyInputExhaustGas.totalHeatInput, Validators.required],
      'name': [energyInputExhaustGas.name],
      'availableHeat': [energyInputExhaustGas.availableHeat, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      'electricalHeaterEfficiency': [energyInputExhaustGas.electricalHeaterEfficiency, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]]
    });

    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }

    return form;
  }

  getLossFromForm(form: UntypedFormGroup): EnergyInputExhaustGasLoss {
    let tmpExhaustGas: EnergyInputExhaustGasLoss = {
      totalHeatInput: form.controls.totalHeatInput.value,
      otherLosses: 0.0,
      name: form.controls.name.value,
      availableHeat: form.controls.availableHeat.value,
      electricalHeaterEfficiency: form.controls.electricalHeaterEfficiency.value,
    };
    return tmpExhaustGas;
  }

  checkWarnings(energyInputHeatDelivered: number): {energyInputHeatDelivered: string } {
    return {
      energyInputHeatDelivered: this.checkEnergyInputHeatDelivered(energyInputHeatDelivered)
    };
  }

  checkEnergyInputHeatDelivered(energyInputHeatDelivered: number): string {
    if (energyInputHeatDelivered < 0) {
      return 'More heat than necessary is being delivered via burners. Check fuel inputs or estimate other losses.';
    } else {
      return null;
    }
  }


}
