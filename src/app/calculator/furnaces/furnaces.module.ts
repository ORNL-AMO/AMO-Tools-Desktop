import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { FurnacesComponent } from './furnaces.component';
import { O2EnrichmentFormComponent } from './o2-enrichment/o2-enrichment-form/o2-enrichment-form.component';

import { O2EnrichmentComponent } from './o2-enrichment/o2-enrichment.component';
import { O2EnrichmentGraphComponent } from './o2-enrichment/o2-enrichment-graph/o2-enrichment-graph.component';
import { EfficiencyImprovementComponent } from './efficiency-improvement/efficiency-improvement.component';
import { EfficiencyImprovementFormComponent } from './efficiency-improvement/efficiency-improvement-form/efficiency-improvement-form.component';
import { EfficiencyImprovementGraphComponent } from './efficiency-improvement/efficiency-improvement-graph/efficiency-improvement-graph.component';
import { EnergyEquivalencyComponent } from './energy-equivalency/energy-equivalency.component';
import { EnergyEquivalencyFormComponent } from './energy-equivalency/energy-equivalency-form/energy-equivalency-form.component';
import { EnergyEquivalencyGraphComponent } from './energy-equivalency/energy-equivalency-graph/energy-equivalency-graph.component';
import { EnergyEquivalencyHelpComponent } from './energy-equivalency/energy-equivalency-help/energy-equivalency-help.component';
import { EfficiencyImprovementHelpComponent } from './efficiency-improvement/efficiency-improvement-help/efficiency-improvement-help.component';
import { EnergyUseModule } from './energy-use/energy-use.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EnergyUseModule
  ],
  declarations: [
    FurnacesComponent,
    O2EnrichmentFormComponent,
    O2EnrichmentComponent,
    O2EnrichmentGraphComponent,
    EfficiencyImprovementComponent,
    EfficiencyImprovementFormComponent,
    EfficiencyImprovementGraphComponent,
    EnergyEquivalencyComponent,
    EnergyEquivalencyFormComponent,
    EnergyEquivalencyGraphComponent,
    EnergyEquivalencyHelpComponent,
    EfficiencyImprovementHelpComponent
  ],
  exports: [
    FurnacesComponent,
    O2EnrichmentComponent,
    EnergyEquivalencyComponent,
    EfficiencyImprovementComponent
  ]
})
export class FurnacesModule { }
