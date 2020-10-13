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
import { PhastRollupEnergyTableComponent } from './phast-rollup/phast-rollup-energy-table/phast-rollup-energy-table.component';
import { ReportRollupUnitsComponent } from './report-rollup-units/report-rollup-units.component';
import { FormsModule } from '@angular/forms';
import { PsatRollupComponent } from './psat-rollup/psat-rollup.component';
import { PhastRollupPrintComponent } from './phast-rollup/phast-rollup-print/phast-rollup-print.component';
import { PhastRollupEnergyUseTableComponent } from './phast-rollup/phast-rollup-energy-use-table/phast-rollup-energy-use-table.component';
import { PsatRollupPrintComponent } from './psat-rollup/psat-rollup-print/psat-rollup-print.component';
import { PhastRollupFurnaceSummaryTableComponent } from './phast-rollup/phast-rollup-furnace-summary-table/phast-rollup-furnace-summary-table.component';
import { PreAssessmentModule } from '../calculator/utilities/pre-assessment/pre-assessment.module';
import { PreAssessmentTableComponent } from './pre-assessment-print/pre-assessment-table/pre-assessment-table.component';
import { FsatReportModule } from '../fsat/fsat-report/fsat-report.module';
import { FsatSummaryComponent } from './report-summary/fsat-summary/fsat-summary.component';
import { FsatRollupComponent } from './fsat-rollup/fsat-rollup.component';
import { FsatRollupPrintComponent } from './fsat-rollup/fsat-rollup-print/fsat-rollup-print.component';
import { SsmtReportModule } from '../ssmt/ssmt-report/ssmt-report.module';
import { SsmtSummaryComponent } from './report-summary/ssmt-summary/ssmt-summary.component';
import { SsmtRollupComponent } from './ssmt-rollup/ssmt-rollup.component';
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
import { TreasureHuntRollupComponent } from './treasure-hunt-rollup/treasure-hunt-rollup.component';
import { CostStatusComponent } from './treasure-hunt-rollup/cost-status/cost-status.component';
import { SsmtRollupPrintComponent } from './ssmt-rollup/ssmt-rollup-print/ssmt-rollup-print.component';
import { TreasureHuntRollupPrintComponent } from './treasure-hunt-rollup/treasure-hunt-rollup-print/treasure-hunt-rollup-print.component';
import { RollupSummaryBarChartComponent } from './rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { RollupSummaryTableComponent } from './rollup-summary-table/rollup-summary-table.component';
import { RollupSummaryPieChartComponent } from './rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { RollupSummaryEnergyTableComponent } from './rollup-summary-energy-table/rollup-summary-energy-table.component';

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
    PhastRollupEnergyTableComponent, 
    ReportRollupUnitsComponent, 
    PsatRollupComponent,
    PhastRollupPrintComponent,
    PhastRollupEnergyUseTableComponent,
    PsatRollupPrintComponent,
    PhastRollupFurnaceSummaryTableComponent,
    PreAssessmentTableComponent,
    FsatSummaryComponent,
    FsatRollupComponent,
    FsatRollupPrintComponent,
    SsmtSummaryComponent,
    SsmtRollupComponent,
    TreasureHuntSummaryComponent,
    AssessmentReportsComponent,
    SidebarComponent,
    ReportRollupModalsComponent,
    PreAssessmentPrintComponent,
    TreasureHuntRollupComponent,
    CostStatusComponent,
    SsmtRollupPrintComponent,
    TreasureHuntRollupPrintComponent,
    RollupSummaryBarChartComponent,
    RollupSummaryTableComponent,
    RollupSummaryPieChartComponent,
    RollupSummaryEnergyTableComponent,

  ],
  providers: [ReportRollupService],
  exports: [ReportRollupComponent]
})
export class ReportRollupModule { }
