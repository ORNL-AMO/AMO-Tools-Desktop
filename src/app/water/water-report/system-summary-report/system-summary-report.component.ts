import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { getIsDiagramValid, NodeErrors, PlantSystemSummaryResults } from 'process-flow-lib';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { UpdateDiagramFromAssessmentService } from '../../../water-process-diagram/update-diagram-from-assessment.service';
import { Diagram } from '../../../shared/models/diagram';
import { Subscription } from 'rxjs';
import { WaterReportService } from '../water-report.service';

@Component({
  selector: 'app-system-summary-report',
  standalone: false,
  templateUrl: './system-summary-report.component.html',
  styleUrl: './system-summary-report.component.css'
})
export class SystemSummaryReportComponent {
  private readonly waterAssessmentResultsService = inject(WaterAssessmentResultsService);
  private readonly updateDiagramFromAssessmentService = inject(UpdateDiagramFromAssessmentService);
  private readonly waterReportService = inject(WaterReportService);

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

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;
  systemSummaryReportSubscription: Subscription;

  ngOnInit(): void {
    let diagram: Diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(this.assessment);
    let nodeErrors: NodeErrors = diagram.waterDiagram.flowDiagramData.nodeErrors;

    this.systemSummaryReportSubscription = this.waterReportService.systemSummaryReport.subscribe(report => {
      this.isDiagramValid = getIsDiagramValid(nodeErrors);
      this.plantSummaryResults = this.isDiagramValid ? report : this.waterAssessmentResultsService.getEmptyPlantSystemSummaryResults();
    });
  }

  getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}

