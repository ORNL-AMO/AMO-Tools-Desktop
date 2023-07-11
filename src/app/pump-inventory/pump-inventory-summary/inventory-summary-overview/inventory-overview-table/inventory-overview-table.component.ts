import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventorySummary, InventorySummaryOverviewService } from '../inventory-summary-overview.service';

@Component({
  selector: 'app-inventory-overview-table',
  templateUrl: './inventory-overview-table.component.html',
  styleUrls: ['./inventory-overview-table.component.css']
})
export class InventoryOverviewTableComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  inventorySummary: InventorySummary;
  invetorySummarySub: Subscription;
  constructor(private inventorySummaryOverviewService: InventorySummaryOverviewService) { }

  ngOnInit(): void {
    this.invetorySummarySub = this.inventorySummaryOverviewService.inventorySummary.subscribe(val => {
      this.inventorySummary = val;
    })
  }

  ngOnDestroy() {
    this.invetorySummarySub.unsubscribe();
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
  
}

