import { Component, DestroyRef, Inject, inject, Input } from '@angular/core';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { UpdateDiagramFromAssessmentService } from '../../../water-process-diagram/update-diagram-from-assessment.service';
import { Diagram } from '../../../shared/models/diagram';
import { BlockCosts, ComponentAttribution, CostComponentSummary, FlowAttributionMap, getComponentTypeLabel, getIsDiagramValid, NodeErrors, PlantResults, PlantSystemSummaryResults, SystemToCostComponentAttributionMap } from 'process-flow-lib';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Assessment } from '../../../shared/models/assessment';
import { TrueCostReportService } from '../../services/true-cost-report.service';
import { Settings } from '../../../shared/models/settings';
import { WaterReportService } from '../water-report.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { WaterAssessmentService } from '../../water-assessment.service';


@Component({
  selector: 'app-true-cost-editable-table',
  standalone: false,
  templateUrl: './true-cost-editable-table.component.html',
  styleUrls: ['./true-cost-editable-table.component.css']
})
export class TrueCostEditableTableComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  destroyRef = inject(DestroyRef);
  waterAssessmentResultsService = inject(WaterAssessmentResultsService);
  updateDiagramFromAssessmentService = inject(UpdateDiagramFromAssessmentService);
  trueCostReportService = inject(TrueCostReportService);
  waterReportService = inject(WaterReportService);
  waterAssessmentService = inject(WaterAssessmentService);

  inRollup: boolean;
  assessment: Assessment;
  diagram: Diagram;
  settings: Settings;

  selectedEditRow: number = null;
  isDiagramValid: boolean;
  isCollapsed = false;
  form: FormGroup;

  systems: {
    name: string;
    id: string;
  }[] = [];

  costComponents: CostComponentSummary[] = [];
  plantResults: PlantResults;
  systemToCostComponentAttributions: SystemToCostComponentAttributionMap = {};
  adjustedFlowAttributionMap: FlowAttributionMap = {};

  // * Set disabled, system is not connected to cost component or has an error
  // todo this should probably be restructured
  nullDefaultAttribution: Record<string, {[key: string]: string}> = {};

  constructor(@Inject(DIALOG_DATA) modalDialogData: TrueCostEditableTableDataInputs) {
    this.assessment = modalDialogData.assessment;
    this.settings = modalDialogData.settings;
    this.inRollup = modalDialogData.inRollup;
  }

  ngOnInit() {
    this.diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(this.assessment);
    let nodeErrors: NodeErrors = this.diagram.waterDiagram.flowDiagramData.nodeErrors;
    this.isDiagramValid = getIsDiagramValid(nodeErrors);

    if (this.isDiagramValid) {
      this.plantResults = this.waterAssessmentResultsService.getPlantSummaryReport(this.assessment, this.settings);
      if (this.plantResults.flowAttributionMap) {
        Object.entries(this.assessment.water.flowAttributionMap).forEach(([edgeId, attributionMap]) => {
          const hasAdjustment = Object.values(attributionMap).some(attribution => attribution.flowAttributionFraction.adjusted !== undefined);
          if (hasAdjustment) {
            this.adjustedFlowAttributionMap[edgeId] = {...attributionMap};
          }
        });
      } 

      Object.entries(this.plantResults.flowAttributionMap).forEach(([edgeId, attributionMap]) => {
        Object.entries(attributionMap).forEach(([systemId, attribution]: [systemId: string,  attribution: ComponentAttribution]) => {
          if (!this.systemToCostComponentAttributions[systemId]) {
          this.systemToCostComponentAttributions[systemId] =  {
            name: attribution.systemName,
            componentAttribution: {
              [attribution.costComponentId]: attribution
            }
          };
        } else {
          this.systemToCostComponentAttributions[systemId].componentAttribution[attribution.costComponentId] = attribution;
        }
        });
     });

      this.costComponents = Object.entries(this.plantResults.costComponentsTotalsMap).map(([id, comp]: [id: string, comp: BlockCosts]) => {
        const hasAdjustment = this.getRowAdjustmentExists(id);
        const rowStatus = hasAdjustment ? 'adjusted' : 'default';
        return {
          id: id,
          name: comp.name,
          total: comp.totalBlockCost,
          processComponentType: comp.processComponentType,
          componentTypeLabel: getComponentTypeLabel(comp.processComponentType),
          status: rowStatus
        }
      });

      
      this.systems = Object.entries(this.systemToCostComponentAttributions).map(([id, sys]) => {
        return {
          id: id,
          name: sys.name
        }
      });

      this.systemToCostComponentAttributions = Object.fromEntries(
        Object.entries(this.systemToCostComponentAttributions).sort(([, a], [, b]) => a.name.localeCompare(b.name))
      );

      this.form = this.trueCostReportService.getCostComponentsForm(
        this.systemToCostComponentAttributions,
        this.systems.map(sys => sys.id), this.costComponents.map(comp => comp.id),
        this.nullDefaultAttribution
      );
      console.log(this.nullDefaultAttribution);
    }
  }

  setRowStatus(componentId: string, updatedStatus: 'adjusted' | 'default') {
    this.costComponents = this.costComponents.map(costComponent => {
      const status = costComponent.id === componentId ? updatedStatus : costComponent.status;
      return {
        ...costComponent,
        status: status
      };
    });
  }

  editRow(rowIndex: number) {
    // todo
    this.selectedEditRow = rowIndex;
  }

  setAdjustedValue(event, componentIndex: number, systemId: string) {
    const inputElement = event.target as HTMLInputElement;
    const adjustedFractionFlowAttributed = Number(inputElement.value) / 100;
    const componentId = this.costComponents[componentIndex].id;
    const defaultAttribution = this.systemToCostComponentAttributions[systemId].componentAttribution[componentId];
    console.log(defaultAttribution);

    if (!defaultAttribution) {
      // todo set message, system is not connected to cost component or has an error
      return;
    }

    if (!this.adjustedFlowAttributionMap[defaultAttribution.flowEdgeId]) {
      this.adjustedFlowAttributionMap[defaultAttribution.flowEdgeId] = {};
    }
    this.adjustedFlowAttributionMap[defaultAttribution.flowEdgeId][systemId] = {
      ...defaultAttribution,
      flowAttributionFraction: {
        ...defaultAttribution.flowAttributionFraction,
        adjusted: adjustedFractionFlowAttributed
      }
    };
    this.setRowStatus(componentId, 'adjusted');
  }

  getSystemAdjustedAttributions(componentSystemId: string, componentId: string): ComponentAttribution[] | undefined {
    const systemAttributions: ComponentAttribution[] = Object.entries(this.adjustedFlowAttributionMap).flatMap(([edgeId, attributions]) => {
      return Object.values(attributions).filter((attr) => {
        return (componentSystemId === attr.systemId && attr.costComponentId === componentId);
      });
    });
    return systemAttributions.length > 0 ? systemAttributions : undefined;
  }

  getRowAdjustmentExists(componentId: string): boolean {
    return Object.entries(this.adjustedFlowAttributionMap).some(([edgeId, attributions]) => {
      return Object.entries(attributions).some(([systemId, attribution]) => {
        return attribution.flowAttributionFraction.adjusted !== undefined && attribution.costComponentId === componentId;
      });
    });
  }

  // todo we can currently revert without needing to confirm the save. If we do revert outside an edit context, we won't run validation.
  revertToDefaultAttribution(systemCostAttributions: ComponentAttribution[], systemId: string, componentIndex: number, systemIndex: number) {
    const componentId: string = this.costComponents[componentIndex].id;

    systemCostAttributions.forEach(systemCostAttribution => {

      delete this.adjustedFlowAttributionMap[systemCostAttribution.flowEdgeId];
      const flowAttribution: ComponentAttribution = this.systemToCostComponentAttributions[systemId].componentAttribution[componentId];
      const rowControl: FormArray = this.getRowControl(componentIndex);
      const systemControl: FormControl = this.getSystemCostComponentControl(rowControl, systemIndex);
      systemControl.patchValue(flowAttribution.flowAttributionFraction.default * 100);
      systemControl.updateValueAndValidity();
      
      const hasAdjustment = this.getRowAdjustmentExists(componentId);
      const rowStatus = hasAdjustment ? 'adjusted' : 'default';
      this.setRowStatus(componentId, rowStatus);
      this.saveFlowAttributions();
    });
  }

  /**
    Will actually save all adjusted attributions. This shouldn't be an issue since only one row can be edited at a time.
  */
  saveRow(componentIndex: number, rowControl: FormArray) {
    // this.diagram.waterDiagram.flowDiagramData.edges.map(edge => {
    //   const sourceId = edge.source;
    //   const targetId = edge.target;
    //   if (sourceId && targetId) {
    //     // todo we cannot just find source to target connections, some costcomponents aren't directly connected to systems
    //     // todo ie can't just set attributions to edges
    //   }
    // });
    this.saveFlowAttributions();
    this.selectedEditRow = null;
  }

  saveFlowAttributions() {
    this.assessment.water.flowAttributionMap = this.adjustedFlowAttributionMap;
    this.waterAssessmentService.updateWaterAssessment(this.assessment.water);
  }

  getValidRowAttributionDiff(row: FormArray): number {
    if (!row.pristine) {
      const total = this.getTotal(row);
      return Math.abs(total - 100);
    }
    return undefined;
  }

  getTotal(row: FormArray): number {
    if (row && row.controls) {
      return row.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value) || 0), 0);
    }
  }

  get costComponentsSystemAttribution(): FormArray {
    return this.form.get('costComponentsSystemAttribution') as FormArray;
  }

  getRowControl(index: number): FormArray {
    return this.costComponentsSystemAttribution.at(index) as FormArray;
  }

  getSystemCostComponentControl(rowControl: FormArray, systemIndex: number): FormControl {
    return rowControl.at(systemIndex) as FormControl;
  }

}


export interface TrueCostEditableTableDataInputs {
  inRollup: boolean;
  assessment: Assessment;
  settings: Settings;
}