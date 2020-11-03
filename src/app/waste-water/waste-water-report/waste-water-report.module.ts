import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterReportComponent } from './waste-water-report.component';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { ResultDataComponent } from './result-data/result-data.component';
import { InputDataComponent } from './input-data/input-data.component';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { SrtGraphsComponent } from './srt-graphs/srt-graphs.component';
import { WasteWaterAnalysisModule } from '../waste-water-analysis/waste-water-analysis.module';


@NgModule({
  declarations: [WasteWaterReportComponent, ResultDataComponent, InputDataComponent, SrtGraphsComponent],
  imports: [
    CommonModule,
    FacilityInfoSummaryModule,
    PercentGraphModule,
    WasteWaterAnalysisModule
  ],
  exports: [
    WasteWaterReportComponent
  ]
})
export class WasteWaterReportModule { }
