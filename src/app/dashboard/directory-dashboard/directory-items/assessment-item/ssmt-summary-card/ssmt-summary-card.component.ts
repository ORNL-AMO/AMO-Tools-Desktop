import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../../shared/models/assessment';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Settings } from '../../../../../shared/models/settings';
import { SSMTOutput } from '../../../../../shared/models/steam/steam-outputs';
import { SSMTInputs, SSMT } from '../../../../../shared/models/steam/ssmt';
import { SsmtService } from '../../../../../ssmt/ssmt.service';
import { AssessmentService } from '../../../../assessment.service';

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
  totalBaselineCost: number = 0;

  @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;

  assessmentCpy: Assessment;
  constructor(private ssmtService: SsmtService, private settingsDbService: SettingsDbService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.assessmentCpy = JSON.parse(JSON.stringify(this.assessment));
    this.setupDone = this.assessmentCpy.ssmt.setupDone;
    this.settings = this.settingsDbService.getByAssessmentId(this.assessmentCpy);
    if (this.setupDone) {
      this.getBaselineData();
      if (this.baselineData.outputData.boilerOutput == undefined) {
        this.setupDone = false;
      }
      if (this.assessmentCpy.ssmt.modifications && this.setupDone) {
        this.getModificationData();
      }
    }
  }

  getBaselineData() {
    this.baselineData = this.getData(this.assessmentCpy.ssmt, true);
    this.totalBaselineCost = (this.baselineData.outputData.operationsOutput.boilerFuelCost + this.baselineData.outputData.operationsOutput.makeupWaterCost);
  }

  getModificationData() {
    this.numMods = this.assessmentCpy.ssmt.modifications.length;
    this.assessmentCpy.ssmt.modifications.forEach(mod => {
      let results: { inputData: SSMTInputs, outputData: SSMTOutput } = this.getData(mod.ssmt, false);
      if (results.outputData.boilerOutput) {
        let tmpSavingCalc = this.baselineData.outputData.operationsOutput.totalOperatingCost - results.outputData.operationsOutput.totalOperatingCost;
        let tmpSavingEnergy = this.baselineData.outputData.operationsOutput.boilerFuelUsage - results.outputData.operationsOutput.boilerFuelUsage;
        if (tmpSavingCalc > this.maxCostSavings) {
          this.maxCostSavings = tmpSavingCalc;
          this.maxEnergySavings = tmpSavingEnergy;
        }
      }
    });
  }

  getData(ssmt: SSMT, isBaseline: boolean): { inputData: SSMTInputs, outputData: SSMTOutput } {
    if (isBaseline) {
      return this.ssmtService.calculateBaselineModel(ssmt, this.settings);
    } else {
      return this.ssmtService.calculateModificationModel(ssmt, this.settings, this.baselineData.outputData);
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
