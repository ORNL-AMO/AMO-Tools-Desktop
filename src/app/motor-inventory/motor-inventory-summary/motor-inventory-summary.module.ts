import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventorySummaryGraphsComponent } from './inventory-summary-graphs/inventory-summary-graphs.component';
import { InventorySummaryTableComponent } from './inventory-summary-table/inventory-summary-table.component';
import { InventorySummaryOverviewComponent } from './inventory-summary-overview/inventory-summary-overview.component';
import { MotorInventorySummaryComponent } from './motor-inventory-summary.component';
import { InventorySummaryOverviewService } from './inventory-summary-overview/inventory-summary-overview.service';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { MotorSummaryTablePipe } from './inventory-summary-table/motor-summary-table.pipe';
import { InventorySummaryTableService } from './inventory-summary-table/inventory-summary-table.service';
import { InventorySummaryGraphsMenuComponent } from './inventory-summary-graphs/inventory-summary-graphs-menu/inventory-summary-graphs-menu.component';
import { InventorySummaryGraphComponent } from './inventory-summary-graphs/inventory-summary-graph/inventory-summary-graph.component';
import { InventorySummaryGraphsService } from './inventory-summary-graphs/inventory-summary-graphs.service';
import { MotorInventorySummaryService } from './motor-inventory-summary.service';
import { InventorySummaryMotorDetailsModule } from './inventory-summary-motor-details/inventory-summary-motor-details.module';
import { InventoryOverviewTableComponent } from './inventory-summary-overview/inventory-overview-table/inventory-overview-table.component';
import { InventoryOverviewBarChartComponent } from './inventory-summary-overview/inventory-overview-bar-chart/inventory-overview-bar-chart.component';
import { InventoryOverviewPieChartComponent } from './inventory-summary-overview/inventory-overview-pie-chart/inventory-overview-pie-chart.component';

@NgModule({
  declarations: [
    MotorInventorySummaryComponent,
    InventorySummaryGraphsComponent,
    InventorySummaryTableComponent,
    InventorySummaryOverviewComponent,
    MotorSummaryTablePipe,
    InventorySummaryGraphsMenuComponent,
    InventorySummaryGraphComponent,
    InventoryOverviewTableComponent,
    InventoryOverviewBarChartComponent,
    InventoryOverviewPieChartComponent,
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    InventorySummaryMotorDetailsModule
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
