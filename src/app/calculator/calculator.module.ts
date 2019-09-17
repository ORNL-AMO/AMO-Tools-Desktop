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

@NgModule({
  declarations: [
    CalculatorComponent
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
    FansModule,
    LightingModule
  ],
  providers: [
    StandaloneService,
    CalculatorService
  ]
})

export class CalculatorModule { }
