import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterReportComponent } from './waste-water-report.component';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { ResultDataComponent } from './result-data/result-data.component';
import { InputDataComponent } from './input-data/input-data.component';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { SrtGraphsComponent } from './srt-graphs/srt-graphs.component';
import { WasteWaterAnalysisModule } from '../waste-water-analysis/waste-water-analysis.module';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';


@NgModule({
  declarations: [WasteWaterReportComponent, ResultDataComponent, InputDataComponent, SrtGraphsComponent],
  imports: [
    CommonModule,
    FacilityInfoSummaryModule,
    PercentGraphModule,
    WasteWaterAnalysisModule,
    PrintOptionsMenuModule,
    FormsModule,
    SharedPipesModule,
    ExportableResultsTableModule
  ],
  exports: [
    WasteWaterReportComponent
  ]
})
export class WasteWaterReportModule { }
