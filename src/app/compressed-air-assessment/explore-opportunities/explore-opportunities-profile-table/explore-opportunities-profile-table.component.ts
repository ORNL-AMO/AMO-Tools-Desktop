import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentResult, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

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
  modificationResults: CompressedAirAssessmentResult;
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

    this.modificationResultsSub =  this.exploreOpportunitiesService.modificationResults.subscribe(val => {
      this.modificationResults = val;
      this.setProfile();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  setProfile() {
    if (this.selectedDayType && this.modificationResults) {
      let dayTypeModificationResult: DayTypeModificationResult = this.modificationResults.dayTypeModificationResults.find(modResult => {return modResult.dayTypeId == this.selectedDayType.dayTypeId});
      this.adjustedProfileSummary = dayTypeModificationResult.adjustedProfileSummary;
      this.totals = dayTypeModificationResult.profileSummaryTotals;
    }
  }

}
