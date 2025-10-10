import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, UseAutomaticSequencer } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../../../../compressed-air-assessment-validation/explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { UseAutomaticSequencerService } from './use-automatic-sequencer.service';
import { CompressedAirAssessmentModificationResults } from '../../../../calculations/modifications/CompressedAirAssessmentModificationResults';

@Component({
  selector: 'app-use-automatic-sequencer',
  templateUrl: './use-automatic-sequencer.component.html',
  styleUrls: ['./use-automatic-sequencer.component.css'],
  standalone: false
})
export class UseAutomaticSequencerComponent implements OnInit {


  selectedModificationSub: Subscription;
  useAutomaticSequencer: UseAutomaticSequencer;
  isFormChange: boolean = false;
  modification: Modification;
  orderOptions: Array<number>;
  compressedAirAssessment: CompressedAirAssessment;
  dayTypeOptions: Array<{
    dayType: CompressedAirDayType,
    isValid: boolean,
    requiredAirflow: Array<number>,
    availableAirflow: Array<number>,
    profilePower: Array<number>,
    adjustedCompressors: Array<CompressorInventoryItem>
  }>;
  selectedDayType: {
    dayType: CompressedAirDayType,
    isValid: boolean,
    requiredAirflow: Array<number>,
    availableAirflow: Array<number>,
    profilePower: Array<number>,
    adjustedCompressors: Array<CompressorInventoryItem>
  }
  compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults;
  modificationResultsSub: Subscription;
  baselineHasSequencer: boolean;
  form: UntypedFormGroup;
  hasInvalidDayType: boolean;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private useAutomaticSequencerService: UseAutomaticSequencerService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue()
    this.baselineHasSequencer = this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer';

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });

    this.modificationResultsSub = this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.setDayTypes(val);
    });
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('useAutomaticSequencer');
  }

  setData() {
    // this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (this.modification) {
      this.useAutomaticSequencer = JSON.parse(JSON.stringify(this.modification.useAutomaticSequencer));
      //TODO: update modifications logic from baseline
      // if (this.selectedDayType && this.compressedAirAssessment && (!this.useAutomaticSequencer.profileSummary || this.useAutomaticSequencer.profileSummary.length == 0)) {
      //   this.useAutomaticSequencer.profileSummary = JSON.parse(JSON.stringify(this.compressedAirAssessment.systemProfile.profileSummary));
      // }
      // if (this.baselineHasSequencer && this.useAutomaticSequencer.targetPressure == undefined) {
      //   this.useAutomaticSequencer.targetPressure = this.compressedAirAssessment.systemInformation.targetPressure;
      // }
      // if (this.baselineHasSequencer && this.useAutomaticSequencer.variance == undefined) {
      //   this.useAutomaticSequencer.variance = this.compressedAirAssessment.systemInformation.variance;
      // }
      this.form = this.useAutomaticSequencerService.getFormFromObj(this.useAutomaticSequencer);
      this.form.updateValueAndValidity();
    }
  }

  setOrderOptions() {
    if (this.modification) {
      this.orderOptions = new Array();
      let allOrders: Array<number> = [
        this.modification.addPrimaryReceiverVolume.order,
        this.modification.adjustCascadingSetPoints.order,
        this.modification.improveEndUseEfficiency.order,
        this.modification.reduceRuntime.order,
        this.modification.reduceSystemAirPressure.order,
        this.modification.reduceAirLeaks.order,
        this.modification.replaceCompressor.order
      ];
      allOrders = allOrders.filter(order => { return order != 100 });
      let numOrdersOn: number = allOrders.length;
      for (let i = 1; i <= numOrdersOn + 1; i++) {
        this.orderOptions.push(i);
      }
    }
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.useAutomaticSequencer.order;
      this.modification = this.exploreOpportunitiesService.setOrdering(this.modification, 'useAutomaticSequencer', this.modification.useAutomaticSequencer.order, newOrder);
    }
    this.compressedAirAssessmentService.updateModification(this.modification);
  }

  resetOrdering() {
    this.useAutomaticSequencer.profileSummary = JSON.parse(JSON.stringify(this.compressedAirAssessment.systemProfile.profileSummary));
    this.useAutomaticSequencer.profileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = this.compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == summary.compressorId });
      summary.automaticShutdownTimer = compressor.compressorControls.automaticShutdown;
    });

    if (this.baselineHasSequencer) {
      this.useAutomaticSequencer.targetPressure = this.compressedAirAssessment.systemInformation.targetPressure;
      this.useAutomaticSequencer.variance = this.compressedAirAssessment.systemInformation.variance;
    }
    this.save(false);
  }

  changeTargetPressure() {
    if (this.form.controls.targetPressure.value) {
      let maxVariance: number = this.form.controls.targetPressure.value * .5;
      this.form.controls.variance.setValidators([Validators.required, Validators.min(0), Validators.max(maxVariance)]);
      this.form.controls.variance.updateValueAndValidity();
    }
    this.save(false);
  }

  setDayTypes(compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults) {
    if (compressedAirAssessmentModificationResults && this.useAutomaticSequencer.order != 100) {
      this.dayTypeOptions = compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.map(dayTypeModResult => {
        return {
          dayType: dayTypeModResult.dayType,
          isValid: dayTypeModResult.useAutomaticSequencerProfileValidation.isValid,
          requiredAirflow: dayTypeModResult.useAutomaticSequencerProfileValidation.requiredAirflow,
          availableAirflow: dayTypeModResult.useAutomaticSequencerProfileValidation.availableAirflow,
          profilePower: dayTypeModResult.useAutomaticSequencerProfileValidation.profilePower,
          adjustedCompressors: dayTypeModResult.useAutomaticSequencerResults.adjustedCompressors
        };
      });
      if (!this.selectedDayType) {
        this.selectedDayType = this.dayTypeOptions[0];
      } else {
        this.selectedDayType = this.dayTypeOptions.find(dayTypeOption => { return dayTypeOption.dayType.dayTypeId == this.selectedDayType.dayType.dayTypeId });
      }
      this.hasInvalidDayType = this.dayTypeOptions.some(dayTypeOption => { return dayTypeOption.isValid == false });
    }
  }
}
