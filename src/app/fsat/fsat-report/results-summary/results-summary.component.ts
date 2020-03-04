import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';

@Component({
  selector: 'app-results-summary',
  templateUrl: './results-summary.component.html',
  styleUrls: ['./results-summary.component.css']
})
export class ResultsSummaryComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;

  selectedModificationIndex: number;
  fsat: FSAT;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.fsat = this.assessment.fsat;
    if (this.inRollup) {
      this.reportRollupService.selectedFsats.forEach(val => {
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
    this.reportRollupService.updateSelectedFsats({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }
}
