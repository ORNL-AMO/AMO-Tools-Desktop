import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpInventorySummaryComponent } from './pump-inventory-summary.component';
import { InventorySummaryOverviewComponent } from './inventory-summary-overview/inventory-summary-overview.component';
import { InventorySummaryTableComponent } from './inventory-summary-table/inventory-summary-table.component';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { InventoryOverviewTableComponent } from './inventory-summary-overview/inventory-overview-table/inventory-overview-table.component';
import { InventoryOverviewPieChartComponent } from './inventory-summary-overview/inventory-overview-pie-chart/inventory-overview-pie-chart.component';
import { InventorySummaryOverviewService } from './inventory-summary-overview/inventory-summary-overview.service';
import { PumpSummaryTablePipe } from './inventory-summary-table/pump-summary-table.pipe';
import { InventorySummaryTableService } from './inventory-summary-table/inventory-summary-table.service';
import { PumpInventorySummaryService } from './pump-inventory-summary.service';
import { PumpInventoryOverviewBarChartComponent } from './inventory-summary-overview/inventory-overview-bar-chart/inventory-overview-bar-chart.component';
import { HelperFunctionsService } from '../../shared/helper-services/helper-functions.service';
import { PsatService } from '../../psat/psat.service';
import { PumpSummaryGraphComponent } from './inventory-summary-graphs/pump-summary-graph/pump-summary-graph.component';
import { PumpSummaryGraphsMenuComponent } from './inventory-summary-graphs/pump-summary-graphs-menu/pump-summary-graphs-menu.component';
import { PumpSummaryGraphsService } from './inventory-summary-graphs/pump-summary-graphs.service';
import { InventorySummaryGraphsComponent } from './inventory-summary-graphs/inventory-summary-graphs.component';
import { SettingsLabelPipe } from '../../shared/shared-pipes/settings-label.pipe';



@NgModule({
  declarations: [
    PumpInventorySummaryComponent,
    InventorySummaryOverviewComponent,
    InventorySummaryTableComponent,
    InventorySummaryGraphsComponent,
    InventoryOverviewTableComponent,
    InventoryOverviewPieChartComponent,
    PumpInventoryOverviewBarChartComponent,
    PumpSummaryTablePipe,
    PumpSummaryGraphComponent,
    PumpSummaryGraphsMenuComponent,
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    ExportableResultsTableModule,
  ],
  exports: [
    PumpInventorySummaryComponent,
  ],
  providers: [
    InventorySummaryOverviewService,
    InventorySummaryTableService,
    PumpInventorySummaryService, 
    HelperFunctionsService,
    PsatService,
    PumpSummaryGraphsService,
    SettingsLabelPipe,
  ]
})
export class PumpInventorySummaryModule { }
