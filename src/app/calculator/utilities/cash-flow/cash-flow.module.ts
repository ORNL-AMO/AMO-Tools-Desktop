import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashFlowComponent } from './cash-flow.component';
import { CashFlowHelpComponent } from './cash-flow-help/cash-flow-help.component';
import { CashFlowFormComponent } from './cash-flow-form/cash-flow-form.component';
import { CashFlowDiagramComponent } from './cash-flow-diagram/cash-flow-diagram.component';
import { CashFlowService } from './cash-flow.service';
import { FormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';



@NgModule({
  declarations: [
    CashFlowComponent,
    CashFlowHelpComponent,
    CashFlowFormComponent,
    CashFlowDiagramComponent],
  imports: [
    CommonModule,
    FormsModule,
    ExportableResultsTableModule,
    SimpleTooltipModule
  ],
  exports: [
    CashFlowComponent
  ],
  providers: [
    CashFlowService
  ]
})
export class CashFlowModule { }
