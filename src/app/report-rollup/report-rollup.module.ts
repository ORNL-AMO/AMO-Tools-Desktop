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

import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { ReportRollupUnitsComponent } from './report-rollup-units/report-rollup-units.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PsatRollupComponent } from './psat-rollup/psat-rollup.component';
import { PsatRollupEnergyTableComponent } from './psat-rollup/psat-rollup-energy-table/psat-rollup-energy-table.component';
import { PsatRollupGraphsComponent } from './psat-rollup/psat-rollup-graphs/psat-rollup-graphs.component';
import { PsatRollupPumpSummaryComponent } from './psat-rollup/psat-rollup-pump-summary/psat-rollup-pump-summary.component';
import { PhastRollupFurnaceSummaryComponent } from './phast-rollup/phast-rollup-furnace-summary/phast-rollup-furnace-summary.component';

@NgModule({
  imports: [
    CommonModule,
    PsatModule,
    PhastReportModule,
    ModalModule,
    ChartsModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ReportRollupComponent, 
    ReportBannerComponent, 
    ReportSummaryComponent, 
    PsatSummaryComponent, 
    PhastSummaryComponent, 
    PhastRollupComponent, 
    PhastRollupGraphsComponent, 
    PhastRollupEnergyTableComponent, 
    ReportRollupUnitsComponent, 
    PsatRollupComponent, 
    PsatRollupEnergyTableComponent, 
    PsatRollupGraphsComponent, 
    PsatRollupPumpSummaryComponent,
    PhastRollupFurnaceSummaryComponent
  ],
  providers: [ReportRollupService],
  exports: [ReportRollupComponent]
})
export class ReportRollupModule { }
