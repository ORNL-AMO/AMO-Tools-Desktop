import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';

@Component({
  selector: 'app-output-summary',
  templateUrl: './output-summary.component.html',
  styleUrls: ['./output-summary.component.css']
})
export class OutputSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;

  selectedModificationIndex: number;
  psat: PSAT;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.psat = this.assessment.psat;
    if (this.inRollup) {
      this.reportRollupService.selectedPsats.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId == this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          })
        }
      })
    }
  }

  useModification() {
    this.reportRollupService.updateSelectedPsats({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  getDiff(num1: number, num2: number) {
    let diff = num1 - num2;
    if ((diff < .005) && (diff > -.005)) {
      return null;
    } else {
      return diff;
    }
  }

  getPaybackPeriod(modification: PSAT) {
    let result = 0;
    let annualCostSavings = this.getDiff(this.psat.outputs.annual_cost, modification.outputs.annual_cost);
    if (isNaN(annualCostSavings) == false) {
      if (annualCostSavings > 1) {
        result = (modification.inputs.implementationCosts / annualCostSavings) * 12;
      }
    }
    return result;
  }
}
