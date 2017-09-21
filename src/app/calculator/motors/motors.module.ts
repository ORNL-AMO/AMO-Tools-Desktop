import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ModalModule } from 'ngx-bootstrap';
import { ChartsModule } from 'ng2-charts';


import {NemaEnergyEfficiencyModule} from './nema-energy-efficiency/nema-energy-efficiency.module';
import {MotorPerformanceModule} from './motor-performance/motor-performance.module';

import { MotorsComponent } from './motors.component';
@NgModule({
  declarations: [
    MotorsComponent
  ],
  exports: [
    MotorsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ModalModule,
    ChartsModule,
    NemaEnergyEfficiencyModule,
    MotorPerformanceModule,
    ],
  providers: [

  ]
})

export class MotorsModule { }
