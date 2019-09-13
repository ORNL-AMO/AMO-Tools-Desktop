import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ElectricityReductionComponent } from './electricity-reduction.component';
import { ElectricityReductionService } from './electricity-reduction.service';
import { ElectricityReductionFormComponent } from './electricity-reduction-form/electricity-reduction-form.component';
import { ElectricityReductionHelpComponent } from './electricity-reduction-help/electricity-reduction-help.component';
import { ElectricityReductionResultsComponent } from './electricity-reduction-results/electricity-reduction-results.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ExportableResultsTableModule
  ],
  declarations: [
    ElectricityReductionComponent,
    ElectricityReductionFormComponent,
    ElectricityReductionHelpComponent,
    ElectricityReductionResultsComponent
  ],
  providers: [
    ElectricityReductionService
  ],
  exports: [
    ElectricityReductionComponent
  ]
})
export class ElectricityReductionModule { }
