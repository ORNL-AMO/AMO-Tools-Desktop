import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NemaEnergyEfficiencyGraphComponent } from './nema-energy-efficiency-graph/nema-energy-efficiency-graph.component';
import { NemaEnergyEfficiencyComponent } from './nema-energy-efficiency.component';
import { NemaEnergyEfficiencyFormComponent } from './nema-energy-efficiency-form/nema-energy-efficiency-form.component';
import { NemaEnergyEfficiencyHelpComponent } from './nema-energy-efficiency-help/nema-energy-efficiency-help.component';
import { NemaEnergyEfficiencyService } from './nema-energy-efficiency.service';
import { PercentGraphModule } from '../../../shared/percent-graph/percent-graph.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PercentGraphModule
  ],
  declarations: [
    NemaEnergyEfficiencyComponent,
    NemaEnergyEfficiencyFormComponent,
    NemaEnergyEfficiencyGraphComponent,
    NemaEnergyEfficiencyHelpComponent
  ],
  exports: [
    NemaEnergyEfficiencyComponent
  ],
  providers: [
    NemaEnergyEfficiencyService
  ]
})
export class NemaEnergyEfficiencyModule { }
