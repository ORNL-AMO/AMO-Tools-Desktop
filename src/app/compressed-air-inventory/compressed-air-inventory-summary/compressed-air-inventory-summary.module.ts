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



@NgModule({
  declarations: [
    CompressedAirInventorySummaryComponent,
    CompressedAirInventorySummaryGraphsComponent,
    CompressedAirInventorySummaryOverviewComponent,
    CompressedAirInventorySummaryTableComponent,
    CompressedAirSummaryGraphComponent,
    CompressedAirSummaryGraphsMenuComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    ExportableResultsTableModule,
  ],
  providers: [
    CompressedAirSummaryService,
    CompressedAirInventorySummaryGraphsService

  ],
  exports: [
    CompressedAirInventorySummaryComponent
  ]
})
export class CompressedAirInventorySummaryModule { }
