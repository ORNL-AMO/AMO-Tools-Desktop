import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirInventorySummaryComponent } from './compressed-air-inventory-summary.component';
import { CompressedAirSummaryService } from './compressed-air-inventory-summary.service';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { CompressedAirInventorySummaryGraphsComponent } from './compressed-air-inventory-summary-graphs/compressed-air-inventory-summary-graphs.component';
import { CompressedAirInventorySummaryOverviewComponent } from './compressed-air-inventory-summary-overview/compressed-air-inventory-summary-overview.component';
import { CompressedAirInventorySummaryTableComponent } from './compressed-air-inventory-summary-table/compressed-air-inventory-summary-table.component';



@NgModule({
  declarations: [
    CompressedAirInventorySummaryComponent,
    CompressedAirInventorySummaryGraphsComponent,
    CompressedAirInventorySummaryOverviewComponent,
    CompressedAirInventorySummaryTableComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    ExportableResultsTableModule,
  ],
  providers: [
    CompressedAirSummaryService

  ],
  exports: [
    CompressedAirInventorySummaryComponent
  ]
})
export class CompressedAirInventorySummaryModule { }
