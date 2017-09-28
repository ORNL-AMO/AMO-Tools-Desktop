import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhastReportComponent } from './phast-report.component';
import { EnergyUsedComponent } from './energy-used/energy-used.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { ResultsDataComponent } from './results-data/results-data.component';
import { ReportGraphsComponent } from './report-graphs/report-graphs.component';
import { ReportSankeyComponent } from './report-sankey/report-sankey.component';
import { SankeyModule } from '../sankey/sankey.module';
@NgModule({
  imports: [
    CommonModule,
    SankeyModule
  ],
  declarations: [PhastReportComponent, EnergyUsedComponent, ExecutiveSummaryComponent, ResultsDataComponent, ReportGraphsComponent, ReportSankeyComponent],
  exports: [PhastReportComponent]
})
export class PhastReportModule { }
