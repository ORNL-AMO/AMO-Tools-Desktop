import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventorySummaryService } from '../../motor-inventory-summary/motor-inventory-summary.service';
import { Subscription } from 'rxjs';
import { InventorySummaryGraphsService } from '../../motor-inventory-summary/inventory-summary-graphs/inventory-summary-graphs.service';

@Component({
  selector: 'app-summary-filter',
  templateUrl: './summary-filter.component.html',
  styleUrls: ['./summary-filter.component.css']
})
export class SummaryFilterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
