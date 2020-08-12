import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { MotorInventoryService } from '../../motor-inventory.service';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventorySummaryService } from '../motor-inventory-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-summary-motor-details',
  templateUrl: './inventory-summary-motor-details.component.html',
  styleUrls: ['./inventory-summary-motor-details.component.css']
})
export class InventorySummaryMotorDetailsComponent implements OnInit {
  @Input()
  settings: Settings;


  motorInventoryData: MotorInventoryData;
  filterInventorySummarySub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private motorInventorySummaryService: MotorInventorySummaryService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.motorInventorySummaryService.filterInventorySummary.subscribe(val => {
      let inventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
      this.motorInventoryData = this.motorInventorySummaryService.filterMotorInventoryData(inventoryData, val);
    });
  }

}
