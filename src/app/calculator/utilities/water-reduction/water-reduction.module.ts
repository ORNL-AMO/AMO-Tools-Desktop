import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterReductionComponent } from './water-reduction.component';
import { WaterReductionService } from './water-reduction.service';
import { ReactiveFormsModule } from '@angular/forms';
import { WaterReductionFormComponent } from './water-reduction-form/water-reduction-form.component';
import { WaterReductionResultsComponent } from './water-reduction-results/water-reduction-results.component';
import { WaterReductionHelpComponent } from './water-reduction-help/water-reduction-help.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';

@NgModule({
  declarations: [
    WaterReductionComponent,
    WaterReductionFormComponent,
    WaterReductionResultsComponent,
    WaterReductionHelpComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  providers: [
    WaterReductionService
  ],
  exports: [
    WaterReductionComponent
  ]
})
export class WaterReductionModule { }
