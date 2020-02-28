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
import { ModalModule } from 'ngx-bootstrap';
import { PhastRollupGraphsComponent } from './phast-rollup/phast-rollup-graphs/phast-rollup-graphs.component';
import { PhastRollupEnergyTableComponent } from './phast-rollup/phast-rollup-energy-table/phast-rollup-energy-table.component';
import { ReportRollupUnitsComponent } from './report-rollup-units/report-rollup-units.component';
import { FormsModule } from '@angular/forms';
import { PsatRollupComponent } from './psat-rollup/psat-rollup.component';
import { PsatRollupEnergyTableComponent } from './psat-rollup/psat-rollup-energy-table/psat-rollup-energy-table.component';
import { PsatRollupGraphsComponent } from './psat-rollup/psat-rollup-graphs/psat-rollup-graphs.component';
import { PsatRollupPumpSummaryComponent } from './psat-rollup/psat-rollup-pump-summary/psat-rollup-pump-summary.component';
import { PhastRollupFurnaceSummaryComponent } from './phast-rollup/phast-rollup-furnace-summary/phast-rollup-furnace-summary.component';
import { PhastRollupPrintComponent } from './phast-rollup/phast-rollup-print/phast-rollup-print.component';
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
import { FsatRollupComponent } from './fsat-rollup/fsat-rollup.component';
import { FsatRollupEnergyTableComponent } from './fsat-rollup/fsat-rollup-energy-table/fsat-rollup-energy-table.component';
import { FsatRollupFanSummaryComponent } from './fsat-rollup/fsat-rollup-fan-summary/fsat-rollup-fan-summary.component';
import { FsatRollupFanSummaryTableComponent } from './fsat-rollup/fsat-rollup-fan-summary-table/fsat-rollup-fan-summary-table.component';
import { FsatRollupGraphsComponent } from './fsat-rollup/fsat-rollup-graphs/fsat-rollup-graphs.component';
import { FsatRollupPrintComponent } from './fsat-rollup/fsat-rollup-print/fsat-rollup-print.component';
import { SsmtReportModule } from '../ssmt/ssmt-report/ssmt-report.module';
import { SsmtSummaryComponent } from './report-summary/ssmt-summary/ssmt-summary.component';
import { SsmtRollupComponent } from './ssmt-rollup/ssmt-rollup.component';
import { SsmtRollupGraphsComponent } from './ssmt-rollup/ssmt-rollup-graphs/ssmt-rollup-graphs.component';
import { SsmtRollupSteamSummaryComponent } from './ssmt-rollup/ssmt-rollup-steam-summary/ssmt-rollup-steam-summary.component';
import { SsmtRollupEnergyTableComponent } from './ssmt-rollup/ssmt-rollup-energy-table/ssmt-rollup-energy-table.component';
import { SsmtRollupSteamSummaryTableComponent } from './ssmt-rollup/ssmt-rollup-steam-summary-table/ssmt-rollup-steam-summary-table.component';
import { TreasureHuntReportModule } from '../treasure-hunt/treasure-hunt-report/treasure-hunt-report.module';
import { TreasureHuntSummaryComponent } from './report-summary/treasure-hunt-summary/treasure-hunt-summary.component';
import { PrintOptionsMenuModule } from '../shared/print-options-menu/print-options-menu.module';
import { PieChartModule } from '../shared/pie-chart/pie-chart.module';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { AssessmentReportsComponent } from './assessment-reports/assessment-reports.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { ReportRollupModalsComponent } from './report-rollup-modals/report-rollup-modals.component';
import { PreAssessmentPrintComponent } from './pre-assessment-print/pre-assessment-print.component';

@NgModule({
  imports: [
    CommonModule,
    PsatModule,
    PhastReportModule,
    ModalModule,
    FormsModule,
    PreAssessmentModule,
    FsatReportModule,
    SsmtReportModule,
    TreasureHuntReportModule,
    PrintOptionsMenuModule,
    PieChartModule,
    SharedPipesModule,
    RouterModule
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
    RollupPieChartComponent,
    RollupBarChartComponent,
    PhastRollupEnergyUseTableComponent,
    PsatRollupPrintComponent,
    PsatRollupPumpSummaryTableComponent,
    PhastRollupFurnaceSummaryTableComponent,
    PreAssessmentTableComponent,
    FsatSummaryComponent,
    FsatRollupComponent,
    FsatRollupEnergyTableComponent,
    FsatRollupFanSummaryComponent,
    FsatRollupFanSummaryTableComponent,
    FsatRollupGraphsComponent,
    FsatRollupPrintComponent,
    SsmtSummaryComponent,
    SsmtRollupComponent,
    SsmtRollupGraphsComponent,
    SsmtRollupSteamSummaryComponent,
    SsmtRollupEnergyTableComponent,
    SsmtRollupSteamSummaryTableComponent,
    TreasureHuntSummaryComponent,
    AssessmentReportsComponent,
    SidebarComponent,
    ReportRollupModalsComponent,
    PreAssessmentPrintComponent,

  ],
  providers: [ReportRollupService],
  exports: [ReportRollupComponent]
})
export class ReportRollupModule { }
