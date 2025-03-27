import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { MotorEnergy } from '../../../../../process-flow-types/shared-process-flow-types';

@Injectable()
export class MotorEnergyService {
  operatingHours: OperatingHours;
  constructor(private formBuilder: FormBuilder) { }

  getMotorEnergyForm(motorEnergy: MotorEnergy): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [motorEnergy.name],
      numberUnits: [motorEnergy.numberUnits],
      hoursPerYear: [motorEnergy.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      loadFactor: [motorEnergy.loadFactor],
      ratedPower: [motorEnergy.ratedPower],
      systemEfficiency: [motorEnergy.systemEfficiency, [Validators.min(0), Validators.max(100)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getMotorEnergyFromForm(form: FormGroup): MotorEnergy {
    return {
      name: form.controls.name.value,
      numberUnits: form.controls.numberUnits.value,
      hoursPerYear: form.controls.hoursPerYear.value,
      loadFactor: form.controls.loadFactor.value,
      ratedPower: form.controls.ratedPower.value,
      systemEfficiency: form.controls.systemEfficiency.value,
    };
  }

  updateMotorEnergy(addedMotorEnergy: MotorEnergy[], updatedMotorEnergy: MotorEnergy, updateIndex: number) {
    return addedMotorEnergy.map((equipmentEnergy: MotorEnergy, index) => {
      if (index === updateIndex) {
        equipmentEnergy.name = updatedMotorEnergy.name;
        equipmentEnergy.numberUnits = updatedMotorEnergy.numberUnits;
        equipmentEnergy.hoursPerYear = updatedMotorEnergy.hoursPerYear;
        equipmentEnergy.loadFactor = updatedMotorEnergy.loadFactor;
        equipmentEnergy.ratedPower = updatedMotorEnergy.ratedPower;
        equipmentEnergy.systemEfficiency = updatedMotorEnergy.systemEfficiency;
      }
    });
  }

  getDefaultMotorEnergy(lastIndex: number): MotorEnergy {
    return {
      name:`Motor Energy ${lastIndex + 1}`,
      numberUnits: 1,
      hoursPerYear: 8760,
      loadFactor: null,
      ratedPower: null,
      systemEfficiency: null,
    };
  }

  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }
}
