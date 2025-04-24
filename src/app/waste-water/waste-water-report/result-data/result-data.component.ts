import { Component, Input, OnInit } from '@angular/core';
import { WasteWaterReportRollupService } from '../../../report-rollup/waste-water-report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WasteWater, WasteWaterData } from '../../../shared/models/waste-water';

@Component({
    selector: 'app-result-data',
    templateUrl: './result-data.component.html',
    styleUrls: ['./result-data.component.css'],
    standalone: false
})
export class ResultDataComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;

  selectedModificationIndex: number;
  wasteWater: WasteWater;
  constructor(private wasteWaterReportRollupService: WasteWaterReportRollupService) { }

  ngOnInit(): void {
    this.wasteWater = this.assessment.wasteWater;
    if (this.inRollup) {
      this.wasteWaterReportRollupService.selectedWasteWater.forEach(val => {
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

  getPaybackPeriod(modification: WasteWaterData) {
    let result = 0;
    let annualCostSavings = this.getDiff(this.wasteWater.baselineData.outputs.AeCost, modification.outputs.AeCost);
    if (isNaN(annualCostSavings) == false) {
      if (annualCostSavings > 1) {
        result = (modification.operations.implementationCosts / annualCostSavings) * 12;
      }
    }
    return result;
  }

  getDiff(num1: number, num2: number) {
    let diff = num1 - num2;
    if ((diff < .005) && (diff > -.005)) {
      return null;
    } else {
      return diff;
    }
  }


  useModification() {
    this.wasteWaterReportRollupService.updateSelectedWasteWater({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }
}
