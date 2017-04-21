import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ModalModule } from 'ng2-bootstrap';
import { CalculatorComponent } from './calculator.component';

import { FansComponent } from './fans/fans.component';
import { FurnacesComponent } from './furnaces/furnaces.component';
import { SteamComponent } from './steam/steam.component';
import { MotorsComponent } from './motors/motors.component';

import { PumpsModule } from './pumps/pumps.module';
import { UtilitiesModule } from './utilities/utilities.module';
@NgModule({
  declarations: [
    CalculatorComponent,
    FansComponent,
    FurnacesComponent,
    SteamComponent,
    MotorsComponent,
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
    ModalModule,
    PumpsModule,
    UtilitiesModule
  ],
  providers: [
  ]
})

export class CalculatorModule { }
