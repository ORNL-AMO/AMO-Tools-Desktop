import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressorSummaryTableComponent } from './compressor-summary-table.component';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { SharedCompressorPipesModule } from '../shared-compressor-pipes/shared-compressor-pipes.module';



@NgModule({
  declarations: [
    CompressorSummaryTableComponent
  ],
  imports: [
    CommonModule,
    SharedCompressorPipesModule,
    ExportableResultsTableModule
  ],
  exports: [
    CompressorSummaryTableComponent
  ]
})
export class CompressorSummaryTableModule { }
