import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculateOutletPressureComponent } from './calculate-outlet-pressure/calculate-outlet-pressure.component';
import { CalculateInletPressureComponent } from './calculate-inlet-pressure/calculate-inlet-pressure.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalculateInletPressureHelpComponent } from './calculate-inlet-pressure/calculate-inlet-pressure-help/calculate-inlet-pressure-help.component';
import { CalculateOutletPressureHelpComponent } from './calculate-outlet-pressure/calculate-outlet-pressure-help/calculate-outlet-pressure-help.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    CalculateInletPressureComponent,
    CalculateOutletPressureComponent,
    CalculateInletPressureHelpComponent,
    CalculateOutletPressureHelpComponent
  ],
  exports: [
    CalculateInletPressureComponent,
    CalculateOutletPressureComponent
  ]
})
export class CalculatePressuresModule { }
