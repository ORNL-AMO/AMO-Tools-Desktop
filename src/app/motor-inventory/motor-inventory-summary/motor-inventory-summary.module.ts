import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventorySummaryGraphsComponent } from './inventory-summary-graphs/inventory-summary-graphs.component';
import { InventorySummaryTableComponent } from './inventory-summary-table/inventory-summary-table.component';
import { InventorySummaryOverviewComponent } from './inventory-summary-overview/inventory-summary-overview.component';
import { InventorySummaryMotorDetailsComponent } from './inventory-summary-motor-details/inventory-summary-motor-details.component';
import { MotorInventorySummaryComponent } from './motor-inventory-summary.component';
import { InventorySummaryOverviewService } from './inventory-summary-overview/inventory-summary-overview.service';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { MotorSummaryTablePipe } from './inventory-summary-overview/motor-summary-table.pipe';

@NgModule({
  declarations: [
    MotorInventorySummaryComponent,
    InventorySummaryGraphsComponent,
    InventorySummaryTableComponent,
    InventorySummaryOverviewComponent,
    InventorySummaryMotorDetailsComponent,
    MotorSummaryTablePipe
  ],
  imports: [
    CommonModule,
    SharedPipesModule
  ],
  exports: [
    MotorInventorySummaryComponent
  ],
  providers: [
    InventorySummaryOverviewService
  ]
})
export class MotorInventorySummaryModule { }
