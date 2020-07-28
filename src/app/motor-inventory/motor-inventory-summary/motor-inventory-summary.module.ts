import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventorySummaryGraphsComponent } from './inventory-summary-graphs/inventory-summary-graphs.component';
import { InventorySummaryTableComponent } from './inventory-summary-table/inventory-summary-table.component';
import { InventorySummaryOverviewComponent } from './inventory-summary-overview/inventory-summary-overview.component';
import { InventorySummaryMotorDetailsComponent } from './inventory-summary-motor-details/inventory-summary-motor-details.component';
import { MotorInventorySummaryComponent } from './motor-inventory-summary.component';



@NgModule({
  declarations: [
    MotorInventorySummaryComponent, 
    InventorySummaryGraphsComponent, 
    InventorySummaryTableComponent, 
    InventorySummaryOverviewComponent, 
    InventorySummaryMotorDetailsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MotorInventorySummaryComponent
  ]
})
export class MotorInventorySummaryModule { }
