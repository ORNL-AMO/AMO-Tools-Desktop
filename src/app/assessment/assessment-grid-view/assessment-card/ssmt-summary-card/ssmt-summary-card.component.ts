import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../shared/models/assessment';
import { CalculateModelService } from '../../../../ssmt/ssmt-calculations/calculate-model.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { AssessmentService } from '../../../assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../../../shared/models/settings';
import { SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { SSMTInputs, SSMT } from '../../../../shared/models/steam/ssmt';

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
      this.getBaselineData();
      if (this.assessment.ssmt.modifications) {
        this.getModificationData();
      }
    }
  }

  getBaselineData() {
    this.baselineData = this.getData(this.assessment.ssmt, true);
  }

  getModificationData() {
    this.numMods = this.assessment.ssmt.modifications.length;
    this.assessment.ssmt.modifications.forEach(mod => {
      let results: { inputData: SSMTInputs, outputData: SSMTOutput } = this.getData(mod.ssmt, false);
      if (results.outputData.boilerOutput) {
        let tmpSavingCalc = this.baselineData.outputData.totalOperatingCost - results.outputData.totalOperatingCost;
        let tmpSavingEnergy = this.baselineData.outputData.boilerFuelUsage - results.outputData.boilerFuelUsage;
        if (tmpSavingCalc > this.maxCostSavings) {
          this.maxCostSavings = tmpSavingCalc;
          this.maxEnergySavings = tmpSavingEnergy;
        }
      }
    });
  }

  getData(ssmt: SSMT, isBaseline: boolean): { inputData: SSMTInputs, outputData: SSMTOutput } {
    if (ssmt.resultsCalculated) {
      let inputData: SSMTInputs = this.calculateModelService.getInputDataFromSSMT(ssmt);
      return {
        inputData: inputData,
        outputData: ssmt.outputData
      }
    } else if (isBaseline) {
      return this.calculateModelService.initDataAndRun(ssmt, this.settings, true, false);
    } else {
      return this.calculateModelService.initDataAndRun(ssmt, this.settings, false, false, this.baselineData.outputData.sitePowerDemand);
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
