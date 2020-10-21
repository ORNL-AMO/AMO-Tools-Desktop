import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterReportComponent } from './waste-water-report.component';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { ResultDataComponent } from './result-data/result-data.component';
import { InputDataComponent } from './input-data/input-data.component';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { AeratorPerformanceDataComponent } from './input-data/aerator-performance-data/aerator-performance-data.component';
import { ActivatedSludgeDataComponent } from './input-data/activated-sludge-data/activated-sludge-data.component';
import { SystemDataComponent } from './input-data/system-data/system-data.component';



@NgModule({
  declarations: [WasteWaterReportComponent, ResultDataComponent, InputDataComponent, AeratorPerformanceDataComponent, ActivatedSludgeDataComponent, SystemDataComponent],
  imports: [
    CommonModule,
    FacilityInfoSummaryModule,
    PercentGraphModule
  ],
  exports: [
    WasteWaterReportComponent
  ]
})
export class WasteWaterReportModule { }
