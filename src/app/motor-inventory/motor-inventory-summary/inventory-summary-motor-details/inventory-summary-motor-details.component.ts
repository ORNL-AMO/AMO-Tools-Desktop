import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { MotorInventoryService } from '../../motor-inventory.service';
import { MotorInventoryData } from '../../motor-inventory';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-summary-motor-details',
  templateUrl: './inventory-summary-motor-details.component.html',
  styleUrls: ['./inventory-summary-motor-details.component.css']
})
export class InventorySummaryMotorDetailsComponent implements OnInit {

  settings: Settings;
  settingsSub: Subscription;
  motorInventoryData: MotorInventoryData;
  filterInventorySummarySub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      let inventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
      this.motorInventoryData = this.motorInventoryService.filterMotorInventoryData(inventoryData, val);
    });

    this.settingsSub = this.motorInventoryService.settings.subscribe(val => {
      this.settings = val;
    })
  }

  ngOnDestroy(){
    this.filterInventorySummarySub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

}
