import { Component, Input, OnInit } from '@angular/core';
import { WasteWaterReportRollupService } from '../../../report-rollup/waste-water-report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WasteWater, WasteWaterData } from '../../../shared/models/waste-water';

@Component({
  selector: 'app-result-data',
  templateUrl: './result-data.component.html',
  styleUrls: ['./result-data.component.css']
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


  useModification() {
    this.wasteWaterReportRollupService.updateSelectedWasteWater({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }
}
