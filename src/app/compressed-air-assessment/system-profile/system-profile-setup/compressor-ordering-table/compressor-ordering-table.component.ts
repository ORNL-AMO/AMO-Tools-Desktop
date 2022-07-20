import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-compressor-ordering-table',
  templateUrl: './compressor-ordering-table.component.html',
  styleUrls: ['./compressor-ordering-table.component.css']
})
export class CompressorOrderingTableComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  orderingOptions: Array<number>;
  profileSummary: Array<ProfileSummary>
  hourIntervals: Array<number>;
  isSequencerUsed: boolean;
  selectedDayTypeId: string;
  fillRight: boolean = false;
  inventoryItems: Array<CompressorInventoryItem>;
  dataInterval: number;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
        this.inventoryItems = val.compressorInventoryItems;
        this.selectedDayTypeId = val.systemProfile.systemProfileSetup.dayTypeId;
        this.isSequencerUsed = val.systemInformation.isSequencerUsed;
        this.profileSummary = val.systemProfile.profileSummary;
        this.setHourIntervals(val.systemProfile.systemProfileSetup);
        this.setOrderingOptions(val.compressorInventoryItems);
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  setHourIntervals(systemProfileSetup: SystemProfileSetup) {
    this.hourIntervals = new Array();
    for (let index = 0; index < systemProfileSetup.numberOfHours;) {
      this.hourIntervals.push(index + systemProfileSetup.dataInterval)
      index = index + systemProfileSetup.dataInterval;
    }
  }

  setOrderingOptions(compressorInventoryItems: Array<CompressorInventoryItem>) {
    this.orderingOptions = [0];
    let optionIndex: number = 1;
    compressorInventoryItems.forEach(() => {
      this.orderingOptions.push(optionIndex);
      optionIndex++;
    });
  }

  resetOrdering() {
    for (let summaryIndex = 0; summaryIndex < this.profileSummary.length; summaryIndex++) {
      if (this.profileSummary[summaryIndex].dayTypeId == this.selectedDayTypeId) {
        for (let i = 0; i < this.profileSummary[summaryIndex].profileSummaryData.length; i++) {
          this.profileSummary[summaryIndex].profileSummaryData[i].order = 0;
        }
      }
    }
    this.save();
  }

  turnAllOn() {
    let dayTypeSummaries: Array<ProfileSummary> = this.profileSummary.filter(summary => { return summary.dayTypeId == this.selectedDayTypeId });
    for (let compressorIndex = 0; compressorIndex < dayTypeSummaries.length; compressorIndex++) {
      let order: number = 1;
      for (let compressorOrderIndex = 0; compressorOrderIndex < dayTypeSummaries.length; compressorOrderIndex++) {
        if (compressorOrderIndex != compressorIndex) {
          if (dayTypeSummaries[compressorIndex].fullLoadPressure < dayTypeSummaries[compressorOrderIndex].fullLoadPressure) {
            order++;
          } else if (dayTypeSummaries[compressorOrderIndex].fullLoadPressure == dayTypeSummaries[compressorIndex].fullLoadPressure && compressorOrderIndex < compressorIndex) {
            order++;
          }
        }
      }
      let summaryIndex: number = this.profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[compressorIndex].compressorId && summary.dayTypeId == dayTypeSummaries[compressorIndex].dayTypeId })
      for (let orderIndex = 0; orderIndex < this.hourIntervals.length; orderIndex++) {
        this.profileSummary[summaryIndex].profileSummaryData[orderIndex].order = order;
      }
    }
    this.save();
  }


  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.systemProfile.profileSummary = this.profileSummary;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }


  toggleOn(summaryData: ProfileSummary, hourIndex: number) {
    if (summaryData.profileSummaryData[hourIndex].order != 0) {
      if (this.fillRight) {
        for (let index = hourIndex; index <= this.hourIntervals.length - 1; index++) {
          this.updateCompressorOrdering(summaryData, index);
        }
      } else {
        this.updateCompressorOrdering(summaryData, hourIndex);
      }
    } else {
      if (this.fillRight) {
        for (let index = hourIndex; index <= this.hourIntervals.length - 1; index++) {
          this.setCompressorOrdering(summaryData, index);
        }
      } else {
        this.setCompressorOrdering(summaryData, hourIndex);
      }
    }
    this.save();
  }

  setCompressorOrdering(changedSummary: ProfileSummary, orderIndex: number) {
    let dayTypeSummaries: Array<ProfileSummary> = this.profileSummary.filter(summary => { return summary.dayTypeId == this.selectedDayTypeId });
    let summaryIndex: number = dayTypeSummaries.findIndex(summary => { return summary.compressorId == changedSummary.compressorId });
    changedSummary.profileSummaryData[orderIndex].order = 1;
    dayTypeSummaries.forEach((summary, index) => {
      if (summary.compressorId != changedSummary.compressorId) {
        if (summary.profileSummaryData[orderIndex].order != 0) {
          if (summary.fullLoadPressure < changedSummary.fullLoadPressure) {
            summary.profileSummaryData[orderIndex].order++;
          } else if (summary.fullLoadPressure == changedSummary.fullLoadPressure && summaryIndex < index) {
            summary.profileSummaryData[orderIndex].order++;
          } else {
            changedSummary.profileSummaryData[orderIndex].order++;
          }
        }
      }
    });
  }

  updateCompressorOrdering(changedSummary: ProfileSummary, orderIndex: number) {
    let dayTypeSummaries: Array<ProfileSummary> = this.profileSummary.filter(summary => { return summary.dayTypeId == this.selectedDayTypeId });
    dayTypeSummaries.forEach((summary, index) => {
      if (summary.compressorId != changedSummary.compressorId) {
        if (summary.profileSummaryData[orderIndex].order != 0 && summary.profileSummaryData[orderIndex].order > changedSummary.profileSummaryData[orderIndex].order) {
          summary.profileSummaryData[orderIndex].order--;
        }
      }
    });
    changedSummary.profileSummaryData[orderIndex].order = 0;
  }


  changeOrderSequencer(selectedCompressorIndex: number, hourIndex: number) {
    if (this.fillRight) {
      for (let index = hourIndex; index <= this.hourIntervals.length - 1; index++) {
        if (hourIndex != index) {
          let dayTypeSummaries: Array<ProfileSummary> = this.profileSummary.filter(summary => { return summary.dayTypeId == this.selectedDayTypeId });
          let summaryIndex: number = this.profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[selectedCompressorIndex].compressorId && summary.dayTypeId == dayTypeSummaries[selectedCompressorIndex].dayTypeId })
          this.profileSummary[summaryIndex].profileSummaryData[index].order = this.profileSummary[summaryIndex].profileSummaryData[hourIndex].order;
        }
        this.setOrder(selectedCompressorIndex, index);
      }
    } else {
      this.setOrder(selectedCompressorIndex, hourIndex);
    }
    this.save();
  }


  setOrder(selectedCompressorIndex: number, hourIndex: number) {
    let dayTypeSummaries: Array<ProfileSummary> = this.profileSummary.filter(summary => { return summary.dayTypeId == this.selectedDayTypeId });
    //get orders that are currently selected
    let selectedOrders: Array<number> = this.getSelectedOrders(dayTypeSummaries, hourIndex);
    //iterate all orders for hour interval and make sure there isn't a higher selected order
    //then total number of selected orders
    //set to highest possible if so and update selected orders
    for (let index = 0; index < dayTypeSummaries.length; index++) {
      if (dayTypeSummaries[index].profileSummaryData[hourIndex].order > selectedOrders.length) {
        dayTypeSummaries[index].profileSummaryData[hourIndex].order = selectedOrders.length;
        selectedOrders = this.getSelectedOrders(dayTypeSummaries, hourIndex);
      }
    }
    //find missing orders
    let missingOrders: Array<number> = this.getMissingOrders(selectedOrders);
    //until there are no missing orders
    while (missingOrders.length != 0) {
      for (let index = 0; index < dayTypeSummaries.length; index++) {
        //don't update changed order
        if (index != selectedCompressorIndex) {
          let orderCount: Array<number> = selectedOrders.filter(order => { return order == dayTypeSummaries[index].profileSummaryData[hourIndex].order })
          if (orderCount.length > 1) {
            //update duplicate order with first missing values
            let summaryIndex: number = this.profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[index].compressorId && summary.dayTypeId == dayTypeSummaries[index].dayTypeId })
            this.profileSummary[summaryIndex].profileSummaryData[hourIndex].order = missingOrders[0];
            //exist for loop
            index = dayTypeSummaries.length + 1;
          }
        }
      }
      //update our selected and missing orders
      dayTypeSummaries = this.profileSummary.filter(summary => { return summary.dayTypeId == this.selectedDayTypeId });
      selectedOrders = this.getSelectedOrders(dayTypeSummaries, hourIndex);
      missingOrders = this.getMissingOrders(selectedOrders);
    }

  }

  getMissingOrders(selectedOrders: Array<number>): Array<number> {
    let missingOrders: Array<number> = new Array();
    for (let index = 1; index <= selectedOrders.length; index++) {
      if (!selectedOrders.includes(index)) {
        missingOrders.push(index);
      }
    }
    return missingOrders;
  }

  getSelectedOrders(dayTypeSummaries: Array<ProfileSummary>, orderIndex: number): Array<number> {
    let selectedOrders: Array<number> = new Array();
    for (let index = 0; index < dayTypeSummaries.length; index++) {
      if (dayTypeSummaries[index].profileSummaryData[orderIndex].order != 0) {
        selectedOrders.push(dayTypeSummaries[index].profileSummaryData[orderIndex].order);
      }
    }
    return selectedOrders;
  }

  trackByIdx(index: number, obj: any): any {
    return index;
  }
}
