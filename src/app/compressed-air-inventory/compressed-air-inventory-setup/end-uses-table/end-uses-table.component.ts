import { Component, OnInit } from '@angular/core';
import { EndUsesService, UpdatedEndUseData } from '../end-uses-setup/end-uses.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirInventoryData, EndUse } from '../../compressed-air-inventory';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-end-uses-table',
  templateUrl: './end-uses-table.component.html',
  styleUrl: './end-uses-table.component.css'
})
export class EndUsesTableComponent implements OnInit {

  compressedAirInventoryDataSub: Subscription;
  compressedAirInventoryData: CompressedAirInventoryData;

  selectedEndUse: EndUse;
  selectedEndUseSub: Subscription;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  confirmDeleteData: ConfirmDeleteData;

  settings: Settings;
  hasInvalidEndUses: boolean = false;

  constructor(private endUsesService: EndUsesService, private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.selectedEndUseSub = this.endUsesService.selectedEndUse.subscribe(val => {
      this.selectedEndUse = val;
    })
    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(compressedAirInventoryData => {
      if (compressedAirInventoryData && compressedAirInventoryData.endUses) {
        this.compressedAirInventoryData = compressedAirInventoryData;
        this.compressedAirInventoryData.endUses.forEach(endUse => {
          endUse.isValid = this.endUsesService.isEndUseValid(endUse, this.compressedAirInventoryData, this.settings);
        });
        this.hasInvalidEndUses = this.compressedAirInventoryData.endUses.some(endUse => !endUse.isValid);
      }
    });
  }

  ngOnDestroy() {
    this.selectedEndUseSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
  }

  selectItem(item: EndUse) {
    this.endUsesService.selectedEndUse.next(item);
  }

  addNewEndUse() {
    let result: UpdatedEndUseData = this.endUsesService.addToInventory(this.compressedAirInventoryData, this.settings);
    this.endUsesService.selectedEndUse.next(result.endUse);
  }

  deleteEndUse() {
    let itemIndex: number = this.compressedAirInventoryData.endUses.findIndex(endUse => { return endUse.endUseId == this.deleteSelectedId });
    this.compressedAirInventoryData.endUses.splice(itemIndex, 1);
 
    this.endUsesService.selectedEndUse.next(this.compressedAirInventoryData.endUses[0]);
  }

  openConfirmDeleteModal(endUse: EndUse) {
    this.confirmDeleteData = {
      modalTitle: 'Delete End Use',
      confirmMessage: `Are you sure you want to delete '${endUse.endUseName}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedId = endUse.endUseId;
    this.compressedAirInventoryService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteEndUse: boolean) {
    if (deleteEndUse) {
      this.deleteEndUse();
    }
    this.showConfirmDeleteModal = false;
    this.compressedAirInventoryService.modalOpen.next(false);
  }

  createCopy(endUse: EndUse) {
    let endUseCopy: EndUse = JSON.parse(JSON.stringify(endUse));
    endUseCopy.endUseId = Math.random().toString(36).substr(2, 9);
    endUseCopy.endUseName = endUseCopy.endUseName + ' (copy)';
    this.endUsesService.addToInventory(this.compressedAirInventoryData, this.settings, endUseCopy);
  }

}
