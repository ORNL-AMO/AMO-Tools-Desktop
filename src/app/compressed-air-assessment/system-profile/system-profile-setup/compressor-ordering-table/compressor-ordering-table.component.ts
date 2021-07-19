import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem, CompressorOrderItem, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile.service';

@Component({
  selector: 'app-compressor-ordering-table',
  templateUrl: './compressor-ordering-table.component.html',
  styleUrls: ['./compressor-ordering-table.component.css']
})
export class CompressorOrderingTableComponent implements OnInit {

  // form: FormGroup;
  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  orderingOptions: Array<number>;
  compressorOrdering: Array<CompressorOrderItem>
  hourIntervals: Array<number>;
  isSequencerUsed: boolean;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
        this.isSequencerUsed = val.systemInformation.isSequencerUsed;
        this.compressorOrdering = val.systemProfile.compressorOrdering;
        this.setOrderingOptions(val.systemProfile.systemProfileSetup, val.compressorInventoryItems);
        this.orderingOptions = new Array();
        let optionIndex: number = 1;
        val.compressorInventoryItems.forEach(item => {
          this.orderingOptions.push(optionIndex);
          optionIndex++;
        });
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  setOrderingOptions(systemProfileSetup: SystemProfileSetup, compressorInventoryItems: Array<CompressorInventoryItem>) {
    if (this.compressorOrdering.length != compressorInventoryItems.length) {
      this.hourIntervals = new Array();
      for (let index = 0; index < systemProfileSetup.numberOfHours;) {
        this.hourIntervals.push(index)
        index = index + systemProfileSetup.dataInterval;
      }
      this.compressorOrdering = new Array();
      let itemIndex: number = 0;
      compressorInventoryItems.forEach(item => {
        this.compressorOrdering.push({
          compressorName: item.name,
          compressorId: item.itemId,
          orders: this.hourIntervals.map(() => { return 0 }),
          fullLoadPressure: item.performancePoints.fullLoad.dischargePressure
        });
        itemIndex++;
      });
    }
  }

  resetOrdering() {
    for (let compressorIndex = 0; compressorIndex < this.compressorOrdering.length; compressorIndex++) {
      for (let orderIndex = 0; orderIndex < this.compressorOrdering[0].orders.length; orderIndex++) {
        this.compressorOrdering[compressorIndex].orders[orderIndex] = 0;
      }
    }
  }

  turnAllOn() {
    for (let compressorIndex = 0; compressorIndex < this.compressorOrdering.length; compressorIndex++) {
      let order: number = 1;
      for (let compressorOrderIndex = 0; compressorOrderIndex < this.compressorOrdering.length; compressorOrderIndex++) {
        if (compressorOrderIndex != compressorIndex) {
          if (this.compressorOrdering[compressorIndex].fullLoadPressure < this.compressorOrdering[compressorOrderIndex].fullLoadPressure) {
            order++;
          } else if (this.compressorOrdering[compressorOrderIndex].fullLoadPressure == this.compressorOrdering[compressorIndex].fullLoadPressure && compressorOrderIndex < compressorIndex) {
            order++;
          }
        }
      }

      for (let orderIndex = 0; orderIndex < this.compressorOrdering[0].orders.length; orderIndex++) {
        this.compressorOrdering[compressorIndex].orders[orderIndex] = order;
      }
    }
  }


  save() {

  }


  toggleOn(compressorIndex: number, orderIndex: number) {
    if (this.compressorOrdering[compressorIndex].orders[orderIndex] != 0) {
      this.updateCompressorOrdering(compressorIndex, orderIndex);
    } else {
      this.setCompressorOrdering(compressorIndex, orderIndex)
    }
  }

  setCompressorOrdering(compressorIndex: number, orderIndex: number) {
    this.compressorOrdering[compressorIndex].orders[orderIndex] = 1;
    this.compressorOrdering.forEach((compressor, index) => {
      if (index != compressorIndex) {
        if (compressor.orders[orderIndex] != 0) {
          if (compressor.fullLoadPressure < this.compressorOrdering[compressorIndex].fullLoadPressure) {
            compressor.orders[orderIndex]++;
          } else if (compressor.fullLoadPressure == this.compressorOrdering[compressorIndex].fullLoadPressure && compressorIndex < index) {
            compressor.orders[orderIndex]++;
          } else {
            this.compressorOrdering[compressorIndex].orders[orderIndex]++;
          }
        }
      }
    });
  }

  updateCompressorOrdering(compressorIndex: number, orderIndex: number) {
    this.compressorOrdering.forEach((compressor, index) => {
      if (index != compressorIndex) {
        if (compressor.orders[orderIndex] != 0 && compressor.orders[orderIndex] > this.compressorOrdering[compressorIndex].orders[orderIndex]) {
          compressor.orders[orderIndex]--;
        }
      }
    });
    this.compressorOrdering[compressorIndex].orders[orderIndex] = 0;
  }

}
