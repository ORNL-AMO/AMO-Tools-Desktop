import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirInventorySummaryTableService, InventorySummaryData } from './compressed-air-inventory-summary-table.service';
import { CompressedAirInventoryData } from '../../compressed-air-inventory';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-compressed-air-inventory-summary-table',
  templateUrl: './compressed-air-inventory-summary-table.component.html',
  styleUrl: './compressed-air-inventory-summary-table.component.css',
  standalone: false
})
export class CompressedAirInventorySummaryTableComponent implements OnInit {
  inventorySummaryData: InventorySummaryData;
  sortByField: string = 'name';
  sortByDirection: string = 'desc';
  filterInventorySummarySub: Subscription;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private inventorySummaryTableService: CompressedAirInventorySummaryTableService) { }


  ngOnInit(): void {
    this.filterInventorySummarySub = this.compressedAirInventoryService.filterInventorySummary.subscribe(val => {
      let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
      let filteredInventoryData = this.compressedAirInventoryService.filterCompressedAirInventoryData(compressedAirInventoryData, val);
      let settings: Settings = this.compressedAirInventoryService.settings.getValue();
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
