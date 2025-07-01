import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FsatReportComponent } from './fsat-report.component';
import { InputSummaryComponent } from './input-summary/input-summary.component';
import { ResultsSummaryComponent } from './results-summary/results-summary.component';
import { FsatReportGraphsComponent } from './fsat-report-graphs/fsat-report-graphs.component';
import { FieldDataSummaryComponent } from './input-summary/field-data-summary/field-data-summary.component';
import { FanMotorSummaryComponent } from './input-summary/fan-motor-summary/fan-motor-summary.component';
import { FanSetupSummaryComponent } from './input-summary/fan-setup-summary/fan-setup-summary.component';
import { BaseGasDensitySummaryComponent } from './input-summary/base-gas-density-summary/base-gas-density-summary.component';
import { FsatSankeyModule } from '../../shared/fsat-sankey/fsat-sankey.module';
import { FsatReportSankeyComponent } from './fsat-report-sankey/fsat-report-sankey.component';
import { FsatReportGraphsPrintComponent } from './fsat-report-graphs/fsat-report-graphs-print/fsat-report-graphs-print.component';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { PieChartModule } from '../../shared/pie-chart/pie-chart.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { DetailedResultsComponent } from './detailed-results/detailed-results.component';
import { TraverseResultsComponent } from './detailed-results/traverse-results/traverse-results.component';
import { FanOperationsSummaryComponent } from './input-summary/fan-operations-summary/fan-operations-summary.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FsatSankeyModule,
    ModalModule,
    PrintOptionsMenuModule,
    FacilityInfoSummaryModule,
    PercentGraphModule,
    PieChartModule,
    SharedPipesModule,
    ExportableResultsTableModule
  ],
  declarations: [FsatReportComponent, FsatReportGraphsComponent, InputSummaryComponent, ResultsSummaryComponent, FieldDataSummaryComponent, FanMotorSummaryComponent, FanSetupSummaryComponent, BaseGasDensitySummaryComponent, FsatReportSankeyComponent, FsatReportGraphsPrintComponent, DetailedResultsComponent, TraverseResultsComponent, FanOperationsSummaryComponent],
  exports: [FsatReportComponent]
})
export class FsatReportModule { }
