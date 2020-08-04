import { Component, OnInit, Input } from '@angular/core';
import { MotorInventoryService } from '../motor-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-motor-inventory-summary',
  templateUrl: './motor-inventory-summary.component.html',
  styleUrls: ['./motor-inventory-summary.component.css']
})
export class MotorInventorySummaryComponent implements OnInit {
  @Input()
  settings: Settings;

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
