import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AttributionFraction, CostComponentAttribution, SystemAttributionMap } from 'process-flow-lib';

@Injectable()
export class TrueCostReportService {

   constructor(private fb: FormBuilder) { }

   /**
   * Creates a form array of form arrays where we map cost components (rows) to attribution by system (columns/cells). Returns as a FormGroup.
   * @returns  FormGroup
   */
    getCostComponentsForm(
      systemAttributionMap: SystemAttributionMap, 
      costComponentIds: string[], 
      nullDefaultAttribution: Record<string, {[key: string]: string}>
  ): FormGroup {
     let costComponents: number[][] = [];
    if (systemAttributionMap) {
      costComponentIds.forEach(componentId => {
        const componentSystemAttributions = [];

        Object.entries(systemAttributionMap).forEach(([systemId, attributionMap]: [string, Record<string, CostComponentAttribution>]) => {
          const componentAttribution: AttributionFraction = attributionMap[componentId]?.totalAttribution;
          let systemAttributionToComponent: number = null;
          if (componentAttribution) {
            systemAttributionToComponent = componentAttribution.adjusted !== undefined ? (componentAttribution.adjusted * 100) : (componentAttribution.default * 100);
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
