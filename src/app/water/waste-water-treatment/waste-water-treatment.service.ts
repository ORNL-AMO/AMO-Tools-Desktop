import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { WasteWaterTreatment, WaterProcessComponent } from '../../shared/models/water-assessment';
import { getNewProcessComponent } from '../../../process-flow-types/shared-process-flow-types';

@Injectable()
export class WasteWasteWaterTreatmentService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: WasteWaterTreatment): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      treatmentType: [obj.treatmentType],
      customTreatmentType: [obj.customTreatmentType],
      cost: [obj.cost],
      flowValue: [obj.flowValue]
    });
    return form;
  }

  getWasteWaterTreatmentFromForm(form: FormGroup, wasteWaterTreatment: WasteWaterTreatment): WasteWaterTreatment {
    wasteWaterTreatment.treatmentType = form.controls.treatmentType.value;
    wasteWaterTreatment.cost = form.controls.cost.value;
    wasteWaterTreatment.customTreatmentType = form.controls.customTreatmentType.value;
    wasteWaterTreatment.flowValue = form.controls.flowValue.value;
    return wasteWaterTreatment;
  }

  
  updateWasteWaterTreatment(wasteWaterTreatments: WasteWaterTreatment[], updatedWasteWaterTreatment: WasteWaterTreatment, updateIndex: number) {
    return wasteWaterTreatments.map((wasteWaterTreatment: WasteWaterTreatment, index) => {
      if (index === updateIndex) {
        wasteWaterTreatment.cost = updatedWasteWaterTreatment.cost
      }
    });
  }

  getDefaultWasteWaterTreatment(): WasteWaterTreatment {
    let newComponent: WaterProcessComponent = getNewProcessComponent('waste-water-treatment') as WasteWaterTreatment;
    
    let wasteWaterTreatment = {
      ...newComponent,
      treatmentType: 0,
      customTreatmentType: undefined,
      cost: 0,
      flowValue: 0
    };
    return wasteWaterTreatment;
  }

  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }
  
}
