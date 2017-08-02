import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EnergyEquivalencyComponent } from './energy-equivalency.component';
import { EnergyEquivalencyFormComponent } from './energy-equivalency-form/energy-equivalency-form.component';
import { EnergyEquivalencyGraphComponent } from './energy-equivalency-graph/energy-equivalency-graph.component';
import { EnergyEquivalencyHelpComponent } from './energy-equivalency-help/energy-equivalency-help.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    EnergyEquivalencyComponent,
    EnergyEquivalencyFormComponent,
    EnergyEquivalencyGraphComponent,
    EnergyEquivalencyHelpComponent
  ],
  exports: [
    EnergyEquivalencyComponent
  ]
})
export class EnergyEquivalencyModule { }
