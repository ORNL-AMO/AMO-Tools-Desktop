import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../motor-inventory.service';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {

  displayHeader: boolean;

  setupTabSubscription: Subscription;
  setupTab: string;
  focusedDataGroup: string;
  focusedDataGroupSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.setupTabSubscription = this.motorInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      console.log(this.setupTab)
      this.displayHeader = this.setupTab != 'motor-catalog';
    });
    this.focusedDataGroupSub = this.motorInventoryService.focusedDataGroup.subscribe(val => {
      this.focusedDataGroup = val;
    });
  }

  ngOnDestroy() {
    this.setupTabSubscription.unsubscribe();
    this.focusedDataGroupSub.unsubscribe();
  }

}
