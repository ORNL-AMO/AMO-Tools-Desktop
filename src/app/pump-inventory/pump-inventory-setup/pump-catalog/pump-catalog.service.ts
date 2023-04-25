import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PumpItem } from '../../pump-inventory';
import { PumpInventoryService } from '../../pump-inventory.service';

@Injectable()
export class PumpCatalogService {
  selectedDepartmentId: BehaviorSubject<string>;
  selectedPumpItem: BehaviorSubject<PumpItem>;
  constructor(private pumpInventoryService: PumpInventoryService) {
    this.selectedDepartmentId = new BehaviorSubject<string>(undefined);
    this.selectedPumpItem = new BehaviorSubject<PumpItem>(undefined);
  }

  getUpdatedSelectedPumpItem(): PumpItem {
    let pumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue()
    let selectedPumpItem = this.selectedPumpItem.getValue();
    let department = pumpInventoryData.departments.find(department => { return department.id == selectedPumpItem.departmentId });
    selectedPumpItem = department.catalog.find(pumpItem => { return pumpItem.id == selectedPumpItem.id });
    return selectedPumpItem;
  }

}
