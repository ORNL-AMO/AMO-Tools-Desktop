import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../../shared/models/assessment';
import { Settings } from '../../../../../shared/models/settings';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { FsatService } from '../../../../../fsat/fsat.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FsatOutput, FSAT } from '../../../../../shared/models/fans';
import { AssessmentService } from '../../../../assessment.service';

@Component({
  selector: 'app-fsat-summary-card',
  templateUrl: './fsat-summary-card.component.html',
  styleUrls: ['./fsat-summary-card.component.css']
})
export class FsatSummaryCardComponent implements OnInit {
  @Input()
  assessment: Assessment;

  settings: Settings;
  numMods: number = 0;
  maxCostSavings: number = 0;
  maxEnergySavings: number = 0;
  showReport: boolean = false;

  @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;
  baseline: FSAT;
  fsatResults: FsatOutput;
  setupDone: boolean = true;
  constructor(private settingsDbService: SettingsDbService, private fsatService: FsatService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.setupDone = this.assessment.fsat.setupDone;
    if (this.setupDone) {
      this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
      this.fsatResults = this.getResults(JSON.parse(JSON.stringify(this.assessment.fsat)), this.settings);
      if (this.assessment.fsat.modifications) {
        this.numMods = this.assessment.fsat.modifications.length;
        this.assessment.fsat.modifications.forEach(mod => {
          let modOutputs: FsatOutput = this.getResults(mod.fsat, this.settings, true);
          if (mod.fsat.valid.isValid) {
            let tmpSavingCalc = this.fsatResults.annualCost - modOutputs.annualCost;
            let tmpSavingEnergy = this.fsatResults.annualEnergy - modOutputs.annualEnergy;
            if (tmpSavingCalc > this.maxCostSavings) {
              this.maxCostSavings = tmpSavingCalc;
              this.maxEnergySavings = tmpSavingEnergy;
            }
          }
        });
      }
    }
  }

  getResults(fsat: FSAT, settings: Settings, isModification?: boolean): FsatOutput {
    fsat.valid = this.fsatService.checkValid(fsat, !isModification, settings);
    if (fsat.valid.isValid) {
      return this.fsatService.getResults(JSON.parse(JSON.stringify(fsat)), !isModification, settings);
    } else {
      return this.fsatService.getEmptyResults();
    }
  }

  goToAssessment(assessment: Assessment, str?: string, str2?: string) {
    this.assessmentService.goToAssessment(assessment, str, str2);
  }


  showReportModal() {
    this.showReport = true;
    this.reportModal.show();
  }

  hideReportModal() {
    this.reportModal.hide();
    this.showReport = false;
  }
}
