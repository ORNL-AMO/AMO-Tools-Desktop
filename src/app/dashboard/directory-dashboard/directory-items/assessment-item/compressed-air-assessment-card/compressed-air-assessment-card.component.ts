import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompressedAirModificationValid, ExploreOpportunitiesValidationService } from '../../../../../compressed-air-assessment/explore-opportunities/explore-opportunities-validation.service';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { Assessment } from '../../../../../shared/models/assessment';
import { CompressedAirDayType, ProfileSummary, ProfileSummaryTotal } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { AssessmentService } from '../../../../assessment.service';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment/compressed-air-assessment.service';
import { BaselineResults } from '../../../../../compressed-air-assessment/calculations/caCalculationModels'
import { CompressedAirAssessmentBaselineResults } from '../../../../../compressed-air-assessment/calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../../../../../compressed-air-assessment/compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessmentModificationResults } from '../../../../../compressed-air-assessment/calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirBaselineDayTypeProfileSummary } from '../../../../../compressed-air-assessment/calculations/CompressedAirBaselineDayTypeProfileSummary';

@Component({
  selector: 'app-compressed-air-assessment-card',
  templateUrl: './compressed-air-assessment-card.component.html',
  styleUrls: ['./compressed-air-assessment-card.component.css'],
  standalone: false
})
export class CompressedAirAssessmentCardComponent implements OnInit {
  @Input()
  assessment: Assessment;

  @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;

  settings: Settings;
  numMods: number = 0;
  maxEnergySavings: number = 0;
  maxCostSavings: number = 0;
  baselineResults: BaselineResults;
  setupDone: boolean;
  showReport: boolean;

  constructor(private assessmentService: AssessmentService, private settingsDbService: SettingsDbService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentService.setIsSetupDone(this.assessment.compressedAirAssessment);
    this.setupDone = this.assessment.compressedAirAssessment.setupDone;
    if (this.setupDone) {
      this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(this.assessment.compressedAirAssessment, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
      this.baselineResults = compressedAirAssessmentBaselineResults.baselineResults;
      this.numMods = this.assessment.compressedAirAssessment.modifications.length;

      let baselineProfileSummaries: Array<{ profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }> = new Array();
      this.assessment.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        let compressedAirBaselineDayTypeProfileSummary: CompressedAirBaselineDayTypeProfileSummary = compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.find(summary => { return summary.dayType.dayTypeId == dayType.dayTypeId });
        let profileSummary: Array<ProfileSummary> = compressedAirBaselineDayTypeProfileSummary.profileSummary;
        let profileSummaryTotals: Array<ProfileSummaryTotal> = compressedAirBaselineDayTypeProfileSummary.profileSummaryTotals;
        baselineProfileSummaries.push({
          dayType: dayType,
          profileSummary: profileSummary,
          profileSummaryTotals: profileSummaryTotals
        });
      });

      this.assessment.compressedAirAssessment.modifications.forEach(modification => {
        let modificationValid: CompressedAirModificationValid = this.exploreOpportunitiesValidationService.checkModificationValid(modification, this.baselineResults, baselineProfileSummaries, this.assessment.compressedAirAssessment, this.settings);
        if (modificationValid) {
          let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(this.assessment.compressedAirAssessment, modification, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, compressedAirAssessmentBaselineResults);
          if (compressedAirAssessmentModificationResults.totalCostSavings > this.maxCostSavings) {
            this.maxCostSavings = compressedAirAssessmentModificationResults.totalCostSavings;
          }
          //divide /1000 kWh -> MWh
          if ((compressedAirAssessmentModificationResults.totalPowerSavings / 1000) > this.maxEnergySavings) {
            this.maxEnergySavings = compressedAirAssessmentModificationResults.totalPowerSavings / 1000;
          }
        }
      });
    };
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
