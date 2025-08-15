import { Component } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirInventorySummaryOverviewService } from './compressed-air-inventory-summary-overview.service';

@Component({
  selector: 'app-compressed-air-inventory-summary-overview',
  templateUrl: './compressed-air-inventory-summary-overview.component.html',
  styleUrl: './compressed-air-inventory-summary-overview.component.css',
  standalone: false
})
export class CompressedAirInventorySummaryOverviewComponent {
  filterInventorySummarySub: Subscription;
  settings: Settings;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirInventorySummaryOverviewService: CompressedAirInventorySummaryOverviewService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.filterInventorySummarySub = this.compressedAirInventoryService.filterInventorySummary.subscribe(val => {
      this.compressedAirInventorySummaryOverviewService.setSystemSummaryItems();
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

}
