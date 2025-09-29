import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { Settings } from '../../../shared/models/settings';
import { BaselineResult, BaselineResults, DayTypeModificationResult } from '../../calculations/caCalculationModels';
import { CompressedAirCombinedDayTypeResults } from '../../calculations/modifications/CompressedAirCombinedDayTypeResults';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirAssessmentBaselineResults } from '../../calculations/CompressedAirAssessmentBaselineResults';

@Component({
  selector: 'app-explore-opportunities-results',
  templateUrl: './explore-opportunities-results.component.html',
  styleUrls: ['./explore-opportunities-results.component.css'],
  standalone: false
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
  modificationResults: CompressedAirAssessmentModificationResults;
  modificationResultsSub: Subscription;
  dayTypeModificationResult: DayTypeModificationResult;
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
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.setValidationSubs();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
        let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
        this.modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
        this.setResults();
      }
    });

    this.modificationResultsSub = this.exploreOpportunitiesService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.modificationResults = val;
      if (this.modificationResults) {
        // Do this to pick up on modification change
        this.modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == this.modificationResults.modification.modificationId });
      }
      this.setResults();
    });

    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = this.exploreOpportunitiesService.compressedAirAssessmentBaselineResults.getValue();
      if (compressedAirAssessmentBaselineResults && val) {
        this.dayTypeBaselineResult = compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.find(result => { return result.dayType.dayTypeId == val.dayTypeId }).baselineResult
      } else if (compressedAirAssessmentBaselineResults) {
        this.dayTypeBaselineResult = compressedAirAssessmentBaselineResults.baselineResults.total;
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
      this.dayTypeModificationResult = this.modificationResults.modifiedDayTypeProfileSummaries.find(modResult => { return modResult.dayType.dayTypeId == this.selectedDayType.dayTypeId }).getDayTypeModificationResult();
    } else if (this.modificationResults && !this.selectedDayType) {
      this.dayTypeModificationResult = new CompressedAirCombinedDayTypeResults(this.modificationResults).getDayTypeModificationResult();
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

