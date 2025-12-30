import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ComponentAttribution, SystemToCostComponentAttributionMap } from 'process-flow-lib';

@Injectable()
export class TrueCostReportService {

   constructor(private fb: FormBuilder) { }

   /**
   * Creates a form array of form arrays where we map cost components (rows) to attribution by system (columns/cells). Returns as a FormGroup.
   * @returns  FormGroup
   */
  getCostComponentsForm(systemToCostComponentAttributions: SystemToCostComponentAttributionMap, 
    systemIds: string[], 
    costComponentIds: string[], 
    nullDefaultAttribution: Record<string, {[key: string]: string}>
  ): FormGroup {
     let costComponents: number[][] = [];
    if (systemToCostComponentAttributions) {
      costComponentIds.forEach(componentId => {
        const componentSystemAttributions = [];
        systemIds.forEach((systemId: string) => {

          const componentAttribution: ComponentAttribution = systemToCostComponentAttributions[systemId].componentAttribution[componentId];
          let systemAttributionToComponent: number = null;
          if (componentAttribution) {
            systemAttributionToComponent = componentAttribution.flowAttributionFraction.adjusted !== undefined ?  
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
    const systemAttributionMatrix = this.fb.array(
      costComponents.map(component =>
        this.fb.array(
          component.map(systemAttribution =>
            this.fb.control(systemAttribution ?? 0, [Validators.min(0), Validators.max(100)])
          )
        )
      )
    );

    const form = this.fb.group({costComponentsSystemAttribution: systemAttributionMatrix});
    return form;
  }
}



export interface TrueCostComponentAttributionForm {
  costComponentsSystemAttribution: FormArray;
}
