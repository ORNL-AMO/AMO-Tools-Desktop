import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NemaEnergyEfficiencyModule } from './nema-energy-efficiency/nema-energy-efficiency.module';
import { MotorPerformanceModule } from './motor-performance/motor-performance.module';

import { MotorsComponent } from './motors.component';
import { PercentLoadEstimationModule } from "./percent-load-estimation/percent-load-estimation.module";
import { MotorDriveModule } from './motor-drive/motor-drive.module';
import { ReplaceExistingModule } from './replace-existing/replace-existing.module';
import { RouterModule } from '@angular/router';
import { MotorsListComponent } from './motors-list/motors-list.component';

@NgModule({
  declarations: [
    MotorsComponent,
    MotorsListComponent
  ],
  exports: [
    MotorsListComponent
  ],
  imports: [
    CommonModule,
    NemaEnergyEfficiencyModule,
    MotorPerformanceModule,
    PercentLoadEstimationModule,
    MotorDriveModule,
    ReplaceExistingModule,
    RouterModule
  ]
})

export class MotorsModule { }
