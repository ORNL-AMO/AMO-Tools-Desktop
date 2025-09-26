import { Component, Input, OnInit } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfilesForPrint, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentResult, DayTypeModificationResult } from '../../calculations/caCalculationModels';
import { CompressedAirAssessmentBaselineResults } from '../../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirBaselineDayTypeProfileSummary } from '../../calculations/CompressedAirBaselineDayTypeProfileSummary';
import { CompressedAirModifiedDayTypeProfileSummary } from '../../calculations/modifications/CompressedAirModifiedDayTypeProfileSummary';

@Component({
    selector: 'app-system-profiles',
    templateUrl: './system-profiles.component.html',
    styleUrls: ['./system-profiles.component.css'],
    standalone: false
})
export class SystemProfilesComponent implements OnInit {
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults
  @Input()
  assessmentResults: Array<CompressedAirAssessmentModificationResults>;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  // @Input()
  // combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult }>;


  selectedProfileSummary: Array<ProfileSummary>;
  selectedTotals: Array<ProfileSummaryTotal>;
  selectedDayType: CompressedAirDayType;
  selectedModification: Modification;
  profliesForPrint: Array<ProfilesForPrint>;

  constructor(private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
    this.setSelectedProfileSummary();
  }

  setSelectedProfileSummary() {
    if (this.selectedDayType && !this.selectedModification) {
      //Day type and baseline
      let baselineDayTypeProfileSummary: CompressedAirBaselineDayTypeProfileSummary = this.compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.find(summary => { return summary.dayType.dayTypeId == this.selectedDayType.dayTypeId });
      this.selectedProfileSummary = baselineDayTypeProfileSummary.profileSummary;
      this.selectedTotals = baselineDayTypeProfileSummary.profileSummaryTotals;
    } else if (this.selectedDayType && this.selectedModification) {
      //day type and modification
      let modificationResults: CompressedAirAssessmentModificationResults = this.assessmentResults.find(result => { return result.modification.modificationId == this.selectedModification.modificationId });
      let dayTypeModificationResults: CompressedAirModifiedDayTypeProfileSummary = modificationResults.modifiedDayTypeProfileSummaries.find(summary => { return summary.dayType.dayTypeId == this.selectedDayType.dayTypeId });
      let dayTypeModificationResult: DayTypeModificationResult = dayTypeModificationResults.getDayTypeModificationResult();
      this.selectedProfileSummary = dayTypeModificationResult.adjustedProfileSummary;
      this.selectedTotals = dayTypeModificationResult.profileSummaryTotals;
    }     
    if (this.printView) {
      this.profliesForPrint = this.compressedAirAssessmentResultsService.setProfileSummariesForPrinting(this.compressedAirAssessmentBaselineResults);
    }
    // else if (!this.selectedDayType && this.selectedModification) {
    //   //no day type (combined) and modification
    //   let combinedModificationResult: { modification: Modification, combinedResults: DayTypeModificationResult } = this.combinedDayTypeResults.find(result => { return result.modification.modificationId == this.selectedModification.modificationId });
    //   this.selectedProfileSummary = combinedModificationResult.combinedResults.adjustedProfileSummary;
    //   this.selectedTotals = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(combinedModificationResult.combinedResults.adjustedCompressors, this.selectedDayType, this.selectedProfileSummary);
    // }


  }
}