import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirInventoryData, CompressedAirItem, CompressorTypeOptions, ControlTypes, CompressedAirInventorySystem } from '../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog/compressed-air-catalog.service';
import { PerformancePointsCatalogService } from '../compressed-air-catalog/performance-points-catalog/performance-points-catalog.service';

@Component({
  selector: 'app-department-catalog-table',
  templateUrl: './department-catalog-table.component.html',
  styleUrl: './department-catalog-table.component.css'
})
export class DepartmentCatalogTableComponent implements OnInit {

  selectedCompressedAirSystem: CompressedAirInventorySystem;

  compressedAirInventoryDataSub: Subscription;
  compressedAirInventoryData: CompressedAirInventoryData;

  selectedSystemId: string;
  selectedSystemIdSub: Subscription;
  settings: Settings;
  settingsSub: Subscription;
  tableDataItems: Array<SystemCatalogTableDataItem>;

  confirmDeleteCompressedAirInventoryData: ConfirmDeleteData;
  showConfirmDeleteModal: boolean = false;
  compressedAirItemToDelete: CompressedAirItem;

  selectedCompressedAirItem: CompressedAirItem;
  selectedCompressedAirItemSub: Subscription;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirCatalogService: CompressedAirCatalogService, private performancePointsCatalogService: PerformancePointsCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    })
    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(val => {
      this.compressedAirInventoryData = val;
      this.setSelectedCompressedAirSystem();
    });

    this.selectedSystemIdSub = this.compressedAirCatalogService.selectedSystemId.subscribe(val => {
      this.selectedSystemId = val;
      this.setSelectedCompressedAirSystem();
    });

    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(val => {
      this.selectedCompressedAirItem = val;
    });
  }

  ngOnDestroy() {
    this.compressedAirInventoryDataSub.unsubscribe();
    this.selectedSystemIdSub.unsubscribe();
    this.settingsSub.unsubscribe();
    this.selectedCompressedAirItemSub.unsubscribe();
  }

  setSelectedCompressedAirSystem() {
    if (this.compressedAirInventoryData && this.selectedSystemId) {
      this.selectedCompressedAirSystem = this.compressedAirInventoryData.systems.find(system => { return system.id == this.selectedSystemId });
      this.setTableData();
    }
  }

  addNewCompressor() {
    let newCompressedAir: CompressedAirItem = this.compressedAirInventoryService.getNewCompressor(this.selectedSystemId);
    this.compressedAirInventoryData.systems.forEach(system => {
      if (system.id == this.selectedSystemId) {
        system.catalog.push(newCompressedAir);
      }
    });
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(newCompressedAir);
  }

  selectCompressedAir(compressedAir: CompressedAirItem) {
    this.compressedAirCatalogService.selectedCompressedAirItem.next(compressedAir);
  }

  setTableData() {
    let tableDataItems: Array<SystemCatalogTableDataItem> = new Array();
    this.selectedCompressedAirSystem.catalog.forEach(compressedAirItem => {
      let compressedAirItemData: SystemCatalogTableDataItem = this.getCompressedAirItemData(compressedAirItem);
      tableDataItems.push(compressedAirItemData);
    });
    this.tableDataItems = tableDataItems;
  }

  getCompressedAirItemData(compressedAirItem: CompressedAirItem): SystemCatalogTableDataItem {
    let compressorType = CompressorTypeOptions.find(type => type.value == compressedAirItem.nameplateData.compressorType).label;
    let controlType = ControlTypes.find(controlType => controlType.value == compressedAirItem.compressedAirControlsProperties.controlType).label;
    let pressureRange = this.getPressureMinMax(compressedAirItem);
    let tableDataItem: SystemCatalogTableDataItem = {
      name: compressedAirItem.name,      
      operatingHours: compressedAirItem.fieldMeasurements.yearlyOperatingHours,
      compressorType: compressorType,
      controlType: controlType,
      pressureRange: pressureRange,
      compressedAirItem: compressedAirItem
    }
    return tableDataItem;
  }

  createCopy(compressedAirItem: CompressedAirItem) {
    let compressedAirItemCopy: CompressedAirItem = JSON.parse(JSON.stringify(compressedAirItem));
    compressedAirItemCopy.name = compressedAirItem.name + ' (copy)';
    compressedAirItemCopy.id = Math.random().toString(36).substr(2, 9);

    this.compressedAirInventoryData.systems.forEach(system => {
      if (system.id == this.selectedSystemId) {
        system.catalog.push(compressedAirItemCopy);
      }
    });
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(compressedAirItemCopy);

  }

  openConfirmDeleteModal(compressedAirItem: CompressedAirItem) {
    if (this.tableDataItems.length > 1) {
      this.confirmDeleteCompressedAirInventoryData = {
        modalTitle: 'Delete Compressed Air Inventory Item',
        confirmMessage: `Are you sure you want to delete '${compressedAirItem.name}'?`
      }
      this.showConfirmDeleteModal = true;
      this.compressedAirItemToDelete = compressedAirItem;
      this.compressedAirInventoryService.modalOpen.next(true);
    }
  }

  onConfirmDeleteClose(deleteInventoryItem: boolean) {
    if (deleteInventoryItem) {
      this.deleteItem();
    }
    this.showConfirmDeleteModal = false;
    this.compressedAirInventoryService.modalOpen.next(false);
  }

  deleteItem() {
    this.compressedAirInventoryService.deleteCompressedAirItem(this.compressedAirItemToDelete);
    let selectedSystemId: string = this.compressedAirCatalogService.selectedSystemId.getValue();
    this.compressedAirCatalogService.selectedSystemId.next(selectedSystemId);
  }

  getPressureMinMax(compressor: CompressedAirItem): string {
    let minMax: { min: number, max: number } = this.performancePointsCatalogService.getCompressorPressureMinMax(compressor.compressedAirControlsProperties.controlType, compressor.compressedAirPerformancePointsProperties);
    let unit: string = ' psig';
    if (this.settings.unitsOfMeasure == 'Metric') {
      unit = ' barg';
    }

    return minMax.min + ' - ' + minMax.max + unit;
  }

}


export interface SystemCatalogTableDataItem {
  name: string,
  operatingHours: number,
  compressorType: string,
  controlType: string,
  pressureRange: string,
  //ratedSpeed: number,
  //designEfficiency: number
  // energyUsage: number,
  // energyCost: number,
  // co2EmissionOutput: number,
  compressedAirItem: CompressedAirItem
}
