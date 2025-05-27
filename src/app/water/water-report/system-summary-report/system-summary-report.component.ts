import { Component, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { getIsDiagramValid, NodeErrors, PlantSystemSummaryResults } from 'process-flow-lib';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { UpdateDiagramFromAssessmentService } from '../../../water-process-diagram/update-diagram-from-assessment.service';
import { Diagram } from '../../../shared/models/diagram';

@Component({
  selector: 'app-system-summary-report',
  standalone: false,
  templateUrl: './system-summary-report.component.html',
  styleUrl: './system-summary-report.component.css'
})
export class SystemSummaryReportComponent {
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;

  errors: NodeErrors;
  notes: Array<{
    modificationName: string,
    note: string
  }>;
  selectedModificationIndex: number = 1;
  plantSummaryResults: PlantSystemSummaryResults;
  isDiagramValid: boolean;

  constructor(
    private waterAssessmentResultsService: WaterAssessmentResultsService,
    private updateDiagramFromAssessmentService: UpdateDiagramFromAssessmentService
  ) { }

  ngOnInit(): void {
    let diagram: Diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(this.assessment);
    // let nodeErrors: NodeErrors = checkDiagramNodeErrors(
    //   diagram.waterDiagram.flowDiagramData.nodes,
    //   diagram.waterDiagram.flowDiagramData.edges,
    //   diagram.waterDiagram.flowDiagramData.calculatedData,
    //   diagram.waterDiagram.flowDiagramData.settings);
    let nodeErrors: NodeErrors = diagram.waterDiagram.flowDiagramData.nodeErrors;
    this.isDiagramValid = getIsDiagramValid(nodeErrors);
    if (this.isDiagramValid) {
      this.plantSummaryResults = this.waterAssessmentResultsService.getPlantSummaryReport(this.assessment, this.settings);
    } else {
      this.plantSummaryResults = {
        id: undefined,
        name: undefined,
        sourceWaterIntake: undefined,
        dischargeWater: undefined,
        directCostPerYear: undefined,
        directCostPerUnit: undefined,
        trueCostPerYear: undefined,
        trueCostPerUnit: undefined,
        trueOverDirectResult: undefined,
        allSystemResults: []
      }
    }
  }

  getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

}

