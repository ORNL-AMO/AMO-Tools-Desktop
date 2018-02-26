import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fsat203Component } from './fsat-203.component';
import { FsatBasicsComponent } from './fsat-basics/fsat-basics.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { FanDataComponent } from './fan-data/fan-data.component';
import { GasDensityComponent } from './gas-density/gas-density.component';
import { FanDataFormComponent } from './fan-data/fan-data-form/fan-data-form.component';
import { Plane3FormComponent } from './fan-data/plane-3-form/plane-3-form.component';
import { PressureReadingsFormComponent } from './fan-data/pressure-readings-form/pressure-readings-form.component';
import { FanShaftPowerComponent } from './fan-shaft-power/fan-shaft-power.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [Fsat203Component, FsatBasicsComponent, FanDataComponent, GasDensityComponent, FanDataFormComponent, Plane3FormComponent, PressureReadingsFormComponent, FanShaftPowerComponent],
  exports: [Fsat203Component]
})
export class Fsat203Module { }
