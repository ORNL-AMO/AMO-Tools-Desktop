import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CompressorInventoryItem, ReduceSystemAirPressure } from '../../../../../shared/models/compressed-air-assessment';
import { getPressureMinMax } from '../../../../calculations/caCalculationHelpers';

@Injectable()
export class ReduceSystemAirPressureService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(reduceSystemAirPressure: ReduceSystemAirPressure, inventoryItems: Array<CompressorInventoryItem>): UntypedFormGroup {
    let pressureMinMax: { min: number, max: number } = getPressureMinMax(inventoryItems);
    let form: UntypedFormGroup = this.formBuilder.group({
      averageSystemPressureReduction: [reduceSystemAirPressure.averageSystemPressureReduction, [Validators.min(0), Validators.required, Validators.max(pressureMinMax.min)]],
      implementationCost: [reduceSystemAirPressure.implementationCost, Validators.min(0)],
      order: [reduceSystemAirPressure.order]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): ReduceSystemAirPressure {
    return {
      averageSystemPressureReduction: form.controls.averageSystemPressureReduction.value,
      implementationCost: form.controls.implementationCost.value,
      order: form.controls.order.value
    }
  }
}
