import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FsatReportComponent } from './fsat-report.component';
import { InputSummaryComponent } from './input-summary/input-summary.component';
import { ResultsSummaryComponent } from './results-summary/results-summary.component';
import { FsatReportGraphsComponent } from './fsat-report-graphs/fsat-report-graphs.component';
import { SharedModule } from '../../shared/shared.module';
import { FieldDataSummaryComponent } from './input-summary/field-data-summary/field-data-summary.component';
import { FanMotorSummaryComponent } from './input-summary/fan-motor-summary/fan-motor-summary.component';
import { FanSetupSummaryComponent } from './input-summary/fan-setup-summary/fan-setup-summary.component';
import { BaseGasDensitySummaryComponent } from './input-summary/base-gas-density-summary/base-gas-density-summary.component';
import { FsatBarChartComponent } from './fsat-report-graphs/fsat-bar-chart/fsat-bar-chart.component';
import { FsatSankeyModule } from '../fsat-sankey/fsat-sankey.module';
import { FsatReportSankeyComponent } from './fsat-report-sankey/fsat-report-sankey.component';
import { FsatReportService } from './fsat-report.service';
import { ModalModule } from '../../../../node_modules/ngx-bootstrap';
import { FsatReportGraphsPrintComponent } from './fsat-report-graphs/fsat-report-graphs-print/fsat-report-graphs-print.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FsatSankeyModule,
    ModalModule,
  ],
  declarations: [FsatReportComponent, FsatReportGraphsComponent, FsatBarChartComponent, InputSummaryComponent, ResultsSummaryComponent, FieldDataSummaryComponent, FanMotorSummaryComponent, FanSetupSummaryComponent, BaseGasDensitySummaryComponent, FsatReportSankeyComponent, FsatReportGraphsPrintComponent],
  exports: [FsatReportComponent],
  providers: [
    FsatReportService
  ]
})
export class FsatReportModule { }
