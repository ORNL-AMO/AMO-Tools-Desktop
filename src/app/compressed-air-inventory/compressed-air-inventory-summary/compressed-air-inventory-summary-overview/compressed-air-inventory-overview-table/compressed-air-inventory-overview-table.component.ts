import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { CompressedAirInventorySummaryOverviewService, InventorySummary } from '../compressed-air-inventory-summary-overview.service';

@Component({
  selector: 'app-compressed-air-inventory-overview-table',
  templateUrl: './compressed-air-inventory-overview-table.component.html',
  styleUrl: './compressed-air-inventory-overview-table.component.css',
  standalone: false 
})
export class CompressedAirInventoryOverviewTableComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  @Input()
  settings: Settings;
  tableString: any;
  inventorySummary: InventorySummary;
  inventorySummarySub: Subscription;

  constructor(private compressedAirInventorySummaryOverviewService: CompressedAirInventorySummaryOverviewService) { }
  
    ngOnInit(): void {
      this.inventorySummarySub = this.compressedAirInventorySummaryOverviewService.inventorySummary.subscribe(val => {
        this.inventorySummary = val;
      })
    }
  
    ngOnDestroy() {
      this.inventorySummarySub.unsubscribe();
    }
  
    updateTableString() {
      this.tableString = this.copyTable.nativeElement.innerText;
    }

}
