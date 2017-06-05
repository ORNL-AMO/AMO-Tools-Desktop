import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CalculatorComponent } from './calculator.component';

import { FansComponent } from './fans/fans.component';
import { FurnacesComponent } from './furnaces/furnaces.component';
import { SteamComponent } from './steam/steam.component';
import { MotorsComponent } from './motors/motors.component';

import { PumpsModule } from './pumps/pumps.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { CompressedAirComponent } from './compressed-air/compressed-air.component';

@NgModule({
  declarations: [
    CalculatorComponent,
    FansComponent,
    FurnacesComponent,
    SteamComponent,
    MotorsComponent,
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
    UtilitiesModule
  ],
  providers: [
  ]
})

export class CalculatorModule { }
