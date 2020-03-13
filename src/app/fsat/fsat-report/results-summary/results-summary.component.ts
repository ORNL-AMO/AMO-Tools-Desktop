import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { CompareService } from '../../compare.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  isFluidDifferent: boolean;
  isFanDifferent: boolean;
  isMotorDifferent: boolean;
  isFieldDataDifferent: boolean;

  modificationsList: SafeHtml;

  selectedModificationIndex: number;
  fsat: FSAT;
  constructor(private reportRollupService: ReportRollupService, private compareService: CompareService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.fsat = this.assessment.fsat;
    console.log('fsat', this.fsat);
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

  getModifications(modifiedFsat?: FSAT) {
    const isFluidDifferent = this.compareService.checkFluidDifferent(this.fsat, modifiedFsat);
    const isFanDifferent = this.compareService.checkFanSetupDifferent(this.settings, this.fsat, modifiedFsat);
    const isMotorDifferent = this.compareService.checkFanMotorDifferent(this.fsat, modifiedFsat);
    const isFieldDataDifferent = this.compareService.checkFanFieldDataDifferent(this.fsat, modifiedFsat);
    
    const modifications = `${isFluidDifferent? '<span style="display: block"> Fluid </span>' : ''}
    ${isFanDifferent? '<span style="display: block"> Fan </span>' : ''}
    ${isMotorDifferent? '<span style="display: block"> Motor </span>' : ''}
    ${isFieldDataDifferent? '<span style="display: block"> Field Data </span>' : ''}`;
    // console.log(modifications);

    // Sanitize for angular to trust styles
    this.modificationsList = this.sanitizer.bypassSecurityTrustHtml(modifications);
  }

  // getModifications(modifiedFsat?: FSAT) {
  //   this.isFluidDifferent = this.compareService.checkFluidDifferent(this.fsat, modifiedFsat);
  //   this.isFanSDifferent = this.compareService.checkFanSetupDifferent(this.settings, this.fsat, modifiedFsat);
  //   this.isMotorDifferent = this.compareService.checkFanMotorDifferent(this.fsat, modifiedFsat);
  //   this.isFieldDataDifferent = this.compareService.checkFanFieldDataDifferent(this.fsat, modifiedFsat);
  // }

  useModification() {
    this.reportRollupService.updateSelectedFsats({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

}
