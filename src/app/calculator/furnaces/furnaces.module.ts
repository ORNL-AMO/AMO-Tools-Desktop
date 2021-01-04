import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnergyEquivalencyModule } from './energy-equivalency/energy-equivalency.module';
import { EnergyUseModule } from './energy-use/energy-use.module';
import { O2EnrichmentModule } from './o2-enrichment/o2-enrichment.module';
import { EfficiencyImprovementModule } from './efficiency-improvement/efficiency-improvement.module';
import { FurnacesListComponent } from './furnaces-list/furnaces-list.component';
import { RouterModule } from '@angular/router';
import { WallModule } from './wall/wall.module';
import { FlueGasModule } from './flue-gas/flue-gas.module';
import { AtmosphereModule } from './atmosphere/atmosphere.module';
import { ChargeMaterialModule } from './charge-material/charge-material.module';
import { OpeningModule } from './opening/opening.module';

@NgModule({
  imports: [
    CommonModule,
    EnergyUseModule,
    O2EnrichmentModule,
    EnergyEquivalencyModule,
    EfficiencyImprovementModule,
    WallModule,
    FlueGasModule,
    RouterModule,
    AtmosphereModule,
    ChargeMaterialModule,
    RouterModule, 
    OpeningModule
  ],
  declarations: [
    FurnacesListComponent,
  ],
  exports: [
    FurnacesListComponent
  ]
})
export class FurnacesModule { }
