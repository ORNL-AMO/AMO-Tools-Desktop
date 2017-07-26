import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { FurnacesComponent } from './furnaces.component';

import { EfficiencyImprovementComponent } from './efficiency-improvement/efficiency-improvement.component';
import { EfficiencyImprovementFormComponent } from './efficiency-improvement/efficiency-improvement-form/efficiency-improvement-form.component';
import { EfficiencyImprovementGraphComponent } from './efficiency-improvement/efficiency-improvement-graph/efficiency-improvement-graph.component';
import { EnergyEquivalencyComponent } from './energy-equivalency/energy-equivalency.component';
import { EnergyEquivalencyFormComponent } from './energy-equivalency/energy-equivalency-form/energy-equivalency-form.component';
import { EnergyEquivalencyGraphComponent } from './energy-equivalency/energy-equivalency-graph/energy-equivalency-graph.component';
import { EnergyEquivalencyHelpComponent } from './energy-equivalency/energy-equivalency-help/energy-equivalency-help.component';
import { EfficiencyImprovementHelpComponent } from './efficiency-improvement/efficiency-improvement-help/efficiency-improvement-help.component';
import { EnergyUseModule } from './energy-use/energy-use.module';
import { O2EnrichmentModule } from './o2-enrichment/o2-enrichment.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EnergyUseModule,
    O2EnrichmentModule
  ],
  declarations: [
    FurnacesComponent,
    EfficiencyImprovementComponent,
    EfficiencyImprovementFormComponent,
    EfficiencyImprovementGraphComponent,
    EnergyEquivalencyComponent,
    EnergyEquivalencyFormComponent,
    EnergyEquivalencyGraphComponent,
    EnergyEquivalencyHelpComponent,
    EfficiencyImprovementHelpComponent,
  ],
  exports: [
    FurnacesComponent,
    EnergyEquivalencyComponent,
    EfficiencyImprovementComponent
  ]
})
export class FurnacesModule { }
