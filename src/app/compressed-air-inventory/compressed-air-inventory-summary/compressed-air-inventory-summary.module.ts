import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirInventorySummaryComponent } from './compressed-air-inventory-summary.component';
import { CompressedAirSummaryService } from './compressed-air-inventory-summary.service';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { CompressedAirInventorySummaryGraphsComponent } from './compressed-air-inventory-summary-graphs/compressed-air-inventory-summary-graphs.component';
import { CompressedAirInventorySummaryOverviewComponent } from './compressed-air-inventory-summary-overview/compressed-air-inventory-summary-overview.component';
import { CompressedAirInventorySummaryTableComponent } from './compressed-air-inventory-summary-table/compressed-air-inventory-summary-table.component';
import { CompressedAirInventorySummaryGraphsService } from './compressed-air-inventory-summary-graphs/compressed-air-inventory-summary-graphs.service';
import { CompressedAirSummaryGraphComponent } from './compressed-air-inventory-summary-graphs/compressed-air-summary-graph/compressed-air-summary-graph.component';
import { CompressedAirSummaryGraphsMenuComponent } from './compressed-air-inventory-summary-graphs/compressed-air-summary-graphs-menu/compressed-air-summary-graphs-menu.component';
import { CompressedAirInventorySummaryOverviewService } from './compressed-air-inventory-summary-overview/compressed-air-inventory-summary-overview.service';
import { CompressedAirInventoryOverviewTableComponent } from './compressed-air-inventory-summary-overview/compressed-air-inventory-overview-table/compressed-air-inventory-overview-table.component';
import { CompressedAirInventoryOverviewBarChartComponent } from './compressed-air-inventory-summary-overview/compressed-air-inventory-overview-bar-chart/compressed-air-inventory-overview-bar-chart.component';
import { CompressedAirInventoryOverviewPieChartComponent } from './compressed-air-inventory-summary-overview/compressed-air-inventory-overview-pie-chart/compressed-air-inventory-overview-pie-chart.component';
import { CompressedAirInventorySummaryTableService } from './compressed-air-inventory-summary-table/compressed-air-inventory-summary-table.service';
import { CompressedAirInventorySummaryTablePipe } from './compressed-air-inventory-summary-table/compressed-air-inventory-summary-table.pipe';
import { SettingsLabelPipe } from '../../shared/shared-pipes/settings-label.pipe';



@NgModule({
  declarations: [
    CompressedAirInventorySummaryComponent,
    CompressedAirInventorySummaryGraphsComponent,
    CompressedAirInventorySummaryOverviewComponent,
    CompressedAirInventorySummaryTableComponent,
    CompressedAirSummaryGraphComponent,
    CompressedAirSummaryGraphsMenuComponent,
    CompressedAirInventoryOverviewTableComponent,
    CompressedAirInventoryOverviewBarChartComponent,
    CompressedAirInventoryOverviewPieChartComponent,
    CompressedAirInventorySummaryTablePipe

  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    ExportableResultsTableModule,
  ],
  providers: [
    CompressedAirSummaryService,
    CompressedAirInventorySummaryGraphsService,
    CompressedAirInventorySummaryOverviewService,
    CompressedAirInventorySummaryTableService,
    SettingsLabelPipe

  ],
  exports: [
    CompressedAirInventorySummaryComponent
  ]
})
export class CompressedAirInventorySummaryModule { }
