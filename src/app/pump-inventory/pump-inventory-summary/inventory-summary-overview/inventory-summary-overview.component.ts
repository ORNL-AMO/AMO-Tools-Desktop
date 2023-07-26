import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PumpInventoryService } from '../../pump-inventory.service';
import { InventorySummaryOverviewService } from './inventory-summary-overview.service';


@Component({
  selector: 'app-pump-inventory-summary-overview',
  templateUrl: './inventory-summary-overview.component.html',
  styleUrls: ['./inventory-summary-overview.component.css']
})
export class InventorySummaryOverviewComponent implements OnInit {
  filterInventorySummarySub: Subscription;
  constructor(private pumpInventoryService: PumpInventoryService, private inventorySummaryOverviewService: InventorySummaryOverviewService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.pumpInventoryService.filterInventorySummary.subscribe(val => {
      this.inventorySummaryOverviewService.setDepartmentSummaryItems();
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

}
