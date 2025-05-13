import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { WaterReportComponent } from './water-report.component';
import { SystemSummaryReportComponent } from './system-summary-report/system-summary-report.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { SystemTrueCostReportComponent } from './system-true-cost-report/system-true-cost-report.component';

@NgModule({
  declarations: [
    WaterReportComponent,
    ExecutiveSummaryComponent,
    SystemSummaryReportComponent,
    SystemTrueCostReportComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
  ],
  exports: [
    WaterReportComponent
  ],
})
export class WaterReportModule { }
