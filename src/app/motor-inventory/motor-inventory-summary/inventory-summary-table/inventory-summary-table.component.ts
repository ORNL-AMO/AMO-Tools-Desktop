import { Component, OnInit } from '@angular/core';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Settings } from '../../../shared/models/settings';
import { InventorySummaryTableService, InventorySummaryData } from './inventory-summary-table.service';
import { MotorInventorySummaryService } from '../motor-inventory-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-summary-table',
  templateUrl: './inventory-summary-table.component.html',
  styleUrls: ['./inventory-summary-table.component.css']
})
export class InventorySummaryTableComponent implements OnInit {
  inventorySummaryData: InventorySummaryData;
  sortByField: string = 'name';
  sortByDirection: string = 'desc';
  filterInventorySummarySub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryTableService: InventorySummaryTableService, private motorInventorySummaryService: MotorInventorySummaryService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.motorInventorySummaryService.filterInventorySummary.subscribe(val => {
      let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
      let filteredInventoryData = this.motorInventorySummaryService.filterMotorInventoryData(motorInventoryData, val);
      let settings: Settings = this.motorInventoryService.settings.getValue();
      this.inventorySummaryData = this.inventorySummaryTableService.getInventorySummaryData(filteredInventoryData, settings);
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

  setSortByField(str: string) {
    if (this.sortByField == str) {
      if (this.sortByDirection == 'desc') {
        this.sortByDirection = 'asc';
      } else {
        this.sortByDirection = 'desc';
      }
    }
    this.sortByField = str;
  }
}
