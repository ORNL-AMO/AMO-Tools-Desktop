import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirInventoryDepartment, CompressedAirItem, ConnectedItem } from '../../compressed-air-inventory';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { IntegrationStateService } from '../../../shared/connected-inventory/integration-state.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from './compressed-air-catalog.service';

@Component({
  selector: 'app-compressed-air-catalog',
  templateUrl: './compressed-air-catalog.component.html',
  styleUrl: './compressed-air-catalog.component.css'
})
export class CompressedAirCatalogComponent implements OnInit {

  compressedAirInventoryData: CompressedAirInventoryData;
  compressedAirInventoryDataSub: Subscription;

  selectedDepartmentIdSub: Subscription;
  showDeleteCompressedAirButton: boolean = false;
  showConfirmDeleteModal: boolean = false;
  confirmDeleteCompressedAirInventoryData: ConfirmDeleteData;
  compressedAirItemToDelete: CompressedAirItem;
  selectedCompressedAirItem: CompressedAirItem;
  connectedCompressedAirItem: ConnectedItem;
  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private integrationStateService: IntegrationStateService, private compressedAirCatalogService: CompressedAirCatalogService) { }

  ngOnInit(): void {
    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(val => {
      this.compressedAirInventoryData = val;
      let selectedDepartmentId: string = this.compressedAirCatalogService.selectedDepartmentId.getValue();
      if (selectedDepartmentId) {
        let findDepartment: CompressedAirInventoryDepartment = this.compressedAirInventoryData.systems.find(system => { return system.id == selectedDepartmentId });
        if (findDepartment) {
          this.showDeleteCompressedAirButton = (findDepartment.catalog.length > 1);
        }
      }
    });

    this.selectedDepartmentIdSub = this.compressedAirCatalogService.selectedDepartmentId.subscribe(val => {
      if (!val) {
        this.compressedAirCatalogService.selectedDepartmentId.next(this.compressedAirInventoryData.systems[0].id);
      } else {
        let findDepartment: CompressedAirInventoryDepartment = this.compressedAirInventoryData.systems.find(system => { return system.id == val });
        if (findDepartment) {
          this.showDeleteCompressedAirButton = (findDepartment.catalog.length > 1);
          let selectedCompressedAirItem: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
          if (selectedCompressedAirItem) {
            let findItemInDepartment: CompressedAirItem = findDepartment.catalog.find(compressedAirItem => { return compressedAirItem.id == selectedCompressedAirItem.id });
            if (!findItemInDepartment) {
              this.compressedAirCatalogService.selectedCompressedAirItem.next(findDepartment.catalog[0]);
            }
          } else {
            this.compressedAirCatalogService.selectedCompressedAirItem.next(findDepartment.catalog[0]);
          }
        } else {
          this.showDeleteCompressedAirButton = (this.compressedAirInventoryData.systems[0].catalog.length != 1);
          this.compressedAirCatalogService.selectedDepartmentId.next(this.compressedAirInventoryData.systems[0].id);
          this.compressedAirCatalogService.selectedCompressedAirItem.next(this.compressedAirInventoryData.systems[0].catalog[0]);
        }
      }
    });

    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.selectedCompressedAirItem = selectedCompressedAir;
        //this.selectedCompressedAirItem.validCompressedAir = this.compressedAirInventoryService.isCompressedAirValid(selectedCompressedAir);
        this.connectedCompressedAirItem = {
          id: selectedCompressedAir.id,
          name: selectedCompressedAir.name,
          inventoryId: this.compressedAirInventoryService.currentInventoryId,
          systemId: this.compressedAirCatalogService.selectedDepartmentId.getValue(),
          inventoryType: 'compressed-air',
        }
      }
    });

  }

  ngOnDestroy() {
    this.selectedDepartmentIdSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
    this.selectedCompressedAirItemSub.unsubscribe();
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData())

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
      let selectedDepartmentId: string = this.compressedAirCatalogService.selectedDepartmentId.getValue();
      this.compressedAirCatalogService.selectedDepartmentId.next(selectedDepartmentId);
    }

    this.showConfirmDeleteModal = false;
    this.compressedAirInventoryService.modalOpen.next(false);
  }

  setModalOpenView(event) {
    this.compressedAirInventoryService.modalOpen.next(true);
  }




}
