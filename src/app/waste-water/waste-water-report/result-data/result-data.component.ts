import { Component, ElementRef, inject, Input, OnInit, Signal, ViewChild } from '@angular/core';
import { WasteWaterReportRollupService } from '../../../report-rollup/waste-water-report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WasteWater, WasteWaterData } from '../../../shared/models/waste-water';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { getWasteWaterPaybackPeriod } from '../waste-water-report.utils';

@Component({
    selector: 'app-result-data',
    templateUrl: './result-data.component.html',
    styleUrls: ['./result-data.component.css'],
    standalone: false
})
export class ResultDataComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;

  selectedModificationIndex: number;
  wasteWater: WasteWater;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;
  
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

  getPaybackPeriod(modification: WasteWaterData): number {
    return getWasteWaterPaybackPeriod(this.wasteWater.baselineData.outputs, modification);
  }


  useModification() {
    this.wasteWaterReportRollupService.updateSelectedWasteWater({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
