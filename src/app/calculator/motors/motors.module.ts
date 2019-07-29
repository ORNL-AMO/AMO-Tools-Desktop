import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NemaEnergyEfficiencyModule } from './nema-energy-efficiency/nema-energy-efficiency.module';
import { MotorPerformanceModule } from './motor-performance/motor-performance.module';

import { MotorsComponent } from './motors.component';
import { PercentLoadEstimationModule } from "./percent-load-estimation/percent-load-estimation.module";
import { MotorDriveModule } from './motor-drive/motor-drive.module';
import { ReplaceExistingModule } from './replace-existing/replace-existing.module';

@NgModule({
  declarations: [
    MotorsComponent
  ],
  exports: [
    MotorsComponent
  ],
  imports: [
    CommonModule,
    NemaEnergyEfficiencyModule,
    MotorPerformanceModule,
    PercentLoadEstimationModule,
    MotorDriveModule,
    ReplaceExistingModule
  ]
})

export class MotorsModule { }
