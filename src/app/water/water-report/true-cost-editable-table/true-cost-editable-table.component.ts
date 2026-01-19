import { Component, DestroyRef, Inject, inject } from '@angular/core';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { UpdateDiagramFromAssessmentService } from '../../../water-process-diagram/update-diagram-from-assessment.service';
import { Diagram } from '../../../shared/models/diagram';
import { BlockCosts, CostComponentSummary, getComponentTypeLabel, PlantResults, CostComponentAttribution, SystemAttributionMap } from 'process-flow-lib';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Assessment } from '../../../shared/models/assessment';
import { TrueCostReportService } from '../../services/true-cost-report.service';
import { Settings } from '../../../shared/models/settings';
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
  waterAssessmentService = inject(WaterAssessmentService);

  inRollup: boolean;
  assessment: Assessment;
  diagram: Diagram;
  settings: Settings;

  selectedEditRow: number = null;
  isCollapsed = false;
  form: FormGroup;

  systems: {
    name: string;
    id: string;
  }[] = [];

  costComponents: CostComponentSummary[] = [];
  costComponentMap: Map<string, CostComponentSummary> = new Map();
  plantResults: PlantResults;
  adjustedAttribution: SystemAttributionMap = {};

  // * Set disabled, system is not connected to cost component or has an error
  nullDefaultAttribution: Record<string, { [key: string]: string }> = {};

  constructor(@Inject(DIALOG_DATA) modalDialogData: TrueCostEditableTableDataInputs) {
    this.assessment = modalDialogData.assessment;
    this.settings = modalDialogData.settings;
    this.inRollup = modalDialogData.inRollup;
  }

  ngOnInit() {
    this.plantResults = this.waterAssessmentResultsService.plantResults.getValue();
    
    if (this.plantResults.systemAttributionMap) {
      Object.entries(this.plantResults.systemAttributionMap).forEach(([systemId, attributionMap]) => {
        Object.entries(attributionMap).forEach(([costComponentId, attribution]: [costComponentId: string, attribution: CostComponentAttribution]) => {
          if (attribution.totalAttribution.adjusted !== undefined) {
            if (!this.adjustedAttribution[systemId]) {
              this.adjustedAttribution[systemId] = {};
            }
            this.adjustedAttribution[systemId][costComponentId] = attribution;
          }
        });
      });
    }
    
    
    const nodeNameMap = this.waterAssessmentResultsService.nodeNameMap.getValue();
    this.systems = Object.keys(this.plantResults.systemAttributionMap).map((id) => {
      return {
        id: id,
        name: nodeNameMap[id] || "Unknown System"
      }
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
      };
    });
    
    this.costComponentMap = new Map(this.costComponents.map(component => [component.id, component]));

    this.form = this.trueCostReportService.getCostComponentsForm(
      this.plantResults.systemAttributionMap,
      this.costComponents.map(comp => comp.id),
      this.nullDefaultAttribution
    );
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
    this.selectedEditRow = rowIndex;
  }

  setAdjustedValue(event, componentIndex: number, systemId: string) {
    const inputElement = event.target as HTMLInputElement;
    const adjustedFractionFlowAttributed = Number(inputElement.value) / 100;
    const componentId = this.costComponents[componentIndex].id;
    const defaultAttribution = this.plantResults.systemAttributionMap[systemId][componentId].totalAttribution.default;
    console.log(defaultAttribution);

    if (!defaultAttribution) {
      return;
    }

    if (!this.adjustedAttribution[systemId]) {
      this.adjustedAttribution[systemId] = {};
    }

    if (!this.adjustedAttribution[systemId][componentId]) {
      this.adjustedAttribution[systemId][componentId] = {
        ...this.plantResults.systemAttributionMap[systemId][componentId],
        totalAttribution: {
          default: defaultAttribution,
          adjusted: adjustedFractionFlowAttributed
        }
      };
    } else {
      this.adjustedAttribution[systemId][componentId].totalAttribution.adjusted = adjustedFractionFlowAttributed;
    }

    this.setRowStatus(componentId, 'adjusted');
  }

  getSystemAdjustedAttributions(systemId: string, componentId: string): CostComponentAttribution[] | undefined {
    const attributions: CostComponentAttribution[] = [];
    if (this.adjustedAttribution[systemId]?.[componentId]) {
      const attribution = this.adjustedAttribution[systemId][componentId];
      if (attribution.totalAttribution.adjusted !== undefined) {
        attributions.push(attribution);
      }
    }
    return attributions.length > 0 ? attributions : undefined;
  }

  getRowAdjustmentExists(componentId: string): boolean {
    return Object.values(this.adjustedAttribution).some(systemAttributions =>
      Object.keys(systemAttributions).includes(componentId)
    );
  }

  // todo we can currently revert without needing to confirm the save. If we do revert outside an edit context, we won't run validation.
  revertToDefaultAttribution(systemAdjustedAttributions: CostComponentAttribution[], systemId: string, componentIndex: number, systemIndex: number) {
    const componentId: string = this.costComponents[componentIndex].id;

    const rowGroup: FormGroup = this.getRowControl(componentIndex);
    const systemControl: FormControl = this.getSystemCostComponentControl(rowGroup, systemIndex);

    systemControl.patchValue(this.adjustedAttribution[systemId][componentId].totalAttribution.default * 100);
    systemControl.updateValueAndValidity();

    delete this.adjustedAttribution[systemId][componentId];

    const hasAdjustment = this.getRowAdjustmentExists(componentId);
    const rowStatus = hasAdjustment ? 'adjusted' : 'default';
    this.setRowStatus(componentId, rowStatus);
    this.saveFlowAttributions();
  }

  saveRow(componentIndex: number, rowControl: FormArray) {
    this.saveFlowAttributions();
    this.selectedEditRow = null;
  }

  saveFlowAttributions() {
    this.assessment.water.systemAttributionMap = this.adjustedAttribution;
    this.waterAssessmentService.setAssessment(this.assessment);
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

  getRowControl(index: number): FormGroup {
    return this.costComponentsSystemAttribution.at(index) as FormGroup;
  }

  getSystemCostComponentControl(rowGroup: FormGroup, systemIndex: number): FormControl {
    return (rowGroup.get('systemAttributions') as FormArray).at(systemIndex) as FormControl;
  }

}


export interface TrueCostEditableTableDataInputs {
  inRollup: boolean;
  assessment: Assessment;
  settings: Settings;
}