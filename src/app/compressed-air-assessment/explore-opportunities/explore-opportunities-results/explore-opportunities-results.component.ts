import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { BaselineResult, BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

@Component({
  selector: 'app-explore-opportunities-results',
  templateUrl: './explore-opportunities-results.component.html',
  styleUrls: ['./explore-opportunities-results.component.css']
})
export class ExploreOpportunitiesResultsComponent implements OnInit {
  compressedAirAssessmentSub: Subscription;
  adjustedProfileSummary: Array<ProfileSummary>;
  totals: Array<ProfileSummaryTotal>;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;

  selectedDayTypeSub: Subscription;
  selectedDayType: CompressedAirDayType;

  modification: Modification;
  modificationResults: CompressedAirAssessmentResult;
  modificationResultsSub: Subscription;
  dayTypeModificationResult: DayTypeModificationResult;
  baselineResults: BaselineResults;
  dayTypeBaselineResult: BaselineResult;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        if(!this.baselineResults){
          this.baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(val);
        }

        this.compressedAirAssessment = val;
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
        let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
        this.modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
        this.setResults();
      }
    });

    this.modificationResultsSub = this.exploreOpportunitiesService.modificationResults.subscribe(val => {
      this.modificationResults = val;
      this.setResults();
    });

    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      if(this.baselineResults && val){
        this.dayTypeBaselineResult = this.baselineResults.dayTypeResults.find(result => {return result.dayTypeId == val.dayTypeId})
      }else{
        this.dayTypeBaselineResult = this.baselineResults.total;
      }
      this.setResults();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
  }

  setResults() {
    if (this.modificationResults && this.selectedDayType) {
      this.dayTypeModificationResult = this.modificationResults.dayTypeModificationResults.find(modResult => { return modResult.dayTypeId == this.selectedDayType.dayTypeId });
    } else if (this.modificationResults && !this.selectedDayType) {
      this.dayTypeModificationResult = this.compressedAirAssessmentResultsService.combineDayTypeResults(this.modificationResults);
    }
  }


  
}

