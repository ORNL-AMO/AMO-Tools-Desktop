import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
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

@NgModule({
  declarations: [
    CalculatorComponent
  ],
  exports: [
    CalculatorComponent
  ],
  imports: [
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PumpsModule,
    SteamModule,
    UtilitiesModule,
    FurnacesModule,
    MotorsModule,
    CompressedAirModule,
    FansModule
  ],
  providers: [
    StandaloneService,
    CalculatorService
  ]
})

export class CalculatorModule { }
