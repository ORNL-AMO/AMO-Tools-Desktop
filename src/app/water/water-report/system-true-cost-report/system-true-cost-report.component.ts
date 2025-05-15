import { Component, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { SystemTrueCostData } from '../../water-assessment-results.service';
import { WaterReportService } from '../water-report.service';
import * as _ from 'lodash';

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
  

  constructor(
    private waterReportService: WaterReportService,
    // private waterRollupService: WaterRollupService
  ) { }

  ngOnInit(): void {
    this.systemTrueCostReportSubscription = this.waterReportService.systemTrueCostReport.subscribe(report => {
      this.trueCostOfSystemsReport = this.waterReportService.getSortedTrueCostReport(report);
    });

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

   ngOnDestroy() {
    this.systemTrueCostReportSubscription.unsubscribe();
  }

 getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

}
