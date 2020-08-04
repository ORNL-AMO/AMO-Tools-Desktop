import { Component, OnInit, Input } from '@angular/core';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Settings } from '../../../shared/models/settings';
import { InventorySummaryTableService, InventorySummaryData } from './inventory-summary-table.service';

@Component({
  selector: 'app-inventory-summary-table',
  templateUrl: './inventory-summary-table.component.html',
  styleUrls: ['./inventory-summary-table.component.css']
})
export class InventorySummaryTableComponent implements OnInit {
  @Input()
  settings: Settings;
  
  inventorySummaryData: InventorySummaryData;
  sortByField: string = 'name';
  sortByDirection: string = 'desc';
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryTableService: InventorySummaryTableService) { }

  ngOnInit(): void {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.inventorySummaryData = this.inventorySummaryTableService.getInventorySummaryData(motorInventoryData, this.settings);
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
