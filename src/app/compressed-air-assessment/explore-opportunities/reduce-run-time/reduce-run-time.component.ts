import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData, ReduceRuntime, SystemProfile } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

@Component({
  selector: 'app-reduce-run-time',
  templateUrl: './reduce-run-time.component.html',
  styleUrls: ['./reduce-run-time.component.css']
})
export class ReduceRunTimeComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  reduceRuntime: ReduceRuntime
  isFormChange: boolean = false;
  selectedDayTypeId: string;
  dayTypeOptions: Array<CompressedAirDayType>;
  requiredAirflow: Array<number>;
  availableAirflow: Array<number>;
  inventoryItems: Array<CompressorInventoryItem>;
  profileSummary: Array<ProfileSummary>
  hasError: boolean;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
        this.inventoryItems = this.compressedAirAssessment.compressorInventoryItems;
        this.profileSummary = this.compressedAirAssessment.systemProfile.profileSummary;
        this.selectedDayTypeId = this.dayTypeOptions[0].dayTypeId;
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData();
        this.setAirflowData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.reduceRuntime = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceRuntime));
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let allOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceAirLeaks.order,
        modification.reduceSystemAirPressure.order,
        modification.useAutomaticSequencer.order,
        modification.useUnloadingControls.order
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
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceRuntime.order));
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceRuntime = this.reduceRuntime;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.reduceRuntime.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'reduceRuntime', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
  }

  setAirflowData() {
    this.requiredAirflow = new Array();
    this.availableAirflow = new Array();
    for (let i = 0; i < 24; i++) {
      this.requiredAirflow.push(0);
      this.availableAirflow.push(0);
    }
    this.profileSummary.forEach(summary => {
      if (summary.dayTypeId == this.selectedDayTypeId) {
        for (let i = 0; i < 24; i++) {
          if (summary.profileSummaryData[i].order != 0) {
            this.requiredAirflow[i] = this.requiredAirflow[i] + summary.profileSummaryData[i].airflow;
          }
          let runTimeData = this.reduceRuntime.runtimeData.find(data => { return data.compressorId == summary.compressorId && data.dayTypeId == this.selectedDayTypeId });
          if (runTimeData.intervalData[i].isCompressorOn) {
            this.availableAirflow[i] = this.availableAirflow[i] + runTimeData.fullLoadCapacity;
          }
        }
      }
    });
    this.hasError = false;
    for(let i = 0; i < this.requiredAirflow.length; i++){
      if(this.availableAirflow[i] < this.requiredAirflow[i]){
        this.hasError = true;
      }
    }
  }
}