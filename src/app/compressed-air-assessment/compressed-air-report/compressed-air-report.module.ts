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
import { CompressorSummaryTableModule } from '../compressor-summary-table/compressor-summary-table.module';
import { SystemProfileGraphsModule } from '../system-profile-graphs/system-profile-graphs.module';
import { InventoryPerformanceProfileModule } from '../inventory-performance-profile/inventory-performance-profile.module';
import { PerformanceProfilesComponent } from './performance-profiles/performance-profiles.component';
import { CentrifugalGraphModule } from '../centrifugal-graph/centrifugal-graph.module';
import { EndUseSummaryComponent } from './input-summary/end-use-summary/end-use-summary.component';
import { CompressedAirSankeyModule } from '../compressed-air-sankey/compressed-air-sankey.module';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';

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
    PerformanceProfilesComponent,
    EndUseSummaryComponent
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
    CompressorSummaryTableModule,
    SystemProfileGraphsModule,
    InventoryPerformanceProfileModule,
    CentrifugalGraphModule,
    CompressedAirSankeyModule,
    ExportableResultsTableModule
  ],
  exports: [
    CompressedAirReportComponent
  ]
})
export class CompressedAirReportModule { }
