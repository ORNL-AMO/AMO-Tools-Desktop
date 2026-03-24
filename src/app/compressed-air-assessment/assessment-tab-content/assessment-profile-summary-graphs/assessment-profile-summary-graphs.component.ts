import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities/explore-opportunities.service';
import { CompressedAirModifiedDayTypeProfileSummary } from '../../calculations/modifications/CompressedAirModifiedDayTypeProfileSummary';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';

@Component({
  selector: 'app-assessment-profile-summary-graphs',
  templateUrl: './assessment-profile-summary-graphs.component.html',
  styleUrl: './assessment-profile-summary-graphs.component.css',
  standalone: false
})
export class AssessmentProfileSummaryGraphsComponent {

  compressedAirAssessmentSub: Subscription;
  selectedDayType: CompressedAirDayType;
  selectedDayTypeSub: Subscription;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;
  modification: Modification;
  modificationSub: Subscription;
  modificationResultsSub: Subscription;
  compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults;
  compressedAirModifiedDayTypeProfileSummary: CompressedAirModifiedDayTypeProfileSummary;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
      }
    });

    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      if (!this.selectedDayType && this.dayTypeOptions && this.dayTypeOptions.length != 0) {
        this.exploreOpportunitiesService.selectedDayType.next(this.dayTypeOptions[0]);
      }
      this.setModificationProfileSummary();
    });

    this.modificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.modification = val;
    });

    this.modificationResultsSub = this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.compressedAirAssessmentModificationResults = val;
      this.setModificationProfileSummary();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
    this.modificationSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  changeDayType() {
    this.exploreOpportunitiesService.selectedDayType.next(this.selectedDayType);
  }

  setModificationProfileSummary() {
    if (this.selectedDayType && this.compressedAirAssessmentModificationResults) {
      this.compressedAirModifiedDayTypeProfileSummary = this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(summary => summary.dayType.dayTypeId == this.selectedDayType.dayTypeId);
    }
  }

}
