import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { InventoryService } from '../../../inventory/inventory.service';

@Component({
  selector: 'app-adjust-sequencer-profile',
  templateUrl: './adjust-sequencer-profile.component.html',
  styleUrls: ['./adjust-sequencer-profile.component.css']
})
export class AdjustSequencerProfileComponent implements OnInit {
  @Input()
  profileSummary: Array<ProfileSummary>
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  selectedDayTypeId: string;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  adjustedCompressors: Array<CompressorInventoryItem>;
  @Input()
  requiredAirflow: Array<number>;
  @Input()
  availableAirflow: Array<number>;
  @Input()
  hasError: boolean;
  @Input()
  profilePower: Array<number>;
  @Input()
  settings: Settings;

  orderingOptions: Array<number>;
  hourIntervals: Array<number>;
  fillRight: boolean = false;
  numberPipeDecimals: string;
  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    if(this.settings.unitsOfMeasure == 'Metric'){
      this.numberPipeDecimals = '1.0-2'
    }else{
      this.numberPipeDecimals = '1.0-0'
    }
    this.setHourIntervals(this.compressedAirAssessment.systemProfile.systemProfileSetup);
    this.setOrderingOptions(this.compressedAirAssessment.compressorInventoryItems);
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
    this.emitSave.emit(true);
  }

  changeOrderSequencer(selectedCompressorIndex: number, hourIndex: number) {
    if (this.fillRight) {
      for (let index = hourIndex; index <= this.hourIntervals[this.hourIntervals.length - 1]; index++) {
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


  getFullLoadCapacity(compressorId: string): number {
    let compressor: CompressorInventoryItem = this.adjustedCompressors.find(compressor => { return compressor.itemId == compressorId });
    return compressor.performancePoints.fullLoad.airflow;
  }


  checkShowShutdownTimer(compressorId: string): boolean{
    let compressor: CompressorInventoryItem = this.adjustedCompressors.find(compressor => { return compressor.itemId == compressorId });
    return this.inventoryService.checkDisplayAutomaticShutdown(compressor.compressorControls.controlType);
  }
}
