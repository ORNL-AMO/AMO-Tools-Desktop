import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile/system-profile.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

@Component({
  selector: 'app-explore-opportunities-profile-table',
  templateUrl: './explore-opportunities-profile-table.component.html',
  styleUrls: ['./explore-opportunities-profile-table.component.css']
})
export class ExploreOpportunitiesProfileTableComponent implements OnInit {
  compressedAirAssessmentSub: Subscription;
  adjustedProfileSummary: Array<ProfileSummary>;
  totals: Array<ProfileSummaryTotal>;
  selectedDayType: CompressedAirDayType;
  selectedDayTypeSub: Subscription;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      this.calculateProfile();
    });


    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.calculateProfile();
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
  }

  calculateProfile() {
    if (this.compressedAirAssessment && this.selectedDayType) {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      this.adjustedProfileSummary = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modification, true);
      this.totals = this.systemProfileService.calculateProfileSummaryTotals(this.compressedAirAssessment, this.selectedDayType, this.adjustedProfileSummary);
    }
  }

}
