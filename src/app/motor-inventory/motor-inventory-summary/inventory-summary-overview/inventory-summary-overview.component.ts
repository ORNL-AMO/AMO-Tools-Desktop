import { Component, OnInit } from '@angular/core';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventoryService } from '../../motor-inventory.service';
import { InventorySummaryOverviewService, InventorySummaryData } from './inventory-summary-overview.service';

@Component({
  selector: 'app-inventory-summary-overview',
  templateUrl: './inventory-summary-overview.component.html',
  styleUrls: ['./inventory-summary-overview.component.css']
})
export class InventorySummaryOverviewComponent implements OnInit {

  inventorySummaryData: InventorySummaryData;
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryOverviewService: InventorySummaryOverviewService) { }

  ngOnInit(): void {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.inventorySummaryData = this.inventorySummaryOverviewService.getInventorySummaryData(motorInventoryData);
  }


  getData(d: { pipe?: string, value: any }) {
    if (d.pipe) {
      return d.value + ' | ' + d.pipe;
    } else {
      return d.value;
    }
  }
}
