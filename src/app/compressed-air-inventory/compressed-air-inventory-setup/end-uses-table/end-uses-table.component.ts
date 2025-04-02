import { Component, OnInit } from '@angular/core';
import { EndUsesService, UpdatedEndUseData } from '../end-uses-setup/end-uses.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirInventoryData, CompressedAirInventorySystem, EndUse } from '../../compressed-air-inventory';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirCatalogService } from '../compressed-air-catalog/compressed-air-catalog.service';

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

  selectedSystemIdSub: Subscription;
  selectedSystemId: string;
  selectedSystemIndex: number;

  settings: Settings;
  hasInvalidEndUses: boolean = false;

  constructor(private endUsesService: EndUsesService, private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirCatalogService: CompressedAirCatalogService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();

    this.selectedEndUseSub = this.endUsesService.selectedEndUse.subscribe(val => {
      this.selectedEndUse = val;
    });

    this.selectedSystemIdSub = this.compressedAirCatalogService.selectedSystemId.subscribe(val => {
      if (!val) {
        this.compressedAirCatalogService.selectedSystemId.next(this.compressedAirInventoryData.systems[0].id);
        this.selectedSystemIndex = 0;
      } else {
        this.selectedSystemId = val;
        let compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
        this.selectedSystemIndex = compressedAirInventoryData.systems.findIndex(system => { return system.id == val });

      }
    });

    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(compressedAirInventoryData => {
      this.selectedSystemIndex = compressedAirInventoryData.systems.findIndex(system => { return system.id == this.selectedSystemId });
      if (compressedAirInventoryData && compressedAirInventoryData.systems[this.selectedSystemIndex].endUses) {
        this.compressedAirInventoryData = compressedAirInventoryData;
        this.compressedAirInventoryData.systems[this.selectedSystemIndex].endUses.forEach(endUse => {
          endUse.isValid = this.endUsesService.isEndUseValid(endUse, this.compressedAirInventoryData, this.settings);
        });
        this.hasInvalidEndUses = this.compressedAirInventoryData.systems[this.selectedSystemIndex].endUses.some(endUse => !endUse.isValid);
      }
    });
  }

  ngOnDestroy() {
    this.selectedEndUseSub.unsubscribe();
    this.selectedSystemIdSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
  }

  selectItem(item: EndUse) {
    this.endUsesService.selectedEndUse.next(item);
  }

  addNewEndUse() {
    let system: CompressedAirInventorySystem = this.compressedAirInventoryData.systems.find(system => { return system.id == this.selectedSystemId });
    let result: UpdatedEndUseData = this.endUsesService.addToInventory(this.compressedAirInventoryData, system.endUses);
    this.endUsesService.selectedEndUse.next(result.endUse);
  }

  deleteEndUse() {
    let itemIndex: number = this.compressedAirInventoryData.systems[this.selectedSystemIndex].endUses.findIndex(endUse => { return endUse.endUseId == this.deleteSelectedId });
    this.compressedAirInventoryData.systems[this.selectedSystemIndex].endUses.splice(itemIndex, 1);

    this.endUsesService.selectedEndUse.next(this.compressedAirInventoryData.systems[this.selectedSystemIndex].endUses[0]);
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
    let system: CompressedAirInventorySystem = this.compressedAirInventoryData.systems.find(system => { return system.id == this.selectedSystemId });
    this.endUsesService.addToInventory(this.compressedAirInventoryData, system.endUses, endUseCopy);
  }

}
