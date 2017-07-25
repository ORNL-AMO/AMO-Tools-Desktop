import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DetailedReportComponent } from './detailed-report.component';
import { ReportBannerComponent } from './report-banner/report-banner.component';

import { PsatModule } from '../psat/psat.module';
import { ReportSummaryComponent } from './report-summary/report-summary.component';
import { ModalModule } from 'ngx-bootstrap';
import { PsatSummaryComponent } from './report-summary/psat-summary/psat-summary.component';
@NgModule({
  declarations: [
      DetailedReportComponent,
      ReportSummaryComponent,
      ReportBannerComponent,
      PsatSummaryComponent
  ],
  exports: [
    DetailedReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChartsModule,
    PsatModule,
    ModalModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
  ]
})

export class DetailedReportModule {}