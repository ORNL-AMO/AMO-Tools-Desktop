import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { WasteWaterTreatment, WaterProcessComponent, WaterTreatment } from '../../shared/models/water-assessment';
import { getNewProcessComponent, ProcessFlowPart } from '../../../process-flow-types/shared-process-flow-types';

@Injectable()
export class WaterTreatmentService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: WaterTreatment): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      treatmentType: [obj.treatmentType],
      customTreatmentType: [obj.customTreatmentType],
      cost: [obj.cost],
      flowValue: [obj.flowValue]
    });
    return form;
  }

  getWaterTreatmentFromForm(form: FormGroup, waterTreatment: WaterTreatment): WaterTreatment {
    waterTreatment.treatmentType = form.controls.treatmentType.value;
    waterTreatment.cost = form.controls.cost.value;
    waterTreatment.customTreatmentType = form.controls.customTreatmentType.value;
    waterTreatment.flowValue = form.controls.flowValue.value;
    return waterTreatment;
  }

  
  updateWaterTreatment(waterTreatments: WaterTreatment[], updatedWaterTreatment: WaterTreatment, updateIndex: number) {
    return waterTreatments.map((waterTreatment: WaterTreatment, index) => {
      if (index === updateIndex) {
        waterTreatment.cost = updatedWaterTreatment.cost
      }
    });
  }

  getDefaultWaterTreatment(): WaterTreatment {
    let newComponent: WaterProcessComponent = getNewProcessComponent('water-treatment') as WasteWaterTreatment;
    
    let waterTreatment = {
      ...newComponent,
      treatmentType: 0,
      customTreatmentType: undefined,
      cost: 0,
      flowValue: 0
    };
    return waterTreatment;
  }

  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }
}
