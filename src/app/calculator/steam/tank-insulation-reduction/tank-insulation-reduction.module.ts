import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TankInsulationReductionComponent } from './tank-insulation-reduction.component';
import { TankInsulationReductionFormComponent } from './tank-insulation-reduction-form/tank-insulation-reduction-form.component';
import { TankInsulationReductionHelpComponent } from './tank-insulation-reduction-help/tank-insulation-reduction-help.component';
import { TankInsulationReductionResultsComponent } from './tank-insulation-reduction-results/tank-insulation-reduction-results.component';
import { TankInsulationReductionService } from './tank-insulation-reduction.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';



@NgModule({
  declarations: [
    TankInsulationReductionComponent,
    TankInsulationReductionFormComponent,
    TankInsulationReductionHelpComponent,
    TankInsulationReductionResultsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  providers: [
    TankInsulationReductionService
  ],
  exports: [
    TankInsulationReductionComponent
  ]
})
export class TankInsulationReductionModule { }
