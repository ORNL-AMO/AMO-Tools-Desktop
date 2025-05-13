import { Component, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { PlantSystemSummaryResults } from 'process-flow-lib';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';

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
  

  notes: Array<{
    modificationName: string,
    note: string
  }>;
  selectedModificationIndex: number = 1;
  plantSummaryResults: PlantSystemSummaryResults;

  constructor(
    private waterAssessmentResultsService: WaterAssessmentResultsService,
    // private waterRollupService: WaterRollupService
  ) { }

  ngOnInit(): void {
    this.plantSummaryResults = this.waterAssessmentResultsService.getPlantSummaryReport(this.assessment, this.settings);

    if (this.inRollup) {
      // this.waterRollupService.selectedAssessments.forEach(val => {
      //   if (val) {
      //     val.forEach(assessment => {
      //       if (assessment.assessmentId == this.assessment.id) {
      //         this.selectedModificationIndex = assessment.selectedIndex;
      //       }
      //     })
      //   }
      // })
    }
  }

 getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

}

