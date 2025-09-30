import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ReduceRuntime } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory/inventory.service';
import { ExploreOpportunitiesValidationService, ValidationDataArrays } from '../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { ReduceRunTimeService } from './reduce-run-time.service';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirModifiedDayTypeProfileSummary } from '../../calculations/modifications/CompressedAirModifiedDayTypeProfileSummary';

@Component({
  selector: 'app-reduce-run-time',
  templateUrl: './reduce-run-time.component.html',
  styleUrls: ['./reduce-run-time.component.css'],
  standalone: false
})
export class ReduceRunTimeComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  reduceRuntime: ReduceRuntime
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults;
  modificationResultsSub: Subscription;

  dayTypeOptions: Array<{
    dayType: CompressedAirDayType,
    isValid: boolean,
    requiredAirflow: Array<number>,
    availableAirflow: Array<number>,
    profilePower: Array<number>,
  }>;
  selectedDayType: {
    dayType: CompressedAirDayType,
    isValid: boolean,
    requiredAirflow: Array<number>,
    availableAirflow: Array<number>,
    profilePower: Array<number>,
  }
  form: UntypedFormGroup;
  hasInvalidDayType: boolean;
  settings: Settings;
  numberPipeDecimals: string;
  intervalAmount: number;
  displayShutdownTimer: boolean;
  fillRightHourInterval: boolean;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private inventoryService: InventoryService, private reduceRunTimeService: ReduceRunTimeService, private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.numberPipeDecimals = '1.0-2'
    } else {
      this.numberPipeDecimals = '1.0-0'
    }
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment) {
        this.displayShutdownTimer = compressedAirAssessment.systemInformation.multiCompressorSystemControls != 'loadSharing';
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.intervalAmount = this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
        this.setOrderOptions();
      }
    });
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.setSelectedModificationIndex(val);
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });
    this.modificationResultsSub = this.exploreOpportunitiesService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.compressedAirAssessmentModificationResults = val;
      if (this.compressedAirAssessmentModificationResults) {
        this.setSelectedModificationIndex(this.compressedAirAssessmentModificationResults.modification.modificationId);
      }
      if (!this.isFormChange) {
        this.setData();
      } else {
        this.isFormChange = false;
        if (!this.dayTypeOptions) {
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
    this.compressedAirAssessmentService.focusedField.next('reduceRuntime');
  }

  setData() {
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (this.compressedAirAssessmentModificationResults && this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      this.reduceRuntime = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceRuntime));
      this.form = this.reduceRunTimeService.getFormFromObj(this.reduceRuntime);
      let isRuntimeOrderShown: boolean = this.reduceRuntime.order != 100;
      if (isRuntimeOrderShown) {
        this.setDayTypes(this.compressedAirAssessment.compressedAirDayTypes);
        this.setReduceRuntimeValid();
      }
    }
  }

  setSelectedModificationIndex(selectedModificationId: string) {
    this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
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
          modification.reduceAirLeaks.order,
          modification.reduceSystemAirPressure.order,
          modification.useAutomaticSequencer.order
        ];
        allOrders = allOrders.filter(order => { return order != 100 });
        let numOrdersOn: number = allOrders.length;
        for (let i = 1; i <= numOrdersOn + 1; i++) {
          this.orderOptions.push(i);
        }
      }
    }
  }

  setHourIntervalState(intervalData: Array<{
    isCompressorOn: boolean,
    timeInterval: number,
  }>, data: {
    isCompressorOn: boolean,
    timeInterval: number,
  }, dataIndex: number) {
    if (this.fillRightHourInterval) {
      for (let index = dataIndex + 1; index <= intervalData.length - 1; index++) {
        intervalData[index].isCompressorOn = data.isCompressorOn;
      }
    }
    this.save(false);
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceRuntime.order));
    this.reduceRuntime = this.reduceRunTimeService.updateObjFromForm(this.form, this.reduceRuntime);
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceRuntime = this.reduceRuntime;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.reduceRuntime.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'reduceRuntime', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
  }

  setAirflowData() {
    if (this.reduceRuntime.order != 100 && this.selectedDayType) {
      let modificationProfileSummary: CompressedAirModifiedDayTypeProfileSummary = this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(dayTypeModResult => { return dayTypeModResult.dayType.dayTypeId == this.selectedDayType.dayType.dayTypeId });
      let reduceRuntimeProfile: Array<ProfileSummary> = modificationProfileSummary.reduceRunTimeResults.profileSummary;
      let previousOrderProfile: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(this.reduceRuntime.order - 1)
      let dataArrays: ValidationDataArrays = this.exploreOpportunitiesValidationService.getDataArrays(previousOrderProfile, this.compressedAirAssessment.systemProfile.systemProfileSetup, reduceRuntimeProfile, this.compressedAirAssessment.compressorInventoryItems, true);
      let dayTypeIndex: number = this.dayTypeOptions.findIndex(dayTypeOption => { return dayTypeOption.dayType.dayTypeId == this.selectedDayType.dayType.dayTypeId });
      this.dayTypeOptions[dayTypeIndex].availableAirflow = dataArrays.availableAirflow;
      this.dayTypeOptions[dayTypeIndex].requiredAirflow = dataArrays.requiredAirflow;
      this.dayTypeOptions[dayTypeIndex].profilePower = dataArrays.profilePower;
      this.dayTypeOptions[dayTypeIndex].isValid = dataArrays.isValid;
      this.setHasInvalidDayType();
    }
  }

  setDayTypes(compressedAirDayTypes: Array<CompressedAirDayType>) {
    if (compressedAirDayTypes && this.compressedAirAssessmentModificationResults && this.reduceRuntime.order != 100) {
      this.dayTypeOptions = new Array();
      compressedAirDayTypes.forEach(dayType => {
        let modificationProfileSummary: CompressedAirModifiedDayTypeProfileSummary = this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(dayTypeModResult => { return dayTypeModResult.dayType.dayTypeId == dayType.dayTypeId });
        let previousOrderProfile: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(this.reduceRuntime.order - 1)
        let reduceRuntimeProfile: Array<ProfileSummary> = modificationProfileSummary.reduceRunTimeResults.profileSummary;
        let dataArrays: ValidationDataArrays = this.exploreOpportunitiesValidationService.getDataArrays(previousOrderProfile, this.compressedAirAssessment.systemProfile.systemProfileSetup, reduceRuntimeProfile, this.compressedAirAssessment.compressorInventoryItems, true);
        this.dayTypeOptions.push({
          dayType: dayType,
          isValid: dataArrays.isValid,
          requiredAirflow: dataArrays.requiredAirflow,
          availableAirflow: dataArrays.availableAirflow,
          profilePower: dataArrays.profilePower,
        });
      });
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

  checkShowShutdownTimer(compressorId: string): boolean {
    let compressor: CompressorInventoryItem = this.compressedAirAssessment.compressorInventoryItems.find(compressor => { return compressor.itemId == compressorId });
    return this.inventoryService.checkDisplayAutomaticShutdown(compressor.compressorControls.controlType);
  }

  setReduceRuntimeValid() {
    if (this.form) {
      this.exploreOpportunitiesValidationService.reduceRuntimeValid.next((!this.hasInvalidDayType && this.form.valid));
    }
  }
}