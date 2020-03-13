import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { CompareService } from '../../compare.service';

@Component({
  selector: 'app-results-summary',
  templateUrl: './results-summary.component.html',
  styleUrls: ['./results-summary.component.css'],
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
  constructor(private reportRollupService: ReportRollupService, private compareService: CompareService) { }

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

  getModificationsMadeList(modifiedFsat: FSAT): Array<string> {
    let modificationsMadeList: Array<string> = new Array();
    let isFluidDifferent: boolean = this.compareService.checkFluidDifferent(this.fsat, modifiedFsat);
    if(isFluidDifferent == true){
      modificationsMadeList.push('Fluid');
    }
    let isFanDifferent: boolean = this.compareService.checkFanSetupDifferent(this.settings, this.fsat, modifiedFsat);
    if(isFanDifferent == true){
      modificationsMadeList.push('Fan');
    }
    let isMotorDifferent: boolean = this.compareService.checkFanMotorDifferent(this.fsat, modifiedFsat);
    if(isMotorDifferent == true){
      modificationsMadeList.push('Motor');
    }
    let isFieldDataDifferent: boolean = this.compareService.checkFanFieldDataDifferent(this.fsat, modifiedFsat);
    if(isFieldDataDifferent == true){
      modificationsMadeList.push('Field Data');
    }
    return modificationsMadeList;
  }

  useModification() {
    this.reportRollupService.updateSelectedFsats({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

}
