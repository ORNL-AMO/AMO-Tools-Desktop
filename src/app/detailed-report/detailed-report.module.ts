import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';

import { DetailedReportComponent } from './detailed-report.component';
import { ReportBannerComponent } from './report-banner/report-banner.component';

import { PsatModule } from '../psat/psat.module';
import { ReportSummaryComponent } from './report-summary/report-summary.component';
@NgModule({
  declarations: [
      DetailedReportComponent,
      ReportSummaryComponent,
      ReportBannerComponent
  ],
  exports: [
    DetailedReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChartsModule,
    PsatModule
  ],
  providers: [
  ]
})

export class DetailedReportModule {}