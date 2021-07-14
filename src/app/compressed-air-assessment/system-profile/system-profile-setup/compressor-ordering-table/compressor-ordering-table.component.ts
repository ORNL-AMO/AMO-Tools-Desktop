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
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
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
      for (let index = 1; index <= systemProfileSetup.numberOfHours;) {
        this.hourIntervals.push(index)
        index = index + systemProfileSetup.dataInterval;
      }
      this.compressorOrdering = new Array();
      let itemIndex: number = 1;
      compressorInventoryItems.forEach(item => {
        this.compressorOrdering.push({
          compressorName: item.name,
          compressorId: item.itemId,
          orders: this.hourIntervals.map(() => { return itemIndex })
        });
        itemIndex++;
      });
    }
  }

}
