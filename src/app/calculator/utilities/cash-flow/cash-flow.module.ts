import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashFlowComponent } from './cash-flow.component';
import { CashFlowHelpComponent } from './cash-flow-help/cash-flow-help.component';
import { CashFlowFormComponent } from './cash-flow-form/cash-flow-form.component';
import { CashFlowDiagramComponent } from './cash-flow-diagram/cash-flow-diagram.component';
import { CashFlowService } from './cash-flow.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';



@NgModule({
  declarations: [
    CashFlowComponent,
    CashFlowHelpComponent,
    CashFlowFormComponent,
    CashFlowDiagramComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ExportableResultsTableModule
  ],
  exports: [
    CashFlowComponent
  ],
  providers: [
    CashFlowService
  ]
})
export class CashFlowModule { }
