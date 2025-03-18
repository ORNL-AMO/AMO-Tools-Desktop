import { Component } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FilterInventorySummary, PumpInventoryService } from '../../../pump-inventory.service';
import { Subscription } from 'rxjs';
import { PumpInventorySummaryService } from '../../../pump-inventory-summary/pump-inventory-summary.service';
import { PumpSummaryGraphsService } from '../../../pump-inventory-summary/inventory-summary-graphs/pump-summary-graphs.service';
import { PumpInventoryData, PumpItem } from '../../../pump-inventory';
import * as _ from 'lodash';

@Component({
    selector: 'app-status-dropdown',
    templateUrl: './status-dropdown.component.html',
    styleUrls: ['./status-dropdown.component.css'],
    standalone: false
})
export class StatusDropdownComponent {


  settings: Settings;
  statusOptions: Array<{ value: number, count: number }>;
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
    this.statusOptions = new Array();
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.value;
    let allPumps: Array<PumpItem> = this.pumpInventorySummaryService.getAllPumps(pumpInventoryData);
    let options = _.countBy(allPumps, (pump: PumpItem) => { return pump.pumpStatus.status });
    Object.keys(options).forEach((key, index) => {
      this.statusOptions.push({
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

  checkActive(status: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.statusValues, status);
    return isActive;
  }

  select(status: number) {
    let classIndex: number = this.filterInventorySummary.statusValues.findIndex(value => { return value == status });
    if (classIndex == -1) {
      this.filterInventorySummary.statusValues.push(status);
    } else {
      this.filterInventorySummary.statusValues.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.statusValues = new Array();
    this.save();
  }
}
