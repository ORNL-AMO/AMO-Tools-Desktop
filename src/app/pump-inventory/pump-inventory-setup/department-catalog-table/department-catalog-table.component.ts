import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';
import { PumpInventoryData, PumpInventoryDepartment, PumpItem } from '../../pump-inventory';
import { PumpInventoryService } from '../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog/pump-catalog.service';
import { pumpTypesConstant, statusTypes } from '../../../psat/psatConstants';

@Component({
  selector: 'app-department-catalog-table',
  templateUrl: './department-catalog-table.component.html',
  styleUrls: ['./department-catalog-table.component.css']
})
export class DepartmentCatalogTableComponent implements OnInit {

  selectedPumpDepartment: PumpInventoryDepartment;

  pumpInventoryDataSub: Subscription;
  pumpInventoryData: PumpInventoryData;

  selectedDepartmentId: string;
  selectedDepartmentIdSub: Subscription;
  settings: Settings;
  settingsSub: Subscription;
  tableDataItems: Array<DepartmentCatalogTableDataItem>;

  confirmDeletePumpInventoryData: ConfirmDeleteData;
  showConfirmDeleteModal: boolean = false;
  pumpItemToDelete: PumpItem;

  selectedPumpItem: PumpItem;
  selectedPumpItemSub: Subscription;
  constructor(private pumpInventoryService: PumpInventoryService, private pumpCatalogService: PumpCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    })
    this.pumpInventoryDataSub = this.pumpInventoryService.pumpInventoryData.subscribe(val => {
      this.pumpInventoryData = val;
      this.setSelectedPumpDepartment();
    });

    this.selectedDepartmentIdSub = this.pumpCatalogService.selectedDepartmentId.subscribe(val => {
      this.selectedDepartmentId = val;
      this.setSelectedPumpDepartment();
    });

    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(val => {
      this.selectedPumpItem = val;
    });
  }

  ngOnDestroy() {
    this.pumpInventoryDataSub.unsubscribe();
    this.selectedDepartmentIdSub.unsubscribe();
    this.settingsSub.unsubscribe();
    this.selectedPumpItemSub.unsubscribe();
  }

  setSelectedPumpDepartment() {
    if (this.pumpInventoryData && this.selectedDepartmentId) {
      this.selectedPumpDepartment = this.pumpInventoryData.departments.find(department => { return department.id == this.selectedDepartmentId });
      this.setTableData();
    }
  }

  addNewPump() {
    let newPump: PumpItem = this.pumpInventoryService.getNewPump(this.selectedDepartmentId);
    this.pumpInventoryData.departments.forEach(department => {
      if (department.id == this.selectedDepartmentId) {
        department.catalog.push(newPump);
      }
    });
    this.pumpInventoryService.pumpInventoryData.next(this.pumpInventoryData);
    this.pumpCatalogService.selectedPumpItem.next(newPump);
  }

  selectPump(pump: PumpItem) {
    this.pumpCatalogService.selectedPumpItem.next(pump);
  }


  setTableData() {
    let tableDataItems: Array<DepartmentCatalogTableDataItem> = new Array();
    this.selectedPumpDepartment.catalog.forEach(pumpItem => {
      let pumpItemData: DepartmentCatalogTableDataItem = this.getPumpItemData(pumpItem);
      tableDataItems.push(pumpItemData);
    });
    this.tableDataItems = tableDataItems;
  }

  getPumpItemData(pumpItem: PumpItem): DepartmentCatalogTableDataItem {
    let status = statusTypes.find(status => status.value == pumpItem.pumpStatus.status).display;
    let pumpType = pumpTypesConstant.find(pumpType => pumpType.value == pumpItem.pumpEquipment.pumpType).display;
    let tableDataItem: DepartmentCatalogTableDataItem = {
      name: pumpItem.name,
      operatingHours: pumpItem.fieldMeasurements.yearlyOperatingHours,
      pumpType: pumpType,
      pumpStatus: status,
      ratedSpeed: pumpItem.pumpEquipment.ratedSpeed,
      designEfficiency: pumpItem.pumpEquipment.designEfficiency,
      pumpItem: pumpItem
    }
    return tableDataItem;
  }

  createCopy(pumpItem: PumpItem){
    let pumpItemCopy: PumpItem = JSON.parse(JSON.stringify(pumpItem));
    pumpItemCopy.name = pumpItem.name + ' (copy)';
    pumpItemCopy.id = Math.random().toString(36).substr(2, 9);
    
    this.pumpInventoryData.departments.forEach(department => {
      if (department.id == this.selectedDepartmentId) {
        department.catalog.push(pumpItemCopy);
      }
    });
    this.pumpInventoryService.pumpInventoryData.next(this.pumpInventoryData);
    this.pumpCatalogService.selectedPumpItem.next(pumpItemCopy);

  }

  openConfirmDeleteModal(pumpItem: PumpItem){
    if (this.tableDataItems.length > 1) {
      this.confirmDeletePumpInventoryData = {
        modalTitle: 'Delete Pump Inventory Item',
        confirmMessage: `Are you sure you want to delete '${pumpItem.name}'?`
      }
      this.showConfirmDeleteModal = true;
      this.pumpItemToDelete = pumpItem;
      this.pumpInventoryService.modalOpen.next(true);
    }
  }

  onConfirmDeleteClose(deleteInventoryItem: boolean) {
    if (deleteInventoryItem) {
      this.deleteItem();
    }
    this.showConfirmDeleteModal = false;
    this.pumpInventoryService.modalOpen.next(false);
  }

  deleteItem() {
    this.pumpInventoryService.deletePumpItem(this.pumpItemToDelete);
    let selectedDepartmentId: string = this.pumpCatalogService.selectedDepartmentId.getValue();
    this.pumpCatalogService.selectedDepartmentId.next(selectedDepartmentId);
  }

}

export interface DepartmentCatalogTableDataItem {
  name: string,
  operatingHours: number,
  pumpType: string,
  pumpStatus: string,
  ratedSpeed: number,
  designEfficiency: number
  // energyUsage: number,
  // energyCost: number,
  // co2EmissionOutput: number,
  pumpItem: PumpItem
}