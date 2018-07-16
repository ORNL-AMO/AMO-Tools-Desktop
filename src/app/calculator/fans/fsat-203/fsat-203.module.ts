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
import { Fsat203Service } from './fsat-203.service';
import { Fsat203ResultsComponent } from './fsat-203-results/fsat-203-results.component';
import { PlaneInfoComponent } from './fan-data/plane-info/plane-info.component';
import { PlanarResultsComponent } from './planar-results/planar-results.component';
import { OperatingPointsHelpComponent } from './operating-points-help/operating-points-help.component';
import { FanDataHelpComponent } from './operating-points-help/fan-data-help/fan-data-help.component';
import { FanShaftPowerHelpComponent } from './operating-points-help/fan-shaft-power-help/fan-shaft-power-help.component';
import { FsatBasicsHelpComponent } from './operating-points-help/fsat-basics-help/fsat-basics-help.component';
import { GasDensityHelpComponent } from './operating-points-help/gas-density-help/gas-density-help.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [Fsat203Component, FsatBasicsComponent, FanDataComponent, GasDensityComponent, FanDataFormComponent, Plane3FormComponent, PressureReadingsFormComponent, FanShaftPowerComponent, Fsat203ResultsComponent, PlaneInfoComponent, PlanarResultsComponent, OperatingPointsHelpComponent, FanDataHelpComponent, FanShaftPowerHelpComponent, FsatBasicsHelpComponent, GasDensityHelpComponent],
  exports: [Fsat203Component, FanDataComponent, PlanarResultsComponent],
  providers: [Fsat203Service]
})
export class Fsat203Module { }
