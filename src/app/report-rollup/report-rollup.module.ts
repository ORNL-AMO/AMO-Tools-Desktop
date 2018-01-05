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
import { PhastRollupComponent } from './phast-rollup/phast-rollup.component';
import { ModalModule } from 'ngx-bootstrap/modal/modal.module';
import { PhastRollupGraphsComponent } from './phast-rollup/phast-rollup-graphs/phast-rollup-graphs.component';
import { PhastRollupEnergyTableComponent } from './phast-rollup/phast-rollup-energy-table/phast-rollup-energy-table.component';
import { PhastRollupFurnaceSummaryComponent } from './phast-rollup/phast-rollup-furnace-summary/phast-rollup-furnace-summary.component';

@NgModule({
  imports: [
    CommonModule,
    PsatModule,
    PhastReportModule,
    ModalModule
  ],
  declarations: [ReportRollupComponent, ReportBannerComponent, ReportSummaryComponent, PsatSummaryComponent, PhastSummaryComponent, PhastRollupComponent, PhastRollupGraphsComponent, PhastRollupEnergyTableComponent, PhastRollupFurnaceSummaryComponent],
  providers: [ReportRollupService],
  exports: [ReportRollupComponent]
})
export class ReportRollupModule { }
