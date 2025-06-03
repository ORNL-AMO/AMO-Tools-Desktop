import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryService } from '../compressed-air-inventory.service';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrl: './help-panel.component.css',
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
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.setupTabSubscription = this.compressedAirInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.displayHeader = this.setupTab != 'pump-catalog';
    });
    this.focusedFieldSub = this.compressedAirInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
    this.focusedDataGroupSub = this.compressedAirInventoryService.focusedDataGroup.subscribe(val => {
      this.focusedDataGroup = val;
    });
  }

  ngOnDestroy() {
    this.setupTabSubscription.unsubscribe();
    this.focusedDataGroupSub.unsubscribe();
    this.focusedFieldSub.unsubscribe();
  }

}
