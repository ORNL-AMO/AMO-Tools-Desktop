import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../../shared/models/assessment';
import { TreasureHuntReportService } from '../../../../../treasure-hunt/treasure-hunt-report/treasure-hunt-report.service';
import { TreasureHuntResults, UtilityUsageData } from '../../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../../shared/models/settings';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AssessmentService } from '../../../../assessment.service';

@Component({
    selector: 'app-treasure-hunt-summary-card',
    templateUrl: './treasure-hunt-summary-card.component.html',
    styleUrls: ['./treasure-hunt-summary-card.component.css'],
    standalone: false
})
export class TreasureHuntSummaryCardComponent implements OnInit {
  @Input()
  assessment: Assessment;

  @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;

  results: TreasureHuntResults;
  settings: Settings;
  setupDone: boolean;
  numberOfOpportunities: number;
  utilitySavings: Array<{ utilityType: string, baselineCost: number, modificationCost: number }>;
  showReport: boolean = false;
  constructor(private treasureHuntReportService: TreasureHuntReportService, private settingsDbService: SettingsDbService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
    this.setupDone = this.assessment.treasureHunt.setupDone;
    if (this.setupDone) {
      this.results = this.treasureHuntReportService.calculateTreasureHuntResults(this.assessment.treasureHunt, this.settings);
      this.numberOfOpportunities = this.results.opportunitySummaries.length;
      this.setUtilitySavings();
    }
  }

  setUtilitySavings() {
    this.utilitySavings = new Array();
    if (this.results.electricity.baselineEnergyCost != 0) {
      let savingsObj: { utilityType: string, baselineCost: number, modificationCost: number } = this.getSavingsObj('Electricity', this.results.electricity);
      this.utilitySavings.push(savingsObj);
    }
    if (this.results.naturalGas.baselineEnergyCost != 0) {
      let savingsObj: { utilityType: string, baselineCost: number, modificationCost: number } = this.getSavingsObj('Natural Gas', this.results.naturalGas);
      this.utilitySavings.push(savingsObj);
    }
    if (this.results.water.baselineEnergyCost != 0) {
      let savingsObj: { utilityType: string, baselineCost: number, modificationCost: number } = this.getSavingsObj('Water', this.results.water);
      this.utilitySavings.push(savingsObj);
    }
    if (this.results.wasteWater.baselineEnergyCost != 0) {
      let savingsObj: { utilityType: string, baselineCost: number, modificationCost: number } = this.getSavingsObj('Waste Water', this.results.wasteWater);
      this.utilitySavings.push(savingsObj);
    }
    if (this.results.otherFuel.baselineEnergyCost != 0) {
      let savingsObj: { utilityType: string, baselineCost: number, modificationCost: number } = this.getSavingsObj('Other Fuel', this.results.otherFuel);
      this.utilitySavings.push(savingsObj);
    }
    if (this.results.compressedAir.baselineEnergyCost != 0) {
      let savingsObj: { utilityType: string, baselineCost: number, modificationCost: number } = this.getSavingsObj('Compressed Air', this.results.compressedAir);
      this.utilitySavings.push(savingsObj);
    }
    if (this.results.steam.baselineEnergyCost != 0) {
      let savingsObj: { utilityType: string, baselineCost: number, modificationCost: number } = this.getSavingsObj('Steam', this.results.steam);
      this.utilitySavings.push(savingsObj);
    }
  }

  getSavingsObj(type: string, usageData: UtilityUsageData): { utilityType: string, baselineCost: number, modificationCost: number } {
    return {
      utilityType: type,
      baselineCost: usageData.baselineEnergyCost,
      modificationCost: usageData.modifiedEnergyCost
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
