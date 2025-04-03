import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { WaterProcessComponent } from '../../shared/models/water-assessment';
import { getWaterTreatmentComponent } from '../../../process-flow-types/shared-process-flow-logic';
import { WaterTreatment } from '../../../process-flow-types/shared-process-flow-types';

@Injectable()
export class WaterTreatmentService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: WaterTreatment): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      treatmentType: [obj.treatmentType],
      customTreatmentType: [obj.customTreatmentType],
      cost: [obj.cost],
      name: [obj.name],
      flowValue: [obj.flowValue]
    });
    return form;
  }

  getWaterTreatmentFromForm(form: FormGroup, waterTreatment: WaterTreatment): WaterTreatment {
    waterTreatment.treatmentType = form.controls.treatmentType.value;
    waterTreatment.cost = form.controls.cost.value;
    waterTreatment.name = form.controls.name.value;
    waterTreatment.customTreatmentType = form.controls.customTreatmentType.value;
    waterTreatment.flowValue = form.controls.flowValue.value;
    return waterTreatment;
  }

  
  updateWaterTreatment(waterTreatments: WaterTreatment[], updatedWaterTreatment: WaterTreatment, updateIndex: number) {
    return waterTreatments.map((waterTreatment: WaterTreatment, index) => {
      if (index === updateIndex) {
        waterTreatment.cost = updatedWaterTreatment.cost;
      }
    });
  }

  
  addWaterTreatmentComponent(existingComponent?: WaterProcessComponent, createdByAssessment = false): WaterTreatment {
    const waterTreatment = existingComponent? existingComponent as WaterTreatment : undefined;
    return getWaterTreatmentComponent(waterTreatment, false, createdByAssessment);
  }

  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }
}
