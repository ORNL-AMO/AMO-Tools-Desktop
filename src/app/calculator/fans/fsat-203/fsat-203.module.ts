import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fsat203Component } from './fsat-203.component';
import { FsatBasicsComponent } from './fsat-basics/fsat-basics.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { FanDataComponent } from './fan-data/fan-data.component';
import { GasDensityComponent } from './gas-density/gas-density.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [Fsat203Component, FsatBasicsComponent, FanDataComponent, GasDensityComponent],
  exports: [Fsat203Component]
})
export class Fsat203Module { }
