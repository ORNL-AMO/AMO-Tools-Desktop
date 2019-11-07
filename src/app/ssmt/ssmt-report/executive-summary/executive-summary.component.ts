import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { SSMT } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<SSMTOutput>;
  @Input()
  tableCellWidth: number;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  printView: boolean;
  @Input()
  ssmt: SSMT;

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
  }

  getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    let tmpSavingsPercent = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  useModification() {
    this.reportRollupService.updateSelectedSsmt({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let val = (implementationCost / (baselineCost - modCost)) * 12;
      if (isNaN(val) === false) {
        return val;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

}
