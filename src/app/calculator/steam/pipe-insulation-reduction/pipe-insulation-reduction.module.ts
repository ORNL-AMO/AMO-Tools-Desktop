import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipeInsulationReductionComponent } from './pipe-insulation-reduction.component';
import { PipeInsulationReductionFormComponent } from './pipe-insulation-reduction-form/pipe-insulation-reduction-form.component';
import { PipeInsulationReductionResultsComponent } from './pipe-insulation-reduction-results/pipe-insulation-reduction-results.component';
import { PipeInsulationReductionHelpComponent } from './pipe-insulation-reduction-help/pipe-insulation-reduction-help.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { PipeInsulationReductionService } from './pipe-insulation-reduction.service';



@NgModule({
  declarations: [PipeInsulationReductionComponent, PipeInsulationReductionFormComponent, PipeInsulationReductionResultsComponent, PipeInsulationReductionHelpComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  providers: [
    PipeInsulationReductionService
  ],
  exports: [
    PipeInsulationReductionComponent
  ]
})
export class PipeInsulationReductionModule { }
