import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanBasicsComponent } from './calculate-flow-pressures/flow-pressures-form/fan-basics/fan-basics.component';
import { FlowPressuresFormComponent } from './calculate-flow-pressures/flow-pressures-form/flow-pressures-form.component';
import { CalculateFlowPressuresComponent } from './calculate-flow-pressures/calculate-flow-pressures.component';
import { CalculateOutletPressureComponent } from './calculate-outlet-pressure/calculate-outlet-pressure.component';
import { CalculateInletPressureComponent } from './calculate-inlet-pressure/calculate-inlet-pressure.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalculateInletPressureHelpComponent } from './calculate-inlet-pressure/calculate-inlet-pressure-help/calculate-inlet-pressure-help.component';
import { CalculateOutletPressureHelpComponent } from './calculate-outlet-pressure/calculate-outlet-pressure-help/calculate-outlet-pressure-help.component';
import { SharedModule } from '../../shared/shared.module';
import { Fsat203Module } from '../../calculator/fans/fsat-203/fsat-203.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    Fsat203Module
  ],
  declarations: [
    CalculateInletPressureComponent,
    CalculateOutletPressureComponent,
    CalculateFlowPressuresComponent,
    FlowPressuresFormComponent,
    FanBasicsComponent,
    CalculateInletPressureHelpComponent,
    CalculateOutletPressureHelpComponent
  ],
  exports: [
    CalculateInletPressureComponent,
    CalculateOutletPressureComponent,
    CalculateFlowPressuresComponent
  ]
})
export class CalculatePressuresModule { }
