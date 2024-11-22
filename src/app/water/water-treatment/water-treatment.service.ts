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
        waterTreatment.cost = updatedWaterTreatment.cost
      }
    });
  }

  /**
 * Add new component or return component based from a diagram component
 * @param processFlowPart Build from diagram component
 */
  addWaterTreatment(processFlowPart?: WaterProcessComponent): WaterTreatment {
    let waterTreatment: WaterTreatment;
    let newComponent: WaterTreatment;
    if (!processFlowPart) {
      newComponent = getNewProcessComponent('water-treatment') as WaterTreatment;
    } else {
      newComponent = processFlowPart as WaterTreatment;
    }
    waterTreatment = {
      ...newComponent,
      treatmentType: newComponent.treatmentType !== undefined? newComponent.treatmentType : 0,
      customTreatmentType: newComponent.customTreatmentType,
      cost: newComponent.cost !== undefined? newComponent.cost : 0,
      name: newComponent.name,
      flowValue: newComponent.flowValue
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
