import { Component, OnInit, Input } from '@angular/core';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { SsmtValid } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-energy-summary',
  templateUrl: './energy-summary.component.html',
  styleUrls: ['./energy-summary.component.css']
})
export class EnergySummaryComponent implements OnInit {
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<{name: string, outputData: SSMTOutput, valid: SsmtValid}>;
  @Input()
  settings: Settings;
  @Input()
  tableCellWidth: number;
  @Input()
  inRollup: boolean;
  @Input()
  assessment:Assessment;


  numberOfHeaders: number;
  selectedModificationIndex: number;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    if (this.inRollup) {
      this.reportRollupService.selectedSsmt.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId === this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          });
        }
      });
    }
    this.numberOfHeaders = this.assessment.ssmt.headerInput.numberOfHeaders;
  }

  useModification() {
    this.reportRollupService.updateSelectedSsmt({assessment: this.assessment, settings: this.settings}, this.selectedModificationIndex);
  }
}
