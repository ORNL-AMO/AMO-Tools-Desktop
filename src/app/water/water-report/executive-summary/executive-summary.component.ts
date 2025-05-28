import { Component, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { ExecutiveSummaryResults, getIsDiagramValid, NodeErrors } from 'process-flow-lib';
import { Diagram } from '../../../shared/models/diagram';
import { UpdateDiagramFromAssessmentService } from '../../../water-process-diagram/update-diagram-from-assessment.service';

@Component({
  selector: 'app-executive-summary',
  standalone: false,
  templateUrl: './executive-summary.component.html',
  styleUrl: './executive-summary.component.css'
})
export class ExecutiveSummaryComponent {
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;

  notes: Array<{
    modificationName: string,
    note: string
  }>;
  selectedModificationIndex: number = 1;

  baselineResults: ExecutiveSummaryResults;
  modificationResults: ExecutiveSummaryResults[] = [];
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
      this.baselineResults = this.waterAssessmentResultsService.getExecutiveSummaryReport(this.assessment, this.settings);
    } else {
      this.baselineResults = {
        totalSourceWaterIntake: undefined,
        totalPerProductionUnit: undefined,
        directCost: undefined,
        trueCost: undefined,
        trueCostPerProductionUnit: undefined,
        trueOverDirectResult: undefined,
      }
    }
  }

  getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

}
