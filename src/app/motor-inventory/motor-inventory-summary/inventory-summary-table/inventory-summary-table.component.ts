import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Settings } from '../../../shared/models/settings';
import { InventorySummaryTableService, InventorySummaryData } from './inventory-summary-table.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-inventory-summary-table',
    templateUrl: './inventory-summary-table.component.html',
    styleUrls: ['./inventory-summary-table.component.css'],
    standalone: false
})
export class InventorySummaryTableComponent implements OnInit {
  inventorySummaryData: InventorySummaryData;
  sortByField: string = 'name';
  sortByDirection: string = 'desc';
  filterInventorySummarySub: Subscription;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryTableService: InventorySummaryTableService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
      let filteredInventoryData = this.motorInventoryService.filterMotorInventoryData(motorInventoryData, val);
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

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
