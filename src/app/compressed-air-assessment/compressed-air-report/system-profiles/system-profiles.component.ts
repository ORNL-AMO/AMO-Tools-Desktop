import { Component, Input, OnInit } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfilesForPrint, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';

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
  baselineProfileSummaries: Array<{ profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType }>;
  @Input()
  assessmentResults: Array<CompressedAirAssessmentResult>;
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
      this.selectedProfileSummary = this.baselineProfileSummaries.find(summary => { return summary.dayType.dayTypeId == this.selectedDayType.dayTypeId }).profileSummary;
      this.selectedTotals = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(this.compressedAirAssessment.compressorInventoryItems, this.selectedDayType, this.selectedProfileSummary, this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval);
    } else if (this.selectedDayType && this.selectedModification) {
      //day type and modification
      let assessmentResult: CompressedAirAssessmentResult = this.assessmentResults.find(result => { return result.modification.modificationId == this.selectedModification.modificationId });
      let dayTypeModificationResult: DayTypeModificationResult = assessmentResult.dayTypeModificationResults.find(modificationResult => { return modificationResult.dayTypeId == this.selectedDayType.dayTypeId });
      this.selectedProfileSummary = dayTypeModificationResult.adjustedProfileSummary;
      this.selectedTotals = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(dayTypeModificationResult.adjustedCompressors, this.selectedDayType, this.selectedProfileSummary, this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval, this.selectedModification.improveEndUseEfficiency);
    }     
    if (this.printView) {
      this.profliesForPrint = this.compressedAirAssessmentResultsService.setProfileSummariesForPrinting(this.compressedAirAssessment, this.baselineProfileSummaries);
    }
    // else if (!this.selectedDayType && this.selectedModification) {
    //   //no day type (combined) and modification
    //   let combinedModificationResult: { modification: Modification, combinedResults: DayTypeModificationResult } = this.combinedDayTypeResults.find(result => { return result.modification.modificationId == this.selectedModification.modificationId });
    //   this.selectedProfileSummary = combinedModificationResult.combinedResults.adjustedProfileSummary;
    //   this.selectedTotals = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(combinedModificationResult.combinedResults.adjustedCompressors, this.selectedDayType, this.selectedProfileSummary);
    // }


  }
}