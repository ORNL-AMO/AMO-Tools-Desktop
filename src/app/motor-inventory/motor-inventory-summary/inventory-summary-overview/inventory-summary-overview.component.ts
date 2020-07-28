import { Component, OnInit } from '@angular/core';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventoryService } from '../../motor-inventory.service';

@Component({
  selector: 'app-inventory-summary-overview',
  templateUrl: './inventory-summary-overview.component.html',
  styleUrls: ['./inventory-summary-overview.component.css']
})
export class InventorySummaryOverviewComponent implements OnInit {

  motorInventoryData: MotorInventoryData;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    console.log(this.motorInventoryData);
  }

}
