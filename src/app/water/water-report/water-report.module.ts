import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { WaterReportComponent } from './water-report.component';
import { SystemSummaryReportComponent } from './system-summary-report/system-summary-report.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { SystemTrueCostReportComponent } from './system-true-cost-report/system-true-cost-report.component';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';
import { AlertInfoContainerComponent } from '../../shared/alert-info-container/alert-info-container.component';
import { StackedBarIntakeCostsComponent } from './stacked-bar-intake-costs/stacked-bar-intake-costs.component';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { StackedBarIntakeFlowComponent } from './stacked-bar-intake-flow/stacked-bar-intake-flow.component';
import { SystemTrueCostBarComponent } from './system-true-cost-bar/system-true-cost-bar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TrueCostEditableTableComponent } from './true-cost-editable-table/true-cost-editable-table.component';
import { TrueCostReportService } from '../services/true-cost-report.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    WaterReportComponent,
    ExecutiveSummaryComponent,
    SystemSummaryReportComponent,
    SystemTrueCostBarComponent,
    SystemTrueCostReportComponent,
    StackedBarIntakeCostsComponent,
    StackedBarIntakeFlowComponent,
    TrueCostEditableTableComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    ReactiveFormsModule,
    FormsModule,
    PrintOptionsMenuModule,
    AlertInfoContainerComponent,
    ExportableResultsTableModule,
    NgbModule,
  ],
  exports: [
    WaterReportComponent,
  ],
  providers: [
    TrueCostReportService,
  ],
})
export class WaterReportModule { }
