import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValveEnergyLossComponent } from './valve-energy-loss.component';
import { ValveEnergyLossService } from './valve-energy-loss.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../../../settings/settings.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ValveEnergyLossFormComponent } from './valve-energy-loss-form/valve-energy-loss-form.component';
import { ValveEnergyLossHelpComponent } from './valve-energy-loss-help/valve-energy-loss-help.component';
import { ValveEnergyLossResultsComponent } from './valve-energy-loss-results/valve-energy-loss-results.component';
import { ValveEnergyLossFormService } from './valve-energy-loss-form/valve-energy-loss-form.service';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';



@NgModule({
  declarations: [
    ValveEnergyLossComponent,
    ValveEnergyLossFormComponent,
    ValveEnergyLossHelpComponent,
    ValveEnergyLossResultsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SettingsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  exports: [
    ValveEnergyLossComponent
  ],
  providers: [
    ValveEnergyLossService,
    ValveEnergyLossFormService
  ]
})
export class ValveEnergyLossModule { }
