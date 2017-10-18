import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRollupComponent } from './report-rollup.component';
import { ReportRollupService } from './report-rollup.service';
import { ReportSummaryComponent } from './report-summary/report-summary.component';
import { ReportBannerComponent } from './report-banner/report-banner.component';
import { PsatSummaryComponent } from './report-summary/psat-summary/psat-summary.component';

import { PsatModule } from '../psat/psat.module';
import { PhastReportModule } from '../phast/phast-report/phast-report.module';
import { PhastSummaryComponent } from './report-summary/phast-summary/phast-summary.component';

@NgModule({
  imports: [
    CommonModule,
    PsatModule,
    PhastReportModule
  ],
  declarations: [ReportRollupComponent, ReportBannerComponent, ReportSummaryComponent, PsatSummaryComponent, PhastSummaryComponent],
  providers: [ReportRollupService],
  exports: [ReportRollupComponent]
})
export class ReportRollupModule { }
