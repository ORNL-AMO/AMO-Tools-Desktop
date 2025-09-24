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
  styleUrl: './end-uses-table.component.css',
  standalone: false
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
  selectedSystem: CompressedAirInventorySystem;

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
      } else {
        this.selectedSystemId = val;
        let compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
        this.selectedSystem = compressedAirInventoryData.systems.find(system => { return system.id == val });

      }
    });

    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(compressedAirInventoryData => {
      this.selectedSystem = compressedAirInventoryData.systems.find(system => { return system.id == this.selectedSystemId });
      if (compressedAirInventoryData && this.selectedSystem.endUses) {
        this.compressedAirInventoryData = compressedAirInventoryData;
        this.selectedSystem.endUses.forEach(endUse => {
          endUse.isValid = this.endUsesService.isEndUseValid(endUse, this.selectedSystem.endUses, this.selectedSystem, this.settings);
          if (!endUse.endUseName) {
            endUse.endUseName = 'End Use ' + (this.selectedSystem.endUses.indexOf(endUse) + 1);
            endUse.isValid = this.endUsesService.isEndUseValid(endUse, this.selectedSystem.endUses, this.selectedSystem, this.settings);
          }
        });
        this.hasInvalidEndUses = this.selectedSystem.endUses.some(endUse => !endUse.isValid);
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
    let itemIndex: number = this.selectedSystem.endUses.findIndex(endUse => { return endUse.endUseId == this.deleteSelectedId });
    this.selectedSystem.endUses.splice(itemIndex, 1);

    this.endUsesService.selectedEndUse.next(this.selectedSystem.endUses[0]);
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
