import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities/explore-opportunities.service';
import { CompressedAirModifiedDayTypeProfileSummary } from '../../calculations/modifications/CompressedAirModifiedDayTypeProfileSummary';

@Component({
  selector: 'app-assessment-profile-summary-table',
  templateUrl: './assessment-profile-summary-table.component.html',
  styleUrl: './assessment-profile-summary-table.component.css',
  standalone: false
})
export class AssessmentProfileSummaryTableComponent {
  compressedAirAssessmentSub: Subscription;
  adjustedProfileSummary: Array<ProfileSummary>;
  totals: Array<ProfileSummaryTotal>;
  selectedDayType: CompressedAirDayType;
  selectedDayTypeSub: Subscription;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;
  compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults;
  modificationResultsSub: Subscription;
  settings: Settings;
  inventoryItems: Array<CompressorInventoryItem>
  trimSelections: Array<{ dayTypeId: string, compressorId: string }>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
      }
    });

    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      if(!this.selectedDayType && this.dayTypeOptions && this.dayTypeOptions.length != 0){
        this.exploreOpportunitiesService.selectedDayType.next(this.dayTypeOptions[0]);
      }
      this.setProfile();
    });


    this.modificationResultsSub = this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.compressedAirAssessmentModificationResults = val;
      this.setProfile();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  setProfile() {
    if (this.selectedDayType && this.compressedAirAssessmentModificationResults) {
      let dayTypeModificationResult: CompressedAirModifiedDayTypeProfileSummary = this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(modResult => { return modResult.dayType.dayTypeId == this.selectedDayType.dayTypeId });
      this.adjustedProfileSummary = dayTypeModificationResult.adjustedProfileSummary;
      this.totals = dayTypeModificationResult.adjustedProfileSummaryTotals;
      this.inventoryItems = dayTypeModificationResult.adjustedCompressors;
      this.trimSelections = dayTypeModificationResult.trimSelections;
    }
  }

  changeDayType() {
    this.exploreOpportunitiesService.selectedDayType.next(this.selectedDayType);
  }
}
