import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PumpInventoryData, PumpInventoryDepartment, PumpItem } from '../../pump-inventory';
import { PumpInventoryService } from '../../pump-inventory.service';
import { PumpCatalogService } from './pump-catalog.service';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { FormGroup } from '@angular/forms';
import { PsatIntegrationService } from '../../../shared/assessment-integration/psat-integration.service';
import { IntegrationStateService } from '../../../shared/assessment-integration/integration-state.service';
import { ConnectedItem } from '../../../shared/assessment-integration/integrations';

@Component({
  selector: 'app-pump-catalog',
  templateUrl: './pump-catalog.component.html',
  styleUrls: ['./pump-catalog.component.css']
})
export class PumpCatalogComponent implements OnInit {

  pumpInventoryData: PumpInventoryData;
  pumpInventoryDataSub: Subscription;

  selectedDepartmentIdSub: Subscription;
  showDeletePumpButton: boolean = false;
  showConfirmDeleteModal: boolean = false;
  confirmDeletePumpInventoryData: ConfirmDeleteData;
  pumpItemToDelete: PumpItem;
  selectedPumpItem: PumpItem;
  connectedPumpItem: ConnectedItem;
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  
  constructor(private pumpInventoryService: PumpInventoryService, private integrationStateService: IntegrationStateService, private pumpCatalogService: PumpCatalogService) { }

  ngOnInit(): void {
    let selectedPump = this.pumpCatalogService.selectedPumpItem.getValue();
    if (selectedPump)  {
      this.selectedPumpItem = selectedPump;
    }
    this.pumpInventoryDataSub = this.pumpInventoryService.pumpInventoryData.subscribe(val => {
      this.pumpInventoryData = val;
      let selectedDepartmentId: string = this.pumpCatalogService.selectedDepartmentId.getValue();
      if (selectedDepartmentId) {
        let findDepartment: PumpInventoryDepartment = this.pumpInventoryData.departments.find(department => { return department.id == selectedDepartmentId });
        if (findDepartment) {
          this.showDeletePumpButton = (findDepartment.catalog.length > 1);
        }
      }
    });

    this.selectedDepartmentIdSub = this.pumpCatalogService.selectedDepartmentId.subscribe(val => {
      if (!val) {
        this.pumpCatalogService.selectedDepartmentId.next(this.pumpInventoryData.departments[0].id);
      } else {
        let findDepartment: PumpInventoryDepartment = this.pumpInventoryData.departments.find(department => { return department.id == val });
        if (findDepartment) {
          this.showDeletePumpButton = (findDepartment.catalog.length > 1);
          let selectedPumpItem: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
          if (selectedPumpItem) {
            let findItemInDepartment: PumpItem = findDepartment.catalog.find(pumpItem => { return pumpItem.id == selectedPumpItem.id });
            if (!findItemInDepartment) {
              this.pumpCatalogService.selectedPumpItem.next(findDepartment.catalog[0]);
            }
          } else {
            this.pumpCatalogService.selectedPumpItem.next(findDepartment.catalog[0]);
          }
        } else {
          this.showDeletePumpButton = (this.pumpInventoryData.departments[0].catalog.length != 1);
          this.pumpCatalogService.selectedDepartmentId.next(this.pumpInventoryData.departments[0].id);
          this.pumpCatalogService.selectedPumpItem.next(this.pumpInventoryData.departments[0].catalog[0]);
        }
      }
    });

    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.selectedPumpItem = selectedPump;
        this.connectedPumpItem = {
          id: selectedPump.id,
          name: selectedPump.name,
          inventoryId: this.pumpInventoryService.currentInventoryId,
          departmentId: this.pumpCatalogService.selectedDepartmentId.getValue(),
          inventoryType: 'pump',
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedDepartmentIdSub.unsubscribe();
    this.pumpInventoryDataSub.unsubscribe();
    this.selectedPumpItemSub.unsubscribe();
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData())

  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('pump-basics');
    this.pumpInventoryService.focusedField.next(str);
  }

  openDeletePumpModal(){
    let selectedPumpItem: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    this.confirmDeletePumpInventoryData = {
      modalTitle: 'Delete Pump Inventory Item',
      confirmMessage: `Are you sure you want to delete '${selectedPumpItem.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.pumpItemToDelete = selectedPumpItem;
    this.pumpInventoryService.modalOpen.next(true);
  }

  onConfirmDeleteClose(shouldDeletePumpItem: boolean) {
    if (shouldDeletePumpItem) {
      this.pumpInventoryService.deletePumpItem(this.pumpItemToDelete);
      //re-select department to reset data process after deleting
      let selectedDepartmentId: string = this.pumpCatalogService.selectedDepartmentId.getValue();
      this.pumpCatalogService.selectedDepartmentId.next(selectedDepartmentId);
    }
    
    this.showConfirmDeleteModal = false;
    this.pumpInventoryService.modalOpen.next(false);
  }

  setModalOpenView(event) {
    this.pumpInventoryService.modalOpen.next(true);
  }

}

