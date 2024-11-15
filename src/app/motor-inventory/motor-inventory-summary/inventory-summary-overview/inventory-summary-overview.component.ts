import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { InventorySummaryOverviewService } from './inventory-summary-overview.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-inventory-summary-overview',
  templateUrl: './inventory-summary-overview.component.html',
  styleUrls: ['./inventory-summary-overview.component.css']
})
export class InventorySummaryOverviewComponent implements OnInit {

  filterInventorySummarySub: Subscription;
  settings: Settings;
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryOverviewService: InventorySummaryOverviewService) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      this.inventorySummaryOverviewService.setDepartmentSummaryItems();
    })
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

}
