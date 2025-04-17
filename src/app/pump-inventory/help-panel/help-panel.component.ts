import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PumpInventoryService } from '../pump-inventory.service';

@Component({
    selector: 'app-help-panel',
    templateUrl: './help-panel.component.html',
    styleUrls: ['./help-panel.component.css'],
    standalone: false
})
export class HelpPanelComponent implements OnInit {
  displayHeader: boolean;

  setupTabSubscription: Subscription;
  setupTab: string;
  focusedDataGroup: string;
  focusedDataGroupSub: Subscription;
  focusedFieldSub: Subscription;
  focusedField: string;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.setupTabSubscription = this.pumpInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.displayHeader = this.setupTab != 'pump-catalog';
    });
    this.focusedFieldSub = this.pumpInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
    this.focusedDataGroupSub = this.pumpInventoryService.focusedDataGroup.subscribe(val => {
      this.focusedDataGroup = val;
    });
  }

  ngOnDestroy() {
    this.setupTabSubscription.unsubscribe();
    this.focusedDataGroupSub.unsubscribe();
    this.focusedFieldSub.unsubscribe();
  }

}