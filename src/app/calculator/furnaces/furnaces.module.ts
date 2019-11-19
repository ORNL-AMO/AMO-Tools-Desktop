import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FurnacesComponent } from './furnaces.component';
import { EnergyEquivalencyModule } from './energy-equivalency/energy-equivalency.module';
import { EnergyUseModule } from './energy-use/energy-use.module';
import { O2EnrichmentModule } from './o2-enrichment/o2-enrichment.module';
import { EfficiencyImprovementModule } from './efficiency-improvement/efficiency-improvement.module';
import { FurnacesListComponent } from './furnaces-list/furnaces-list.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    EnergyUseModule,
    O2EnrichmentModule,
    EnergyEquivalencyModule,
    EfficiencyImprovementModule,
    RouterModule
  ],
  declarations: [
    FurnacesComponent,
    FurnacesListComponent
  ],
  exports: [
    FurnacesListComponent
  ]
})
export class FurnacesModule { }
