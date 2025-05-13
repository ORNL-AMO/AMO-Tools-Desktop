import { Component, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { ExecutiveSummaryResults } from 'process-flow-lib';

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
  constructor(
        private waterAssessmentResultsService: WaterAssessmentResultsService,
    
    // private waterRollupService: WaterRollupService
  ) { }

  ngOnInit(): void {
    this.baselineResults = this.waterAssessmentResultsService.getExecutiveSummaryReport(this.assessment, this.settings);
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
