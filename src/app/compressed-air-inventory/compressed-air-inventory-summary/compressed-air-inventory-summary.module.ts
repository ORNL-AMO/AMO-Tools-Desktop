import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirInventorySummaryComponent } from './compressed-air-inventory-summary.component';
import { CompressedAirSummaryService } from './compressed-air-inventory-summary.service';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [
    CompressedAirInventorySummaryComponent
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
