import { Component } from '@angular/core';
import * as _ from 'lodash';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { FilterInventorySummary, PumpInventoryService } from '../../../pump-inventory.service';
import { PumpInventorySummaryService } from '../../../pump-inventory-summary/pump-inventory-summary.service';
import { PumpSummaryGraphsService } from '../../../pump-inventory-summary/inventory-summary-graphs/pump-summary-graphs.service';
import { PumpInventoryData, PumpItem } from '../../../pump-inventory';

@Component({
  selector: 'app-pump-types-dropdown',
  templateUrl: './pump-types-dropdown.component.html',
  styleUrls: ['./pump-types-dropdown.component.css']
})
export class PumpTypesDropdownComponent {

  settings: Settings;
  pumpTypes: Array<{ value: number, count: number }>;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  showDropdown: boolean;
  
  constructor(private pumpInventoryService: PumpInventoryService, private pumpInventorySummaryService: PumpInventorySummaryService, private pumpSummaryGraphsService: PumpSummaryGraphsService) { }

  ngOnInit(): void {
    this.settings = this.pumpInventoryService.settings.getValue();
    this.filterInventorySummarySub = this.pumpInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
      this.setOptions();
    });
  }
  ngOnDestroy(){
    this.filterInventorySummarySub.unsubscribe();
  }
  setOptions() {
    this.pumpTypes = new Array();
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.value;
    let allPumps: Array<PumpItem> = this.pumpInventorySummaryService.getAllPumps(pumpInventoryData);
    let options = _.countBy(allPumps, (pump: PumpItem) => { return pump.pumpEquipment.pumpType });
    Object.keys(options).forEach((key, index) => {
      this.pumpTypes.push({
        value: Number(key),
        count: options[key]
      });
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  save() {
    this.pumpInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.pumpSummaryGraphsService.selectedField.getValue();
    this.pumpSummaryGraphsService.selectedField.next(selectedField);
  }

  checkActive(pumpType: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.pumpTypes, pumpType);
    return isActive;
  }

  select(pumpType: number) {
    let classIndex: number = this.filterInventorySummary.pumpTypes.findIndex(value => { return value == pumpType });
    if (classIndex == -1) {
      this.filterInventorySummary.pumpTypes.push(pumpType);
    } else {
      this.filterInventorySummary.pumpTypes.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.pumpTypes = new Array();
    this.save();
  }
}
