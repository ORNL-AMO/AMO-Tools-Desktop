import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { InventorySummaryOverviewService } from './inventory-summary-overview.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-inventory-summary-overview',
  templateUrl: './inventory-summary-overview.component.html',
  styleUrls: ['./inventory-summary-overview.component.css']
})
export class InventorySummaryOverviewComponent implements OnInit {

  filterInventorySummarySub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryOverviewService: InventorySummaryOverviewService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      this.inventorySummaryOverviewService.setDepartmentSummaryItems();
    })
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

}
