import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../motor-inventory.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-motor-inventory-summary',
    templateUrl: './motor-inventory-summary.component.html',
    styleUrls: ['./motor-inventory-summary.component.css'],
    standalone: false
})
export class MotorInventorySummaryComponent implements OnInit {
  summaryTab: string;
  summaryTabSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.summaryTabSub = this.motorInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });
  }

  ngOnDestroy(){
    this.summaryTabSub.unsubscribe();
  }

}
