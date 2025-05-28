import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventorySummaryOverviewService, InventorySummary } from '../inventory-summary-overview.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-inventory-overview-table',
    templateUrl: './inventory-overview-table.component.html',
    styleUrls: ['./inventory-overview-table.component.css'],
    standalone: false
})
export class InventoryOverviewTableComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  @Input()
  settings: Settings;
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

