import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, UseAutomaticSequencer } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService, ValidationDataArrays } from '../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { UseAutomaticSequencerService } from './use-automatic-sequencer.service';
import { CompressedAirAssessmentResult } from '../../calculations/caCalculationModels';

@Component({
    selector: 'app-use-automatic-sequencer',
    templateUrl: './use-automatic-sequencer.component.html',
    styleUrls: ['./use-automatic-sequencer.component.css'],
    standalone: false
})
export class UseAutomaticSequencerComponent implements OnInit {


  selectedModificationIdSub: Subscription;
  useAutomaticSequencer: UseAutomaticSequencer;
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
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
  modificationResults: CompressedAirAssessmentResult;
  modificationResultsSub: Subscription;
  baselineHasSequencer: boolean;
  form: UntypedFormGroup;
  hasInvalidDayType: boolean;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService, private useAutomaticSequencerService: UseAutomaticSequencerService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.baselineHasSequencer = this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer';
        this.setOrderOptions();
      }
    });

    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });


    this.modificationResultsSub = this.exploreOpportunitiesService.modificationResults.subscribe(val => {
      this.modificationResults = val;
      if (!this.isFormChange) {
        this.setData();
      } else {
        this.isFormChange = false;
        if (!this.dayTypeOptions || !this.form) {
          this.setData();
        } else {
          this.setAirflowData();
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('useAutomaticSequencer');
  }

  setData() {
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (this.modificationResults && this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      this.useAutomaticSequencer = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].useAutomaticSequencer));
      if (this.selectedDayType && this.compressedAirAssessment && (!this.useAutomaticSequencer.profileSummary || this.useAutomaticSequencer.profileSummary.length == 0)) {
        this.useAutomaticSequencer.profileSummary = JSON.parse(JSON.stringify(this.compressedAirAssessment.systemProfile.profileSummary));
      }
      if (this.baselineHasSequencer && this.useAutomaticSequencer.targetPressure == undefined) {
        this.useAutomaticSequencer.targetPressure = this.compressedAirAssessment.systemInformation.targetPressure;
      }
      if (this.baselineHasSequencer && this.useAutomaticSequencer.variance == undefined) {
        this.useAutomaticSequencer.variance = this.compressedAirAssessment.systemInformation.variance;
      }
      this.form = this.useAutomaticSequencerService.getFormFromObj(this.useAutomaticSequencer);
      this.form.updateValueAndValidity();
      if (this.useAutomaticSequencer.order != 100) {
        this.setDayTypes(this.compressedAirAssessment.compressedAirDayTypes);
        this.setReduceRuntimeValid();
      }
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      if (modification) {
        let allOrders: Array<number> = [
          modification.addPrimaryReceiverVolume.order,
          modification.adjustCascadingSetPoints.order,
          modification.improveEndUseEfficiency.order,
          modification.reduceRuntime.order,
          modification.reduceSystemAirPressure.order,
          modification.reduceAirLeaks.order
        ];
        allOrders = allOrders.filter(order => { return order != 100 });
        let numOrdersOn: number = allOrders.length;
        for (let i = 1; i <= numOrdersOn + 1; i++) {
          this.orderOptions.push(i);
        }
      }
    }
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].useAutomaticSequencer.order));
    this.useAutomaticSequencer = this.useAutomaticSequencerService.updateObjFromForm(this.form, this.useAutomaticSequencer);
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].useAutomaticSequencer = this.useAutomaticSequencer;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.useAutomaticSequencer.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'useAutomaticSequencer', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
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

  setAirflowData() {
    if (this.useAutomaticSequencer.order != 100 && this.selectedDayType) {
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let adjustedProfileSummary: Array<ProfileSummary> = this.exploreOpportunitiesService.getPreviousOrderProfileSummary(this.useAutomaticSequencer.order, modification, this.modificationResults, this.selectedDayType.dayType.dayTypeId);
      let adjustedCompressors: Array<CompressorInventoryItem> = this.compressedAirAssessmentResultsService.useAutomaticSequencerAdjustCompressor(this.useAutomaticSequencer, JSON.parse(JSON.stringify(this.compressedAirAssessment.compressorInventoryItems)), this.useAutomaticSequencer.profileSummary, this.selectedDayType.dayType.dayTypeId, this.compressedAirAssessment.systemInformation.atmosphericPressure, this.settings);
      let eemSequencerProfileSummary: Array<ProfileSummary> = this.modificationResults.dayTypeModificationResults.find(dayTypeModResult => { return dayTypeModResult.dayTypeId == this.selectedDayType.dayType.dayTypeId }).useAutomaticSequencerProfileSummary;
      let dataArrays: ValidationDataArrays = this.exploreOpportunitiesValidationService.getDataArrays(adjustedProfileSummary, this.compressedAirAssessment.systemProfile.systemProfileSetup, eemSequencerProfileSummary, adjustedCompressors, true);
      let dayTypeIndex: number = this.dayTypeOptions.findIndex(dayTypeOption => { return dayTypeOption.dayType.dayTypeId == this.selectedDayType.dayType.dayTypeId });
      this.dayTypeOptions[dayTypeIndex].availableAirflow = dataArrays.availableAirflow;
      this.dayTypeOptions[dayTypeIndex].requiredAirflow = dataArrays.requiredAirflow;
      this.dayTypeOptions[dayTypeIndex].profilePower = dataArrays.profilePower;
      this.dayTypeOptions[dayTypeIndex].isValid = dataArrays.isValid;
      this.dayTypeOptions[dayTypeIndex].adjustedCompressors = adjustedCompressors;
      this.setHasInvalidDayType();
    }
  }

  changeTargetPressure() {
    if (this.form.controls.targetPressure.value) {
      let maxVariance: number = this.form.controls.targetPressure.value * .5;
      this.form.controls.variance.setValidators([Validators.required, Validators.min(0), Validators.max(maxVariance)]);
      this.form.controls.variance.updateValueAndValidity();
    }
    this.save(false);
  }

  setDayTypes(compressedAirDayTypes: Array<CompressedAirDayType>) {
    if (compressedAirDayTypes && this.modificationResults && this.useAutomaticSequencer.order != 100) {
      this.dayTypeOptions = new Array();
      compressedAirDayTypes.forEach(dayType => {
        let adjustedCompressors: Array<CompressorInventoryItem> = this.compressedAirAssessmentResultsService.useAutomaticSequencerAdjustCompressor(this.useAutomaticSequencer, JSON.parse(JSON.stringify(this.compressedAirAssessment.compressorInventoryItems)), this.useAutomaticSequencer.profileSummary, dayType.dayTypeId, this.compressedAirAssessment.systemInformation.atmosphericPressure, this.settings);
        let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
        let adjustedProfileSummary: Array<ProfileSummary> = this.exploreOpportunitiesService.getPreviousOrderProfileSummary(this.useAutomaticSequencer.order, modification, this.modificationResults, dayType.dayTypeId);
        let eemSequencerProfileSummary: Array<ProfileSummary> = this.modificationResults.dayTypeModificationResults.find(dayTypeModResult => { return dayTypeModResult.dayTypeId == dayType.dayTypeId }).useAutomaticSequencerProfileSummary;
        let dataArrays: ValidationDataArrays = this.exploreOpportunitiesValidationService.getDataArrays(adjustedProfileSummary, this.compressedAirAssessment.systemProfile.systemProfileSetup, eemSequencerProfileSummary, adjustedCompressors, true);
        this.dayTypeOptions.push({
          dayType: dayType,
          isValid: dataArrays.isValid,
          requiredAirflow: dataArrays.requiredAirflow,
          availableAirflow: dataArrays.availableAirflow,
          profilePower: dataArrays.profilePower,
          adjustedCompressors: adjustedCompressors

        })
      })
      if (!this.selectedDayType) {
        this.selectedDayType = this.dayTypeOptions[0];
      } else {
        this.selectedDayType = this.dayTypeOptions.find(dayTypeOption => { return dayTypeOption.dayType.dayTypeId == this.selectedDayType.dayType.dayTypeId });
      }
      this.setHasInvalidDayType();
    }
  }

  setHasInvalidDayType() {
    this.hasInvalidDayType = false;
    this.dayTypeOptions.forEach(option => {
      if (!option.isValid) {
        this.hasInvalidDayType = true;
      }
    });
    this.setReduceRuntimeValid();
  }

  setReduceRuntimeValid() {
    if (this.form) {
      this.exploreOpportunitiesValidationService.reduceRuntimeValid.next((!this.hasInvalidDayType && this.form.valid));
    }
  }
}
