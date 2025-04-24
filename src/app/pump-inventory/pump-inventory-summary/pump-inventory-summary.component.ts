import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PumpInventoryService } from '../pump-inventory.service';

@Component({
    selector: 'app-pump-inventory-summary',
    templateUrl: './pump-inventory-summary.component.html',
    styleUrls: ['./pump-inventory-summary.component.css'],
    standalone: false
})
export class PumpInventorySummaryComponent implements OnInit {

  summaryTab: string;
  summaryTabSub: Subscription;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.summaryTabSub = this.pumpInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });
  }

  ngOnDestroy(){
    this.summaryTabSub.unsubscribe();
  }

}
