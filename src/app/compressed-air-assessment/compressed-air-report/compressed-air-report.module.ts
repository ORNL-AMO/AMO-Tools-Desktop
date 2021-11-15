import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { InputSummaryComponent } from './input-summary/input-summary.component';
import { PaybackPeriodComponent } from './payback-period/payback-period.component';
import { ReportGraphsComponent } from './report-graphs/report-graphs.component';
import { SystemProfilesComponent } from './system-profiles/system-profiles.component';
import { CompressedAirReportComponent } from './compressed-air-report.component';
import { SystemInfoSummaryComponent } from './input-summary/system-info-summary/system-info-summary.component';
import { CompressorItemSummaryComponent } from './input-summary/compressor-item-summary/compressor-item-summary.component';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { ProfileSummaryTableModule } from '../profile-summary-table/profile-summary-table.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { FormsModule } from '@angular/forms';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { SharedCompressorPipesModule } from '../shared-compressor-pipes/shared-compressor-pipes.module';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';

@NgModule({
  declarations: [
    ExecutiveSummaryComponent,
    InputSummaryComponent,
    PaybackPeriodComponent,
    ReportGraphsComponent,
    SystemProfilesComponent,
    CompressedAirReportComponent,
    SystemInfoSummaryComponent,
    CompressorItemSummaryComponent,
  ],
  imports: [
    CommonModule,
    PercentGraphModule,
    ProfileSummaryTableModule,
    SharedPipesModule,
    FormsModule,
    FacilityInfoSummaryModule,
    SharedCompressorPipesModule,
    PrintOptionsMenuModule,
    
  ],
  exports: [
    CompressedAirReportComponent
  ]
})
export class CompressedAirReportModule { }
