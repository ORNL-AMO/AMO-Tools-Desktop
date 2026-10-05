import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { HeatEnergy, getMaxHeatEnergyOutgoingTemp } from 'process-flow-lib';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class HeatEnergyService {

  constructor(private formBuilder: FormBuilder) { }

  getHeatEnergyForm(heatEnergy: HeatEnergy, unitsOfMeasure: string): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      incomingTemp: [heatEnergy.incomingTemp],
      outgoingTemp: [heatEnergy.outgoingTemp, [Validators.max(getMaxHeatEnergyOutgoingTemp(unitsOfMeasure))]],
      heaterEfficiency: [heatEnergy.heaterEfficiency, [GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      heatingFuelType: [heatEnergy.heatingFuelType],
      wasteWaterDischarge: [heatEnergy.wasteWaterDischarge],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getHeatEnergyFromForm(form: FormGroup): HeatEnergy {
    return {
      incomingTemp: form.controls.incomingTemp.value,
      outgoingTemp: form.controls.outgoingTemp.value,
      heaterEfficiency: form.controls.heaterEfficiency.value,
      heatingFuelType: form.controls.heatingFuelType.value,
      wasteWaterDischarge: form.controls.wasteWaterDischarge.value,
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
