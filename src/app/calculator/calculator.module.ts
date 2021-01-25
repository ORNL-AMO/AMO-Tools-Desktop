import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FurnacesModule } from './furnaces/furnaces.module';
import { CalculatorComponent } from './calculator.component';

import { MotorsModule } from './motors/motors.module';
import { SteamModule } from './steam/steam.module';
import { PumpsModule } from './pumps/pumps.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { StandaloneService } from './standalone.service';
import { CompressedAirModule } from './compressed-air/compressed-air.module';
import { FansModule } from './fans/fans.module';
import { CalculatorService } from './calculator.service';
import { LightingModule } from './lighting/lighting.module';
import { RouterModule } from '@angular/router';
import { CalculatorsListComponent } from './calculators-list/calculators-list.component';
import { ProcessCoolingModule } from './process-cooling/process-cooling.module';
import { WasteWaterModule } from './waste-water/waste-water.module';

@NgModule({
  declarations: [
    CalculatorComponent,
    CalculatorsListComponent
  ],
  exports: [
    CalculatorComponent
  ],
  imports: [
    CommonModule,
    PumpsModule,
    SteamModule,
    UtilitiesModule,
    FurnacesModule,
    MotorsModule,
    CompressedAirModule,
    ProcessCoolingModule,
    FansModule,
    LightingModule,
    RouterModule,
    WasteWaterModule
  ],
  providers: [
    StandaloneService,
    CalculatorService
  ]
})

export class CalculatorModule { }
