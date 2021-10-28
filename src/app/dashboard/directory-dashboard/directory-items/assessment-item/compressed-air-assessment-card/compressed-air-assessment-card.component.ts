import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService } from '../../../../../compressed-air-assessment/compressed-air-assessment-results.service';
import { CompressedAirModificationValid, ExploreOpportunitiesValidationService } from '../../../../../compressed-air-assessment/explore-opportunities/explore-opportunities-validation.service';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { Assessment } from '../../../../../shared/models/assessment';
import { CompressedAirDayType, ProfileSummary, ProfileSummaryTotal } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { AssessmentService } from '../../../../assessment.service';

@Component({
  selector: 'app-compressed-air-assessment-card',
  templateUrl: './compressed-air-assessment-card.component.html',
  styleUrls: ['./compressed-air-assessment-card.component.css']
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
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.setupDone = this.assessment.compressedAirAssessment.setupDone;
    if (this.setupDone) {
      this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
      this.baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(this.assessment.compressedAirAssessment);
      this.numMods = this.assessment.compressedAirAssessment.modifications.length;

      let baselineProfileSummaries: Array<{ profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }> = new Array();
      this.assessment.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        let profileSummary: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.assessment.compressedAirAssessment, dayType);
        let profileSummaryTotals: Array<ProfileSummaryTotal> = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(
          this.assessment.compressedAirAssessment.compressorInventoryItems, dayType, profileSummary, this.assessment.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval
        )
        baselineProfileSummaries.push({
          dayType: dayType,
          profileSummary: profileSummary,
          profileSummaryTotals: profileSummaryTotals
        });
      });

      this.assessment.compressedAirAssessment.modifications.forEach(modification => {
        let modificationValid: CompressedAirModificationValid = this.exploreOpportunitiesValidationService.checkModificationValid(modification, this.baselineResults, baselineProfileSummaries, this.assessment.compressedAirAssessment)
        if (modificationValid) {
          let modificationResults: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.assessment.compressedAirAssessment, modification);
          if (modificationResults.totalCostSavings > this.maxCostSavings) {
            this.maxCostSavings = modificationResults.totalCostSavings;
          }
          //divide /1000 kWh -> MWh
          if ((modificationResults.totalCostPower / 1000) > this.maxEnergySavings) {
            this.maxEnergySavings = modificationResults.totalCostPower / 1000;
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
