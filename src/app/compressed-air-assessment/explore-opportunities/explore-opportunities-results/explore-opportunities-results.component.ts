import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';
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
  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;

  modification: Modification;
  modificationResults: CompressedAirAssessmentResult;
  modificationResultsSub: Subscription;
  dayTypeModificationResult: DayTypeModificationResult;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
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
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  setResults() {
    if (this.modificationResults && this.selectedDayType) {
      this.dayTypeModificationResult = this.modificationResults.dayTypeModificationResults.find(modResult => { return modResult.dayTypeId == this.selectedDayType.dayTypeId });
    } else if (this.modificationResults && !this.selectedDayType) {
      this.dayTypeModificationResult = this.combineDayTypeResults();
    }
  }


  combineDayTypeResults(): DayTypeModificationResult {
    let dayTypeModificationResult: DayTypeModificationResult = {
      adjustedProfileSummary: [],
      profileSummaryTotals: [],
      allSavingsResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      flowReallocationResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      addReceiverVolumeResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      adjustCascadingSetPointsResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      improveEndUseEfficiencyResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      reduceAirLeaksResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      reduceRunTimeResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      reduceSystemAirPressureResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      useAutomaticSequencerResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      useUnloadingControlsResults: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      dayTypeId: undefined
    }
    this.modificationResults.dayTypeModificationResults.forEach(modResult => {
      dayTypeModificationResult.allSavingsResults.savings.cost += modResult.allSavingsResults.savings.cost;
      dayTypeModificationResult.allSavingsResults.savings.power += modResult.allSavingsResults.savings.power;
      dayTypeModificationResult.allSavingsResults.baselineResults.cost += modResult.allSavingsResults.baselineResults.cost;
      dayTypeModificationResult.allSavingsResults.baselineResults.power += modResult.allSavingsResults.baselineResults.power;
      dayTypeModificationResult.allSavingsResults.baselineResults.peakDemand += modResult.allSavingsResults.baselineResults.peakDemand;

      dayTypeModificationResult.allSavingsResults.adjustedResults.cost += modResult.allSavingsResults.adjustedResults.cost;
      dayTypeModificationResult.allSavingsResults.adjustedResults.power += modResult.allSavingsResults.adjustedResults.power;
      dayTypeModificationResult.allSavingsResults.adjustedResults.peakDemand += modResult.allSavingsResults.adjustedResults.peakDemand;


      dayTypeModificationResult.flowReallocationResults.savings.cost += modResult.flowReallocationResults.savings.cost;
      dayTypeModificationResult.flowReallocationResults.savings.power += modResult.flowReallocationResults.savings.power;

      dayTypeModificationResult.addReceiverVolumeResults.savings.cost += modResult.addReceiverVolumeResults.savings.cost;
      dayTypeModificationResult.addReceiverVolumeResults.savings.power += modResult.addReceiverVolumeResults.savings.power;

      dayTypeModificationResult.adjustCascadingSetPointsResults.savings.cost += modResult.adjustCascadingSetPointsResults.savings.cost;
      dayTypeModificationResult.adjustCascadingSetPointsResults.savings.power += modResult.adjustCascadingSetPointsResults.savings.power;

      dayTypeModificationResult.improveEndUseEfficiencyResults.savings.cost += modResult.improveEndUseEfficiencyResults.savings.cost;
      dayTypeModificationResult.improveEndUseEfficiencyResults.savings.power += modResult.improveEndUseEfficiencyResults.savings.power;

      dayTypeModificationResult.reduceAirLeaksResults.savings.cost += modResult.reduceAirLeaksResults.savings.cost;
      dayTypeModificationResult.reduceAirLeaksResults.savings.power += modResult.reduceAirLeaksResults.savings.power;

      dayTypeModificationResult.reduceRunTimeResults.savings.cost += modResult.reduceRunTimeResults.savings.cost;
      dayTypeModificationResult.reduceRunTimeResults.savings.power += modResult.reduceRunTimeResults.savings.power;

      dayTypeModificationResult.reduceSystemAirPressureResults.savings.cost += modResult.reduceSystemAirPressureResults.savings.cost;
      dayTypeModificationResult.reduceSystemAirPressureResults.savings.power += modResult.reduceSystemAirPressureResults.savings.power;

      dayTypeModificationResult.useAutomaticSequencerResults.savings.cost += modResult.useAutomaticSequencerResults.savings.cost;
      dayTypeModificationResult.useAutomaticSequencerResults.savings.power += modResult.useAutomaticSequencerResults.savings.power;

      dayTypeModificationResult.useUnloadingControlsResults.savings.cost += modResult.useUnloadingControlsResults.savings.cost;
      dayTypeModificationResult.useUnloadingControlsResults.savings.power += modResult.useUnloadingControlsResults.savings.power;
    });
    return dayTypeModificationResult;
  }

}

