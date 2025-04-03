import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { WaterProcessComponent } from '../../shared/models/water-assessment';
import { getNewProcessComponent } from '../../../process-flow-types/shared-process-flow-logic';
import { WasteWaterTreatment } from '../../../process-flow-types/shared-process-flow-types';

@Injectable()
export class WasteWaterTreatmentService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: WasteWaterTreatment): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      treatmentType: [obj.treatmentType],
      customTreatmentType: [obj.customTreatmentType],
      cost: [obj.cost],
      name: [obj.name],
      flowValue: [obj.flowValue]
    });
    return form;
  }

  getWasteWaterTreatmentFromForm(form: FormGroup, wasteWaterTreatment: WasteWaterTreatment): WasteWaterTreatment {
    wasteWaterTreatment.treatmentType = form.controls.treatmentType.value;
    wasteWaterTreatment.cost = form.controls.cost.value;
    wasteWaterTreatment.name = form.controls.name.value;
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

    /**
 * Add new component or return component based from a diagram component
 * @param processFlowPart Build from diagram component
 */
    addWasteWaterTreatment(processFlowPart?: WaterProcessComponent): WasteWaterTreatment {
      let wasteWaterTreatment: WasteWaterTreatment;
      let newComponent: WasteWaterTreatment;
      if (!processFlowPart) {
        newComponent = getNewProcessComponent('waste-water-treatment') as WasteWaterTreatment;
      } else {
        newComponent = processFlowPart as WasteWaterTreatment;
      }
      
    // todo 7020 revisit which properties are getting overwritten here
      wasteWaterTreatment = {
        ...newComponent,
        createdByAssessment: true,
        treatmentType: newComponent.treatmentType !== undefined? newComponent.treatmentType : 0,
        customTreatmentType: newComponent.customTreatmentType,
        cost: newComponent.cost,
        name: newComponent.name,
        flowValue: newComponent.flowValue
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
