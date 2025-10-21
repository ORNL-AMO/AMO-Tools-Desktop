import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryService } from '../compressed-air-inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compressed-air-inventory-summary',
  templateUrl: './compressed-air-inventory-summary.component.html',
  styleUrl: './compressed-air-inventory-summary.component.css',
  standalone: false
})
export class CompressedAirInventorySummaryComponent implements OnInit {
  summaryTab: string;
  summaryTabSub: Subscription;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.summaryTabSub = this.compressedAirInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });
  }

  ngOnDestroy() {
    this.summaryTabSub.unsubscribe();
  }

}
