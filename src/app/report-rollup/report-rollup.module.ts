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

import { SharedModule } from '../shared/shared.module';
import { ReportRollupUnitsComponent } from './report-rollup-units/report-rollup-units.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PsatRollupComponent } from './psat-rollup/psat-rollup.component';
import { PsatRollupEnergyTableComponent } from './psat-rollup/psat-rollup-energy-table/psat-rollup-energy-table.component';
import { PsatRollupGraphsComponent } from './psat-rollup/psat-rollup-graphs/psat-rollup-graphs.component';
import { PsatRollupPumpSummaryComponent } from './psat-rollup/psat-rollup-pump-summary/psat-rollup-pump-summary.component';
import { PhastRollupFurnaceSummaryComponent } from './phast-rollup/phast-rollup-furnace-summary/phast-rollup-furnace-summary.component';
import { PhastRollupPrintComponent } from './phast-rollup/phast-rollup-print/phast-rollup-print.component';
import { ReportRollupPrintComponent } from './report-rollup-print/report-rollup-print.component';
import { RollupPieChartComponent } from './rollup-pie-chart/rollup-pie-chart.component';
import { RollupBarChartComponent } from './rollup-bar-chart/rollup-bar-chart.component';
import { PhastRollupEnergyUseTableComponent } from './phast-rollup/phast-rollup-energy-use-table/phast-rollup-energy-use-table.component';
import { PsatRollupPrintComponent } from './psat-rollup/psat-rollup-print/psat-rollup-print.component';
import { PsatRollupPumpSummaryTableComponent } from './psat-rollup/psat-rollup-pump-summary-table/psat-rollup-pump-summary-table.component';
import { PhastRollupFurnaceSummaryTableComponent } from './phast-rollup/phast-rollup-furnace-summary/phast-rollup-furnace-summary-table/phast-rollup-furnace-summary-table.component';
import { PreAssessmentModule } from '../calculator/utilities/pre-assessment/pre-assessment.module';
import { PreAssessmentTableComponent } from './pre-assessment-table/pre-assessment-table.component';
import { FsatReportModule } from '../fsat/fsat-report/fsat-report.module';
import { FsatSummaryComponent } from './report-summary/fsat-summary/fsat-summary.component';

@NgModule({
  imports: [
    CommonModule,
    PsatModule,
    PhastReportModule,
    ModalModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PreAssessmentModule,
    FsatReportModule
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
    PhastRollupFurnaceSummaryComponent,
    PhastRollupPrintComponent,
    ReportRollupPrintComponent,
    RollupPieChartComponent,
    RollupBarChartComponent,
    PhastRollupEnergyUseTableComponent,
    PsatRollupPrintComponent,
    PsatRollupPumpSummaryTableComponent,
    PhastRollupFurnaceSummaryTableComponent,
    PreAssessmentTableComponent,
    FsatSummaryComponent
  ],
  providers: [ReportRollupService],
  exports: [ReportRollupComponent]
})
export class ReportRollupModule { }
