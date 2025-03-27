import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { HeatEnergy } from '../../../../../process-flow-types/shared-process-flow-types';

@Injectable()
export class HeatEnergyService {

  constructor(private formBuilder: FormBuilder) { }

  getHeatEnergyForm(heatEnergy: HeatEnergy): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      incomingTemp: [heatEnergy.incomingTemp],
      outgoingTemp: [heatEnergy.outgoingTemp],
      heaterEfficiency: [heatEnergy.heaterEfficiency],
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
