import { Component, OnInit } from '@angular/core';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventoryService } from '../../motor-inventory.service';
import { InventorySummaryOverviewService, InventorySummaryData } from './inventory-summary-overview.service';

@Component({
  selector: 'app-inventory-summary-overview',
  templateUrl: './inventory-summary-overview.component.html',
  styleUrls: ['./inventory-summary-overview.component.css']
})
export class InventorySummaryOverviewComponent implements OnInit {

  inventorySummaryData: InventorySummaryData;
  sortByField: string = 'name';
  sortByDirection: string = 'desc';
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryOverviewService: InventorySummaryOverviewService) { }

  ngOnInit(): void {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.inventorySummaryData = this.inventorySummaryOverviewService.getInventorySummaryData(motorInventoryData);
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
