import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamReductionComponent } from './steam-reduction.component';
import { SteamReductionResultsComponent } from './steam-reduction-results/steam-reduction-results.component';
import { SteamReductionFormComponent } from './steam-reduction-form/steam-reduction-form.component';
import { SteamReductionHelpComponent } from './steam-reduction-help/steam-reduction-help.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { SteamReductionService } from './steam-reduction.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  declarations: [SteamReductionComponent, SteamReductionResultsComponent, SteamReductionFormComponent, SteamReductionHelpComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule,
    SharedPipesModule
  ],
  providers: [
    SteamReductionService
  ],
  exports: [
    SteamReductionComponent
  ]
})
export class SteamReductionModule { }
