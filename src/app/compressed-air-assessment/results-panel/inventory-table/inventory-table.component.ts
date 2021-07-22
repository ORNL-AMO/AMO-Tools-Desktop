import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory/inventory.service';
import { SystemProfileService } from '../../system-profile/system-profile.service';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.css']
})
export class InventoryTableComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  compressorInventoryItems: Array<CompressorInventoryItem>;

  selectedCompressor: CompressorInventoryItem;
  selectedCompressorSub: Subscription;


  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      this.selectedCompressor = val;
    })
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressorInventoryItems = val.compressorInventoryItems;
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  selectItem(item: CompressorInventoryItem) {
    this.inventoryService.selectedCompressor.next(item);
  }

  addNewCompressor() {
    this.inventoryService.addNewCompressor();
  }

  deleteItem(item: CompressorInventoryItem) {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let itemIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(inventoryItem => { return inventoryItem.itemId == item.itemId });
    compressedAirAssessment.compressorInventoryItems.splice(itemIndex, 1);
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      itemIndex = compressedAirAssessment.systemProfile.profileSummary.findIndex(summary => { return summary.compressorId == item.itemId && summary.dayTypeId == dayType.dayTypeId });
      let removedSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary.splice(itemIndex, 1);
      if (compressedAirAssessment.systemInformation.isSequencerUsed) {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType, removedSummary[0]);
      } else {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingNoSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType);
      }
    });
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(compressedAirAssessment.compressorInventoryItems[0]);
  }
}
