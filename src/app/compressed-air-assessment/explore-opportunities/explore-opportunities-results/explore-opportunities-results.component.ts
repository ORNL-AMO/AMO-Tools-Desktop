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
      flowReallocationSavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      addReceiverVolumeSavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      adjustCascadingSetPointsSavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      improveEndUseEfficiencySavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      reduceAirLeaksSavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      reduceRunTimeSavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      reduceSystemAirPressureSavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      useAutomaticSequencerSavings: this.compressedAirAssessmentResultsService.getEmptyEemSavings(),
      reduceRunTimeProfileSummary: undefined,
      flowAllocationProfileSummary: undefined,
      reduceAirLeaksProfileSummary: undefined,
      addReceiverVolumeProfileSummary: undefined,
      useAutomaticSequencerProfileSummary: undefined,
      improveEndUseEfficiencyProfileSummary: undefined,
      reduceSystemAirPressureProfileSummary: undefined,
      adjustCascadingSetPointsProfileSummary: undefined,
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


      dayTypeModificationResult.flowReallocationSavings.savings.cost += modResult.flowReallocationSavings.savings.cost;
      dayTypeModificationResult.flowReallocationSavings.savings.power += modResult.flowReallocationSavings.savings.power;

      dayTypeModificationResult.addReceiverVolumeSavings.savings.cost += modResult.addReceiverVolumeSavings.savings.cost;
      dayTypeModificationResult.addReceiverVolumeSavings.savings.power += modResult.addReceiverVolumeSavings.savings.power;

      dayTypeModificationResult.adjustCascadingSetPointsSavings.savings.cost += modResult.adjustCascadingSetPointsSavings.savings.cost;
      dayTypeModificationResult.adjustCascadingSetPointsSavings.savings.power += modResult.adjustCascadingSetPointsSavings.savings.power;

      dayTypeModificationResult.improveEndUseEfficiencySavings.savings.cost += modResult.improveEndUseEfficiencySavings.savings.cost;
      dayTypeModificationResult.improveEndUseEfficiencySavings.savings.power += modResult.improveEndUseEfficiencySavings.savings.power;

      dayTypeModificationResult.reduceAirLeaksSavings.savings.cost += modResult.reduceAirLeaksSavings.savings.cost;
      dayTypeModificationResult.reduceAirLeaksSavings.savings.power += modResult.reduceAirLeaksSavings.savings.power;

      dayTypeModificationResult.reduceRunTimeSavings.savings.cost += modResult.reduceRunTimeSavings.savings.cost;
      dayTypeModificationResult.reduceRunTimeSavings.savings.power += modResult.reduceRunTimeSavings.savings.power;

      dayTypeModificationResult.reduceSystemAirPressureSavings.savings.cost += modResult.reduceSystemAirPressureSavings.savings.cost;
      dayTypeModificationResult.reduceSystemAirPressureSavings.savings.power += modResult.reduceSystemAirPressureSavings.savings.power;

      dayTypeModificationResult.useAutomaticSequencerSavings.savings.cost += modResult.useAutomaticSequencerSavings.savings.cost;
      dayTypeModificationResult.useAutomaticSequencerSavings.savings.power += modResult.useAutomaticSequencerSavings.savings.power;

    });
    dayTypeModificationResult.allSavingsResults.savings.percentSavings = ((dayTypeModificationResult.allSavingsResults.baselineResults.cost - dayTypeModificationResult.allSavingsResults.adjustedResults.cost) / dayTypeModificationResult.allSavingsResults.baselineResults.cost) * 100
    return dayTypeModificationResult;
  }

}

