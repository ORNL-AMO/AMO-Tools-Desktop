import { Component, Input, OnInit } from '@angular/core';
import { FanPsychrometricService, FanPsychrometricWarnings } from '../../../calculator/process-cooling/fan-psychrometric/fan-psychrometric.service';
import { FsatReportRollupService } from '../../../report-rollup/fsat-report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

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

  showPlaneResults: boolean = false;
  selectedModificationIndex: number;
  fsat: FSAT; 
  baselineWarnings: FanPsychrometricWarnings;
  modificationWarnings: FanPsychrometricWarnings;
  
  constructor(private fsatReportRollupService: FsatReportRollupService, private fanPsychrometricService: FanPsychrometricService) { }
  
  ngOnInit(): void {
    this.fsat = this.assessment.fsat;
    this.checkShowPlaneResults();
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
    this.checkWarnings();
  }

  checkWarnings() {
    if (this.fsat && this.fsat.outputs) {
      this.baselineWarnings = this.fanPsychrometricService.checkWarnings(this.fsat.outputs.psychrometricResults);
      if (this.fsat.modifications && this.fsat.modifications.length > 0) {
        // Firs tmod that has warning 
        this.fsat.modifications.some(modification => {
          this.modificationWarnings = this.fanPsychrometricService.checkWarnings(modification.fsat.outputs.psychrometricResults);
          this.modificationWarnings.modificationName = modification.fsat.name;
          return this.modificationWarnings.hasResultWarning;
        });
      }
    }
  }


  checkShowPlaneResults() {
    let showModPlaneResults: boolean = this.fsat.modifications.some(modification => modification.fsat.outputs.planeResults !== undefined);
    this.showPlaneResults = this.fsat.outputs.planeResults !== undefined || showModPlaneResults;
  }

}
