import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { SystemTrueCostData } from '../../water-assessment-results.service';
import { WaterReportService } from '../water-report.service';
import * as _ from 'lodash';
import { UpdateDiagramFromAssessmentService } from '../../../water-process-diagram/update-diagram-from-assessment.service';
import { Diagram } from '../../../shared/models/diagram';
import { checkDiagramNodeErrors, getIsDiagramValid, NodeErrors } from 'process-flow-lib';

@Component({
  selector: 'app-system-true-cost-report',
  standalone: false,
  templateUrl: './system-true-cost-report.component.html',
  styleUrl: './system-true-cost-report.component.css'
})
export class SystemTrueCostReportComponent {
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
  trueCostOfSystemsReport: SystemTrueCostData[] = [];
  systemTrueCostReportSubscription: any;
  isDiagramValid: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(
    private waterReportService: WaterReportService,
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
    this.systemTrueCostReportSubscription = this.waterReportService.systemTrueCostReport.subscribe(report => {
      this.isDiagramValid = getIsDiagramValid(nodeErrors);
      if (this.isDiagramValid) {
        this.trueCostOfSystemsReport = this.waterReportService.getSortedTrueCostReport(report);
      } else {
        this.trueCostOfSystemsReport = [];
      }
    });
  }

  ngOnDestroy() {
    this.systemTrueCostReportSubscription.unsubscribe();
  }

  getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}
