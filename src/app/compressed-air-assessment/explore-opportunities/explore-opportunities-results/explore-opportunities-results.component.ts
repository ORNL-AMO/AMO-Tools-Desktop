import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.adjustedProfileSummary = this.systemProfileService.flowReallocation(val);
        this.totals = this.systemProfileService.calculateProfileSummaryTotals(val, this.adjustedProfileSummary);
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

}
