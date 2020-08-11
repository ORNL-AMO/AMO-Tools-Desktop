import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventorySummaryGraphsComponent } from './inventory-summary-graphs/inventory-summary-graphs.component';
import { InventorySummaryTableComponent } from './inventory-summary-table/inventory-summary-table.component';
import { InventorySummaryOverviewComponent } from './inventory-summary-overview/inventory-summary-overview.component';
import { InventorySummaryMotorDetailsComponent } from './inventory-summary-motor-details/inventory-summary-motor-details.component';
import { MotorInventorySummaryComponent } from './motor-inventory-summary.component';
import { InventorySummaryOverviewService } from './inventory-summary-overview/inventory-summary-overview.service';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { MotorSummaryTablePipe } from './inventory-summary-table/motor-summary-table.pipe';
import { InventorySummaryTableService } from './inventory-summary-table/inventory-summary-table.service';
import { InventorySummaryGraphsMenuComponent } from './inventory-summary-graphs/inventory-summary-graphs-menu/inventory-summary-graphs-menu.component';
import { InventorySummaryGraphComponent } from './inventory-summary-graphs/inventory-summary-graph/inventory-summary-graph.component';
import { InventorySummaryGraphsService } from './inventory-summary-graphs/inventory-summary-graphs.service';
import { SummaryFilterComponent } from './summary-filter/summary-filter.component';
import { MotorInventorySummaryService } from './motor-inventory-summary.service';

@NgModule({
  declarations: [
    MotorInventorySummaryComponent,
    InventorySummaryGraphsComponent,
    InventorySummaryTableComponent,
    InventorySummaryOverviewComponent,
    InventorySummaryMotorDetailsComponent,
    MotorSummaryTablePipe,
    InventorySummaryGraphsMenuComponent,
    InventorySummaryGraphComponent,
    SummaryFilterComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule
  ],
  exports: [
    MotorInventorySummaryComponent
  ],
  providers: [
    InventorySummaryOverviewService,
    InventorySummaryTableService,
    InventorySummaryGraphsService,
    MotorInventorySummaryService
  ]
})
export class MotorInventorySummaryModule { }
