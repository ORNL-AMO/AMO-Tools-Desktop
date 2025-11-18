import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { WaterReportComponent } from './water-report.component';
import { SystemSummaryReportComponent } from './system-summary-report/system-summary-report.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { SystemTrueCostReportComponent } from './system-true-cost-report/system-true-cost-report.component';
import { SystemTrueCostBarComponent } from './system-true-cost-bar/system-true-cost-bar.component';
import { WaterReportService } from './water-report.service';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';
import { AlertInfoContainerComponent } from '../../shared/alert-info-container/alert-info-container.component';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { TrueCostEditableTableComponent } from './true-cost-editable-table/true-cost-editable-table.component';
import { TrueCostReportService } from '../services/true-cost-report.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    WaterReportComponent,
    ExecutiveSummaryComponent,
    SystemSummaryReportComponent,
    SystemTrueCostReportComponent,
    SystemTrueCostBarComponent,
    TrueCostEditableTableComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    ReactiveFormsModule,
    FormsModule,
    PrintOptionsMenuModule,
    AlertInfoContainerComponent,
    ExportableResultsTableModule
  ],
  exports: [
    WaterReportComponent,
  ],
  providers: [
    WaterReportService,
    TrueCostReportService,
  ],
})
export class WaterReportModule { }
