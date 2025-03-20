import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { PumpInventoryData } from '../../pump-inventory';
import { PumpInventoryService } from '../../pump-inventory.service';
import { InventorySummaryData, InventorySummaryTableService } from './inventory-summary-table.service';

@Component({
    selector: 'app-pump-inventory-summary-table',
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
  constructor(private pumpInventoryService: PumpInventoryService, private inventorySummaryTableService: InventorySummaryTableService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.pumpInventoryService.filterInventorySummary.subscribe(val => {
      let pumpInventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
      let filteredInventoryData = this.pumpInventoryService.filterPumpInventoryData(pumpInventoryData, val);
      let settings: Settings = this.pumpInventoryService.settings.getValue();
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
