import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirModifiedDayTypeProfileSummary } from '../../calculations/modifications/CompressedAirModifiedDayTypeProfileSummary';

@Component({
    selector: 'app-explore-opportunities-profile-table',
    templateUrl: './explore-opportunities-profile-table.component.html',
    styleUrls: ['./explore-opportunities-profile-table.component.css'],
    standalone: false
})
export class ExploreOpportunitiesProfileTableComponent implements OnInit {
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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      this.setProfile();
    });


    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
      }
    });

    this.modificationResultsSub =  this.exploreOpportunitiesService.compressedAirAssessmentModificationResults.subscribe(val => {
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
      let dayTypeModificationResult: CompressedAirModifiedDayTypeProfileSummary = this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(modResult => {return modResult.dayType.dayTypeId == this.selectedDayType.dayTypeId});
      this.adjustedProfileSummary = dayTypeModificationResult.adjustedProfileSummary;
      this.totals = dayTypeModificationResult.adjustedProfileSummaryTotals;
    }
  }

}
