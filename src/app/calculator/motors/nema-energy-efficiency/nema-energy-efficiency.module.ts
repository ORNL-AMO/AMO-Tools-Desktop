import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';


import { NemaEnergyEfficiencyGraphComponent } from './nema-energy-efficiency-graph/nema-energy-efficiency-graph.component';
import { NemaEnergyEfficiencyComponent } from './nema-energy-efficiency.component';
import { NemaEnergyEfficiencyFormComponent } from './nema-energy-efficiency-form/nema-energy-efficiency-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    NemaEnergyEfficiencyComponent,
    NemaEnergyEfficiencyFormComponent,
    NemaEnergyEfficiencyGraphComponent
  ],
  exports: [
    NemaEnergyEfficiencyComponent
  ]
})
export class NemaEnergyEfficiencyModule { }
