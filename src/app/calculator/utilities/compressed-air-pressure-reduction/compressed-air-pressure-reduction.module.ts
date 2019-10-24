import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirPressureReductionComponent } from './compressed-air-pressure-reduction.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CompressedAirPressureReductionService } from './compressed-air-pressure-reduction.service';
import { CompressedAirPressureReductionFormComponent } from './compressed-air-pressure-reduction-form/compressed-air-pressure-reduction-form.component';
import { CompressedAirPressureReductionResultsComponent } from './compressed-air-pressure-reduction-results/compressed-air-pressure-reduction-results.component';
import { CompressedAirPressureReductionHelpComponent } from './compressed-air-pressure-reduction-help/compressed-air-pressure-reduction-help.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';

@NgModule({
  declarations: [
    CompressedAirPressureReductionComponent,
    CompressedAirPressureReductionFormComponent,
    CompressedAirPressureReductionResultsComponent,
    CompressedAirPressureReductionHelpComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  providers: [
    CompressedAirPressureReductionService
  ],
  exports: [
    CompressedAirPressureReductionComponent
  ]
})
export class CompressedAirPressureReductionModule { }
