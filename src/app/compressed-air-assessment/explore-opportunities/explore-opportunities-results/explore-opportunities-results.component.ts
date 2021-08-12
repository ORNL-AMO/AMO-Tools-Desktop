import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile/system-profile.service';

@Component({
  selector: 'app-explore-opportunities-results',
  templateUrl: './explore-opportunities-results.component.html',
  styleUrls: ['./explore-opportunities-results.component.css']
})
export class ExploreOpportunitiesResultsComponent implements OnInit {
  compressedAirAssessmentSub: Subscription;
  adjustedProfileSummary: Array<ProfileSummary>;
  totals: Array<ProfileSummaryTotal>;
  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;
  dayTypeResult: {
    baselineResults: { cost: number, power: number, peakDemand: number },
    adjustedResults: { cost: number, power: number, peakDemand: number },
    savings: { cost: number, power: number, peakDemand: number }
  };
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
        if (!this.selectedDayType) {
          this.selectedDayType = this.dayTypeOptions[0];
        }
        this.calculateProfile();
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  calculateProfile() {
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
    this.adjustedProfileSummary = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modification, true);
    this.totals = this.systemProfileService.calculateProfileSummaryTotals(this.compressedAirAssessment, this.selectedDayType, this.adjustedProfileSummary);
    this.dayTypeResult = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, this.adjustedProfileSummary, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
  }

}
