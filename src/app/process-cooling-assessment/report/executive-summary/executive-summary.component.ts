import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Settings } from 'http2';
import { ExecutiveSummaryResults } from 'process-flow-lib';
import { Assessment } from '../../../shared/models/assessment';

@Component({
  selector: 'app-executive-summary',
  imports: [],
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
  isValid: boolean;

  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  copyTable1String: any;



  ngOnInit(): void {
    // let diagram: Diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(this.assessment);
    // let nodeErrors: NodeErrors = checkDiagramNodeErrors(
    //   diagram.waterDiagram.flowDiagramData.nodes,
    //   diagram.waterDiagram.flowDiagramData.edges,
    //   diagram.waterDiagram.flowDiagramData.calculatedData,
    //   diagram.waterDiagram.flowDiagramData.settings);
    // let nodeErrors: NodeErrors = diagram.waterDiagram.flowDiagramData.nodeErrors;
    // this.isDiagramValid = getIsDiagramValid(nodeErrors);
    // if (this.isDiagramValid) {
    //   this.baselineResults = this.waterAssessmentResultsService.getExecutiveSummaryReport(this.assessment, this.settings);
    // } else {
    //   this.baselineResults = {
    //     totalSourceWaterIntake: undefined,
    //     totalPerProductionUnit: undefined,
    //     directCost: undefined,
    //     trueCost: undefined,
    //     trueCostPerProductionUnit: undefined,
    //     trueOverDirectResult: undefined,
    //   }
    // }
  }

  updateCopyTable1String() {
    this.copyTable1String = this.copyTable1.nativeElement.innerText;
  }


}
