import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { WaterReportComponent } from './water-report.component';
import { SystemSummaryReportComponent } from './system-summary-report/system-summary-report.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { SystemTrueCostReportComponent } from './system-true-cost-report/system-true-cost-report.component';
import { SystemTrueCostBarComponent } from './system-true-cost-bar/system-true-cost-bar.component';
import { WaterReportService } from './water-report.service';

@NgModule({
  declarations: [
    WaterReportComponent,
    ExecutiveSummaryComponent,
    SystemSummaryReportComponent,
    SystemTrueCostReportComponent,
    SystemTrueCostBarComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
  ],
  exports: [
    WaterReportComponent,
  ],
  providers: [
    WaterReportService
  ],
})
export class WaterReportModule { }
