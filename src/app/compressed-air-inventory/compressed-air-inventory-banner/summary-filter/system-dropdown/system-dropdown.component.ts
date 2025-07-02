import { Component } from '@angular/core';
import { CompressedAirInventoryService, FilterInventorySummary } from '../../../compressed-air-inventory.service';
import { CompressedAirInventoryData } from '../../../compressed-air-inventory';
import { Subscription } from 'rxjs';
import _ from 'lodash';

@Component({
  selector: 'app-system-dropdown',
  templateUrl: './system-dropdown.component.html',
  styleUrl: './system-dropdown.component.css',
  standalone: false
})
export class SystemDropdownComponent {
  systemsDropdown: boolean = false;
  compressedAirInventoryData: CompressedAirInventoryData;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, 
    //private inventorySummaryGraphService: PumpSummaryGraphsService
  ) { }

  ngOnInit(): void {
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.value;

    this.filterInventorySummarySub = this.compressedAirInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

  toggleSystems() {
    this.systemsDropdown = !this.systemsDropdown;
  }

  save() {
    this.compressedAirInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    // let selectedField = this.inventorySummaryGraphService.selectedField.getValue();
    // this.inventorySummaryGraphService.selectedField.next(selectedField);
  }

  checkActive(systemId: string): boolean {
    let isActive = _.includes(this.filterInventorySummary.selectedSystemsIds, systemId);
    return isActive;
  }

  selectSystem(systemId: string) {
    let SystemIndex: number = this.filterInventorySummary.selectedSystemsIds.findIndex(id => { return id == systemId });
    if (SystemIndex == -1) {
      this.filterInventorySummary.selectedSystemsIds.push(systemId);
    } else {
      this.filterInventorySummary.selectedSystemsIds.splice(SystemIndex, 1);
    }
    this.save();
  }

  selectAllSystems() {
    this.filterInventorySummary.selectedSystemsIds = new Array();
    this.save();
  }
}
