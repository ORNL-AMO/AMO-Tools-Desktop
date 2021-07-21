import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';

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
  fillRight: boolean = true;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
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
      this.hourIntervals.push(index)
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
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }


  toggleOn(summaryData: ProfileSummary, hourIndex: number) {
    if (summaryData.profileSummaryData[hourIndex].order != 0) {
      if (this.fillRight) {
        for (let index = hourIndex; index <= this.hourIntervals[this.hourIntervals.length - 1]; index++) {
          this.updateCompressorOrdering(summaryData, index);
        }
      } else {
        this.updateCompressorOrdering(summaryData, hourIndex);
      }
    } else {
      if (this.fillRight) {
        for (let index = hourIndex; index <= this.hourIntervals[this.hourIntervals.length - 1]; index++) {
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

  setOrder(selectedCompressorIndex: number, orderIndex: number) {
    //THIS IS NOT REALLY WORKING...
    // let orders: Array<number> = new Array();
    // this.compressorOrdering.forEach(compressor => {
    //   if (compressor.orders[orderIndex] != 0) {
    //     orders.push(compressor.orders[orderIndex]);
    //   }
    // });

    // if (this.compressorOrdering[selectedCompressorIndex].orders[orderIndex] != 0) {
    //   //sets lowest needed
    //   for (let i = this.compressorOrdering[selectedCompressorIndex].orders[orderIndex] - 1; i > 0; i--) {
    //     if (!orders.includes(i)) {
    //       this.compressorOrdering[selectedCompressorIndex].orders[orderIndex]--;
    //     }
    //   }
    //   for (let i = 0; i < this.compressorOrdering.length; i++) {
    //     if (i != selectedCompressorIndex && this.compressorOrdering[i].orders[orderIndex] >= this.compressorOrdering[selectedCompressorIndex].orders[orderIndex]) {
    //       let checkOrder: boolean = this.orderingOptions.includes(this.compressorOrdering[i].orders[orderIndex] + 1);
    //       if (checkOrder) {
    //         this.compressorOrdering[i].orders[orderIndex]++;
    //       } else {
    //         let tmpOrders: Array<number> = new Array();
    //         this.compressorOrdering.forEach(compressor => {
    //           if (compressor.orders[orderIndex] != 0) {
    //             tmpOrders.push(compressor.orders[orderIndex]);
    //           }
    //         });
    //         this.orderingOptions.forEach(order => {
    //           let checkOrder: boolean = tmpOrders.includes(order);
    //           if (!checkOrder) {
    //             this.compressorOrdering[i].orders[orderIndex] = order;
    //           }
    //         });
    //       }
    //     }
    //   }
    // }
    this.save();
  }


  trackByIdx(index: number, obj: any): any {
    return index;
  }
}
