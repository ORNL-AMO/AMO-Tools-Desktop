import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { BaselineResult, BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../explore-opportunities-validation.service';
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




  addReceiverVolumeValid: boolean;
  addReceiverVolumeValidSub: Subscription;
  adjustCascadingSetPointsValid: boolean;
  adjustCascadingSetPointsValidSub: Subscription;
  improveEndUseEfficiencyValid: boolean;
  improveEndUseEfficiencyValidSub: Subscription;
  reduceAirLeaksValid: boolean;
  reduceAirLeaksValidSub: Subscription;
  reduceRuntimeValid: boolean;
  reduceRuntimeValidSub: Subscription;
  reduceSystemAirPressureValid: boolean;
  reduceSystemAirPressureValidSub: Subscription;
  useAutomaticSequencerValid: boolean;
  useAutomaticSequencerValidSub: Subscription;
  hasInvalidData: boolean;
  isInit: boolean = true;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.setValidationSubs();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.baselineResults = this.exploreOpportunitiesService.baselineResults;
        this.compressedAirAssessment = val;
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
        let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
        this.modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
        this.setResults();
      }
    });

    this.modificationResultsSub = this.exploreOpportunitiesService.modificationResults.subscribe(val => {
      this.modificationResults = val;
      if (this.modificationResults) {
        // Do this to pick up on modification change
        this.modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == this.modificationResults.modification.modificationId });
      }
      this.setResults();
    });

    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      if (this.baselineResults && val) {
        this.dayTypeBaselineResult = this.baselineResults.dayTypeResults.find(result => { return result.dayTypeId == val.dayTypeId })
      } else if (this.baselineResults) {
        this.dayTypeBaselineResult = this.baselineResults.total;
      }
      this.setResults();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
    this.addReceiverVolumeValidSub.unsubscribe();
    this.adjustCascadingSetPointsValidSub.unsubscribe();
    this.improveEndUseEfficiencyValidSub.unsubscribe();
    this.reduceAirLeaksValidSub.unsubscribe();
    this.reduceRuntimeValidSub.unsubscribe();
    this.reduceSystemAirPressureValidSub.unsubscribe();
    this.useAutomaticSequencerValidSub.unsubscribe();
  }

  setResults() {
    if (this.modificationResults && this.selectedDayType) {
      this.dayTypeModificationResult = this.modificationResults.dayTypeModificationResults.find(modResult => { return modResult.dayTypeId == this.selectedDayType.dayTypeId });
    } else if (this.modificationResults && !this.selectedDayType) {
      this.dayTypeModificationResult = this.compressedAirAssessmentResultsService.combineDayTypeResults(this.modificationResults, this.baselineResults);
    }
  }

  setValidationSubs() {
    this.addReceiverVolumeValidSub = this.exploreOpportunitiesValidationService.addReceiverVolumeValid.subscribe(val => {
      this.addReceiverVolumeValid = val;
      if (!this.isInit) {
        this.setHasInvalidData();
      }
    });
    this.adjustCascadingSetPointsValidSub = this.exploreOpportunitiesValidationService.adjustCascadingSetPointsValid.subscribe(val => {
      this.adjustCascadingSetPointsValid = val;
      if (!this.isInit) {
        this.setHasInvalidData();
      }
    });
    this.improveEndUseEfficiencyValidSub = this.exploreOpportunitiesValidationService.improveEndUseEfficiencyValid.subscribe(val => {
      this.improveEndUseEfficiencyValid = val;
      if (!this.isInit) {
        this.setHasInvalidData();
      }
    });
    this.reduceAirLeaksValidSub = this.exploreOpportunitiesValidationService.reduceAirLeaksValid.subscribe(val => {
      this.reduceAirLeaksValid = val;
      if (!this.isInit) {
        this.setHasInvalidData();
      }
    });
    this.reduceRuntimeValidSub = this.exploreOpportunitiesValidationService.reduceRuntimeValid.subscribe(val => {
      this.reduceRuntimeValid = val;
      if (!this.isInit) {
        this.setHasInvalidData();
      }
    });
    this.reduceSystemAirPressureValidSub = this.exploreOpportunitiesValidationService.reduceSystemAirPressureValid.subscribe(val => {
      this.reduceSystemAirPressureValid = val;
      if (!this.isInit) {
        this.setHasInvalidData();
      }
    });
    this.useAutomaticSequencerValidSub = this.exploreOpportunitiesValidationService.useAutomaticSequencerValid.subscribe(val => {
      this.useAutomaticSequencerValid = val;
      this.setHasInvalidData();
      this.isInit = false;
    });
  }

  setHasInvalidData() {
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (selectedModificationId != undefined && compressedAirAssessment) {
      this.modification = compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      if (this.modification) {
        if (this.modification.addPrimaryReceiverVolume.order != 100 && this.addReceiverVolumeValid == false) {
          this.hasInvalidData = true;
        } else if (this.modification.adjustCascadingSetPoints.order != 100 && this.adjustCascadingSetPointsValid == false) {
          this.hasInvalidData = true;
        } else if (this.modification.improveEndUseEfficiency.order != 100 && this.improveEndUseEfficiencyValid == false) {
          this.hasInvalidData = true;
        } else if (this.modification.reduceAirLeaks.order != 100 && this.reduceAirLeaksValid == false) {
          this.hasInvalidData = true;
        } else if (this.modification.reduceRuntime.order != 100 && this.reduceRuntimeValid == false) {
          this.hasInvalidData = true;
        } else if (this.modification.reduceSystemAirPressure.order != 100 && this.reduceSystemAirPressureValid == false) {
          this.hasInvalidData = true;
        } else if (this.modification.useAutomaticSequencer.order != 100 && this.useAutomaticSequencerValid == false) {
          this.hasInvalidData = true;
        } else {
          this.hasInvalidData = false;
        }
      }
    }
  }

}

