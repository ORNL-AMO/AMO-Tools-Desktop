import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirItem } from '../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';

@Injectable()
export class CompressedAirCatalogService {

  selectedDepartmentId: BehaviorSubject<string>;
  selectedCompressedAirItem: BehaviorSubject<CompressedAirItem>;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) {
    this.selectedDepartmentId = new BehaviorSubject<string>(undefined);
    this.selectedCompressedAirItem = new BehaviorSubject<CompressedAirItem>(undefined);
  }

  getUpdatedSelectedCompressedAirItem(): CompressedAirItem {
    let compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue()
    let selectedCompressedAirItem = this.selectedCompressedAirItem.getValue();
    let department = compressedAirInventoryData.departments.find(department => { return department.id == selectedCompressedAirItem.departmentId });
    selectedCompressedAirItem = department.catalog.find(compressedAirItem => { return compressedAirItem.id == selectedCompressedAirItem.id });
    return selectedCompressedAirItem;
  }

}
