import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../shared/models/assessment';
import { CalculateModelService } from '../../../../ssmt/ssmt-calculations/calculate-model.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { AssessmentService } from '../../../assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../../../shared/models/settings';
import { SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-ssmt-summary-card',
  templateUrl: './ssmt-summary-card.component.html',
  styleUrls: ['./ssmt-summary-card.component.css']
})
export class SsmtSummaryCardComponent implements OnInit {
  @Input()
  assessment: Assessment;
  baselineData: { inputData: SSMTInputs, outputData: SSMTOutput };
  settings: Settings;
  numMods: number = 0;
  setupDone: boolean;
  maxCostSavings: number = 0;
  maxEnergySavings: number = 0;

  showReport: boolean = false;

  @ViewChild('reportModal') public reportModal: ModalDirective;

  constructor(private calculateModelService: CalculateModelService, private settingsDbService: SettingsDbService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.setupDone = this.assessment.ssmt.setupDone;
    if (this.setupDone) {
      this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
      this.calculateModelService.initData(this.assessment.ssmt, this.settings, true);
      this.baselineData = this.calculateModelService.calculateModelRunner();
      if (this.assessment.ssmt.modifications) {
        this.numMods = this.assessment.ssmt.modifications.length;
        this.assessment.ssmt.modifications.forEach(mod => {
          this.calculateModelService.initData(mod.ssmt, this.settings, false, this.baselineData.outputData.sitePowerDemand);
          let tmpResults: { inputData: SSMTInputs, outputData: SSMTOutput } = this.calculateModelService.calculateModelRunner();;
          let tmpSavingCalc = this.baselineData.outputData.totalOperatingCost - tmpResults.outputData.totalOperatingCost;
          let tmpSavingEnergy = this.baselineData.outputData.boilerFuelUsage - tmpResults.outputData.boilerFuelUsage;
          if (tmpSavingCalc > this.maxCostSavings) {
            this.maxCostSavings = tmpSavingCalc;
            this.maxEnergySavings = tmpSavingEnergy;
          }
        });
      }
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
