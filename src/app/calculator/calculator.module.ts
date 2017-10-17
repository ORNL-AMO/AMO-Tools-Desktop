import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FurnacesModule } from './furnaces/furnaces.module';
import { CalculatorComponent } from './calculator.component';

import { FansComponent } from './fans/fans.component';

import { SteamComponent } from './steam/steam.component';
import { MotorsModule } from './motors/motors.module';

import { PumpsModule } from './pumps/pumps.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { CompressedAirComponent } from './compressed-air/compressed-air.component';
import { StandaloneService } from './standalone.service';

@NgModule({
  declarations: [
    CalculatorComponent,
    FansComponent,
    SteamComponent,
    CompressedAirComponent
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
    UtilitiesModule,
    FurnacesModule,
    MotorsModule
  ],
  providers: [
    StandaloneService
  ]
})

export class CalculatorModule { }
