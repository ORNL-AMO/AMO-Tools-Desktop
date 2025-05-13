import { Component, Input } from '@angular/core';
import { TrueCostOfSystems } from 'process-flow-lib';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { TrueCostTableData, WaterAssessmentResultsService } from '../../water-assessment-results.service';

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
  trueCostOfSystemsReport: TrueCostTableData[] = [];
  

  constructor(
    private waterAssessmentResultsService: WaterAssessmentResultsService,
    // private waterRollupService: WaterRollupService
  ) { }

  ngOnInit(): void {
    this.trueCostOfSystemsReport = this.waterAssessmentResultsService.getTrueCostOfSystemsReport(this.assessment, this.settings);

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

