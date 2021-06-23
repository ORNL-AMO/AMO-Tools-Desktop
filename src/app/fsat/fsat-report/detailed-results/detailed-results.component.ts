import { Component, Input, OnInit } from '@angular/core';
import { FanAnalysisService } from '../../../calculator/fans/fan-analysis/fan-analysis.service';
import { FsatReportRollupService } from '../../../report-rollup/fsat-report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { FSAT, PsychrometricResults } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FsatService } from '../../fsat.service';

@Component({
  selector: 'app-detailed-results',
  templateUrl: './detailed-results.component.html',
  styleUrls: ['./detailed-results.component.css']
})
export class DetailedResultsComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  selectedModificationIndex: number;
  fsat: FSAT;
  psychrometricResults: PsychrometricResults;

  pressureCalcResultType: string = 'static';
  

  constructor(private fsatReportRollupService: FsatReportRollupService, private fsatService: FsatService) { }

  ngOnInit(): void {
    this.fsat = this.assessment.fsat;
    this.fsatService = this.fsatService;
    if (this.inRollup) {
      this.fsatReportRollupService.selectedFsats.forEach(val => {
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
}
