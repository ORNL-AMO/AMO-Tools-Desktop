import { Component, OnInit, Input } from '@angular/core';
import { SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';


@Component({
  selector: 'app-losses-summary',
  templateUrl: './losses-summary.component.html',
  styleUrls: ['./losses-summary.component.css']
})
export class LossesSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string }>;
  @Input()
  numberOfHeaders: number;
  @Input()
  tableCellWidth: number;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;

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

  useModification() {
    this.reportRollupService.updateSelectedSsmt({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }
}
