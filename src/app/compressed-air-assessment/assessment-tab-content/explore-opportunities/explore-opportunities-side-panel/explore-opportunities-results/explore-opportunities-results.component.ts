import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../../../../compressed-air-assessment-validation/explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { Settings } from '../../../../../shared/models/settings';
import { BaselineResult, DayTypeModificationResult } from '../../../../calculations/caCalculationModels';
import { CompressedAirCombinedDayTypeResults } from '../../../../calculations/modifications/CompressedAirCombinedDayTypeResults';
import { CompressedAirAssessmentModificationResults } from '../../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirAssessmentBaselineResults } from '../../../../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirModificationValid } from '../../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';

@Component({
  selector: 'app-explore-opportunities-results',
  templateUrl: './explore-opportunities-results.component.html',
  styleUrls: ['./explore-opportunities-results.component.css'],
  standalone: false
})
export class ExploreOpportunitiesResultsComponent implements OnInit {
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;

  selectedDayTypeSub: Subscription;
  selectedDayType: CompressedAirDayType;

  modificationSub: Subscription;
  modification: Modification;

  modificationResults: CompressedAirAssessmentModificationResults;
  modificationResultsSub: Subscription;
  
  dayTypeModificationResult: DayTypeModificationResult;
  dayTypeBaselineResult: BaselineResult;

  validationStatusSub: Subscription;
  compressedAirModificationValid: CompressedAirModificationValid;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;

    this.validationStatusSub = this.exploreOpportunitiesValidationService.compressedAirModificationValid.subscribe(val => {
      this.compressedAirModificationValid = val;
    });

    this.modificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.modification = val;
    });

    this.modificationResultsSub = this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.modificationResults = val;
      this.setResults();
    });

    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = this.compressedAirAssessmentService.compressedAirAssessmentBaselineResults.getValue();
      if (compressedAirAssessmentBaselineResults && val) {
        this.dayTypeBaselineResult = compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.find(result => { return result.dayType.dayTypeId == val.dayTypeId }).baselineResult
      } else if (compressedAirAssessmentBaselineResults) {
        this.dayTypeBaselineResult = compressedAirAssessmentBaselineResults.baselineResults.total;
      }
      this.setResults();
    });
  }

  ngOnDestroy() {
    this.modificationResultsSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
    this.validationStatusSub.unsubscribe();
  }

  setResults() {
    if (this.modificationResults && this.selectedDayType) {
      this.dayTypeModificationResult = this.modificationResults.modifiedDayTypeProfileSummaries.find(modResult => { return modResult.dayType.dayTypeId == this.selectedDayType.dayTypeId }).getDayTypeModificationResult();
    } else if (this.modificationResults && !this.selectedDayType) {
      this.dayTypeModificationResult = new CompressedAirCombinedDayTypeResults(this.modificationResults).getDayTypeModificationResult();
    }
    console.log('modification result', this.dayTypeModificationResult);
    console.log('baseline result', this.dayTypeBaselineResult);
  }

}

