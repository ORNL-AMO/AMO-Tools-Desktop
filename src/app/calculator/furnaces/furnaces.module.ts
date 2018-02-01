import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { FurnacesComponent } from './furnaces.component';


import { EnergyEquivalencyModule } from './energy-equivalency/energy-equivalency.module';
import { EnergyUseModule } from './energy-use/energy-use.module';
import { O2EnrichmentModule } from './o2-enrichment/o2-enrichment.module';
import { EfficiencyImprovementModule } from './efficiency-improvement/efficiency-improvement.module';
import { PreAssessmentModule } from './pre-assessment/pre-assessment.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EnergyUseModule,
    O2EnrichmentModule,
    EnergyEquivalencyModule,
    EfficiencyImprovementModule,
    PreAssessmentModule
  ],
  declarations: [
    FurnacesComponent
  ],
  exports: [
    FurnacesComponent
  ]
})
export class FurnacesModule { }
