import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';
import { CompareService } from '../../compare.service';
import { FsatReportRollupService, SummaryNote } from '../../../report-rollup/fsat-report-rollup.service';

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
  

  notes: Array<SummaryNote>;

  constructor(private fsatReportRollupService: FsatReportRollupService, private compareService: CompareService) { }

  ngOnInit() {
    this.fsat = this.assessment.fsat;
    this.notes = new Array();
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

    if(this.fsat.modifications){
      this.notes = this.fsatReportRollupService.buildSummaryNotes(this.fsat);
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
    this.fsatReportRollupService.updateSelectedFsats({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

}
