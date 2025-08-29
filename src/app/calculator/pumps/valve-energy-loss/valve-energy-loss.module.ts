import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValveEnergyLossComponent } from './valve-energy-loss.component';
import { ValveEnergyLossService } from './valve-energy-loss.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../../../settings/settings.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';



@NgModule({
  declarations: [
    ValveEnergyLossComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SettingsModule,
    ExportableResultsTableModule
  ],
  exports: [
    ValveEnergyLossComponent
  ],
  providers: [ValveEnergyLossService]
})
export class ValveEnergyLossModule { }
