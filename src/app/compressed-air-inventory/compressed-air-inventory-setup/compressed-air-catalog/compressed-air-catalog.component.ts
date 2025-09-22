import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirInventorySystem, CompressedAirItem } from '../../compressed-air-inventory';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { IntegrationStateService } from '../../../shared/connected-inventory/integration-state.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from './compressed-air-catalog.service';
import { ConnectedItem } from '../../../shared/connected-inventory/integrations';

@Component({
  selector: 'app-compressed-air-catalog',
  templateUrl: './compressed-air-catalog.component.html',
  styleUrl: './compressed-air-catalog.component.css',
  standalone: false
})
export class CompressedAirCatalogComponent implements OnInit {

  compressedAirInventoryData: CompressedAirInventoryData;
  compressedAirInventoryDataSub: Subscription;

  selectedSystemIdSub: Subscription;
  showDeleteCompressedAirButton: boolean = false;
  showConfirmDeleteModal: boolean = false;
  confirmDeleteCompressedAirInventoryData: ConfirmDeleteData;
  compressedAirItemToDelete: CompressedAirItem;
  selectedCompressedAirItem: CompressedAirItem;
  connectedCompressedAirItem: ConnectedItem;
  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  showCompressorModal: boolean = false;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, 
    private integrationStateService: IntegrationStateService, 
    private compressedAirCatalogService: CompressedAirCatalogService,
   private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(val => {
      this.compressedAirInventoryData = val;
      let selectedSystemId: string = this.compressedAirCatalogService.selectedSystemId.getValue();
      if (selectedSystemId) {
        let findSystem: CompressedAirInventorySystem = this.compressedAirInventoryData.systems.find(system => { return system.id == selectedSystemId });
        if (findSystem) {
          this.showDeleteCompressedAirButton = (findSystem.catalog.length > 1);
        }
      }
    });

    this.selectedSystemIdSub = this.compressedAirCatalogService.selectedSystemId.subscribe(val => {
      if (!val) {
        this.compressedAirCatalogService.selectedSystemId.next(this.compressedAirInventoryData.systems[0].id);
      } else {
        let findSystem: CompressedAirInventorySystem = this.compressedAirInventoryData.systems.find(system => { return system.id == val });
        if (findSystem) {
          this.showDeleteCompressedAirButton = (findSystem.catalog.length > 1);
          let selectedCompressedAirItem: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
          if (selectedCompressedAirItem) {
            let findItemInSystem: CompressedAirItem = findSystem.catalog.find(compressedAirItem => { return compressedAirItem.id == selectedCompressedAirItem.id });
            if (!findItemInSystem) {
              this.compressedAirCatalogService.selectedCompressedAirItem.next(findSystem.catalog[0]);
            }
          } else {
            this.compressedAirCatalogService.selectedCompressedAirItem.next(findSystem.catalog[0]);
          }
        } else {
          this.showDeleteCompressedAirButton = (this.compressedAirInventoryData.systems[0].catalog.length != 1);
          this.compressedAirCatalogService.selectedSystemId.next(this.compressedAirInventoryData.systems[0].id);
          this.compressedAirCatalogService.selectedCompressedAirItem.next(this.compressedAirInventoryData.systems[0].catalog[0]);
        }
      }
    });

    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.selectedCompressedAirItem = selectedCompressedAir;
        this.selectedCompressedAirItem.validCompressedAir = this.compressedAirInventoryService.isCompressedAirValid(selectedCompressedAir, this.compressedAirInventoryData);
        this.connectedCompressedAirItem = {
          id: selectedCompressedAir.id,
          name: selectedCompressedAir.name,
          inventoryId: this.compressedAirInventoryService.currentInventoryId,
          departmentId: this.compressedAirCatalogService.selectedSystemId.getValue(),
          inventoryType: 'compressed-air',
        }
      }
    });

  }

  ngOnDestroy() {
    this.selectedSystemIdSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
    this.selectedCompressedAirItemSub.unsubscribe();
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData())

  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('compressed-air-basics');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  openDeleteCompressedAirModal() {
    let selectedCompressedAirItem: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    this.confirmDeleteCompressedAirInventoryData = {
      modalTitle: 'Delete Compressed Air Inventory Item',
      confirmMessage: `Are you sure you want to delete '${selectedCompressedAirItem.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.compressedAirItemToDelete = selectedCompressedAirItem;
    this.compressedAirInventoryService.modalOpen.next(true);
  }

  onConfirmDeleteClose(shouldDeleteCompressedAirItem: boolean) {
    if (shouldDeleteCompressedAirItem) {
      this.compressedAirInventoryService.deleteCompressedAirItem(this.compressedAirItemToDelete);
      //re-select system to reset data process after deleting
      let selectedSystemId: string = this.compressedAirCatalogService.selectedSystemId.getValue();
      this.compressedAirCatalogService.selectedSystemId.next(selectedSystemId);
    }

    this.showConfirmDeleteModal = false;
    this.compressedAirInventoryService.modalOpen.next(false);
  }

  setModalOpenView(event) {
    this.compressedAirInventoryService.modalOpen.next(true);
  }

  

  openCompressorModal() {
    this.showCompressorModal = true;
    this.cd.detectChanges();
  }

  closeCompressorModal() {
    this.showCompressorModal = false;
    this.save();
    this.cd.detectChanges();
  }

}
