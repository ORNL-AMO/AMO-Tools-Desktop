import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ComponentAttribution, SystemToCostComponentAttributionMap } from 'process-flow-lib';

@Injectable()
export class TrueCostReportService {

   constructor(private fb: FormBuilder) { }

  getCostComponentsForm(systemToCostComponentAttributions: SystemToCostComponentAttributionMap, 
    systemIds: string[], 
    costComponentIds: string[], 
    nullDefaultAttribution: Record<string, {[key: string]: string}>
  ): FormGroup {
    const form = this.fb.group({
      costComponentsSystemAttribution: this.createCostComponentBySystemFormArray(systemToCostComponentAttributions, systemIds, costComponentIds, nullDefaultAttribution),
    });
    return form;
  }

  /**
   * Creates a form array of form arrays where we map cost components (rows) to attribution by system (columns/cells).
   * @returns  FormArray of FormArray
   */
  createCostComponentBySystemFormArray(systemToCostComponentAttributions: SystemToCostComponentAttributionMap, 
    systemIds: string[], 
    costComponentIds: string[], 
    nullDefaultAttribution: Record<string, {[key: string]: string}>
  ): FormArray<FormArray<FormControl<number>>> {
    let costComponents: number[][] = [];
    if (systemToCostComponentAttributions) {
      costComponentIds.forEach(componentId => {
        const componentSystemAttributions = [];
        systemIds.forEach((systemId: string) => {

          const componentAttribution: ComponentAttribution = systemToCostComponentAttributions[systemId].componentAttribution[componentId];
          let systemAttributionToComponent: number = null;
          if (componentAttribution) {
            systemAttributionToComponent = componentAttribution.flowAttributionFraction.adjusted?  
            (componentAttribution.flowAttributionFraction.adjusted * 100) 
            : (componentAttribution.flowAttributionFraction.default * 100);
          } else {
            // * Component not connected, or incurs no cost
            if (!nullDefaultAttribution[componentId]) {
              nullDefaultAttribution[componentId] = {};
            }
            nullDefaultAttribution[componentId][systemId] = systemId;
          }

          componentSystemAttributions.push(systemAttributionToComponent);
        });
        costComponents.push(componentSystemAttributions)
      });
    }

    // todo above can be combined into this after debugging
    return this.fb.array(
      costComponents.map(component =>
        this.fb.array(
          component.map(systemAttribution =>
            this.fb.control(systemAttribution ?? 0, [Validators.min(0), Validators.max(100)])
          )
        )
      )
    );
  }

    // todo convert to fraction
  // setChillerLoadSchedule(formValue: LoadScheduleData, currentChiller: ChillerInventoryItem) {
  //   currentChiller.useSameMonthlyLoading = formValue.useSameMonthlyLoading;
  // }

  

}



export interface TrueCostComponentAttributionForm {
  costComponentsSystemAttribution: FormArray;
}
