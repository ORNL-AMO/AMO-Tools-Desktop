import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData, UseAutomaticSequencer } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { UseAutomaticSequencerService } from './use-automatic-sequencer.service';

@Component({
  selector: 'app-use-automatic-sequencer',
  templateUrl: './use-automatic-sequencer.component.html',
  styleUrls: ['./use-automatic-sequencer.component.css']
})
export class UseAutomaticSequencerComponent implements OnInit {


  selectedModificationIdSub: Subscription;
  useAutomaticSequencer: UseAutomaticSequencer;
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  dayTypeOptions: Array<CompressedAirDayType>;
  selectedDayTypeId: string;
  adjustedCompressors: Array<CompressorInventoryItem>;
  requiredAirflow: Array<number>;
  availableAirflow: Array<number>;
  hasError: boolean;
  adjustedProfileSummary: Array<ProfileSummary>;
  automaticSequencerProfileSummary: Array<ProfileSummary>;
  profilePower: Array<number>;
  modificationResults: CompressedAirAssessmentResult;
  modificationResultsSub: Subscription;
  baselineHasSequencer: boolean;
  form: FormGroup;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService, private useAutomaticSequencerService: UseAutomaticSequencerService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.baselineHasSequencer = this.compressedAirAssessment.systemInformation.isSequencerUsed;
        this.dayTypeOptions = compressedAirAssessment.compressedAirDayTypes;
        if (!this.selectedDayTypeId) {
          let findDayType: CompressedAirDayType = this.dayTypeOptions.find(dayType => { return dayType.dayTypeId == this.selectedDayTypeId });
          if (!findDayType) {
            this.selectedDayTypeId = this.dayTypeOptions[0].dayTypeId;
          }
        }
        this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });

    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });


    this.modificationResultsSub = this.exploreOpportunitiesService.modificationResults.subscribe(val => {
      this.modificationResults = val;
      this.setAdjustedSummary();
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
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      this.useAutomaticSequencer = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].useAutomaticSequencer));
      if (this.selectedDayTypeId && this.compressedAirAssessment && (!this.useAutomaticSequencer.profileSummary || this.useAutomaticSequencer.profileSummary.length == 0)) {
        this.useAutomaticSequencer.profileSummary = JSON.parse(JSON.stringify(this.compressedAirAssessment.systemProfile.profileSummary));
      }
      if (this.baselineHasSequencer && this.useAutomaticSequencer.targetPressure == undefined) {
        this.useAutomaticSequencer.targetPressure = this.compressedAirAssessment.systemInformation.targetPressure;
      }
      if (this.baselineHasSequencer && this.useAutomaticSequencer.variance == undefined) {
        this.useAutomaticSequencer.variance = this.compressedAirAssessment.systemInformation.variance;
      }
      this.setAdjustedCompressors();
      this.form = this.useAutomaticSequencerService.getFormFromObj(this.useAutomaticSequencer);
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
    this.setAdjustedCompressors();
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
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

  setAdjustedCompressors() {
    this.adjustedCompressors = this.compressedAirAssessmentResultsService.useAutomaticSequencerAdjustCompressor(this.useAutomaticSequencer, JSON.parse(JSON.stringify(this.compressedAirAssessment.compressorInventoryItems)), this.useAutomaticSequencer.profileSummary, this.selectedDayTypeId);
  }

  setAdjustedSummary() {
    if (this.selectedDayTypeId && this.compressedAirAssessment && this.modificationResults && this.useAutomaticSequencer.order != 100) {
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      this.adjustedProfileSummary = this.exploreOpportunitiesService.getPreviousOrderProfileSummary(this.useAutomaticSequencer.order, modification, this.modificationResults, this.selectedDayTypeId);
      this.automaticSequencerProfileSummary = this.modificationResults.dayTypeModificationResults.find(dayTypeModResult => { return dayTypeModResult.dayTypeId == this.selectedDayTypeId }).useAutomaticSequencerProfileSummary;
      this.setAirflowData();
    }
  }

  setAirflowData() {
    this.availableAirflow = new Array();
    this.requiredAirflow = new Array();
    this.profilePower = new Array();
    let numberOfSummaryIntervals: number = this.compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
    if (this.selectedDayTypeId && this.compressedAirAssessment && this.adjustedProfileSummary && this.useAutomaticSequencer.order != 100) {
      for (let i = 0; i < numberOfSummaryIntervals; i++) {
        this.requiredAirflow.push(0);
        this.availableAirflow.push(0);
        this.profilePower.push(0);
      }
      this.adjustedProfileSummary.forEach(summary => {
        if (summary.dayTypeId == this.selectedDayTypeId) {
          for (let i = 0; i < numberOfSummaryIntervals; i++) {
            if (summary.profileSummaryData[i].order != 0) {
              this.requiredAirflow[i] = this.requiredAirflow[i] + summary.profileSummaryData[i].airflow;
            }
            let profileSummary: ProfileSummary = this.useAutomaticSequencer.profileSummary.find(sequencerSummary => { return summary.compressorId == sequencerSummary.compressorId && summary.dayTypeId == sequencerSummary.dayTypeId });
            let intervalItem: ProfileSummaryData = profileSummary.profileSummaryData.find(data => { return data.timeInterval == i });
            if (intervalItem.order != 0) {
              this.availableAirflow[i] = this.availableAirflow[i] + this.getFullLoadCapacity(profileSummary.compressorId);
            }
            let powerProfile: ProfileSummary = this.automaticSequencerProfileSummary.find(profileSummary => { return summary.compressorId == profileSummary.compressorId && summary.dayTypeId == profileSummary.dayTypeId });
            let powerProfileData: ProfileSummaryData = powerProfile.profileSummaryData.find(data => { return data.timeInterval == i });
            this.profilePower[i] = this.profilePower[i] + powerProfileData.power;
          }
        }
      });
      this.hasError = false;
      for (let i = 0; i < this.requiredAirflow.length; i++) {
        if (this.availableAirflow[i] < this.requiredAirflow[i]) {
          this.hasError = true;
        }
      }
    }
  }


  getFullLoadCapacity(compressorId: string): number {
    let compressor: CompressorInventoryItem = this.adjustedCompressors.find(compressor => { return compressor.itemId == compressorId });
    return compressor.performancePoints.fullLoad.airflow;
  }

  changeTargetPressure(){
    if(this.form.controls.targetPressure.value){
      let maxVariance: number = this.form.controls.targetPressure.value * .5;
      this.form.controls.variance.setValidators([Validators.required, Validators.min(0), Validators.max(maxVariance)]);
      this.form.controls.variance.updateValueAndValidity();
    }
    this.save(false);
  }
}
