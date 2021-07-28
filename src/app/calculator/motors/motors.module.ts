import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NemaEnergyEfficiencyModule } from './nema-energy-efficiency/nema-energy-efficiency.module';
import { MotorPerformanceModule } from './motor-performance/motor-performance.module';
import { PercentLoadEstimationModule } from "./percent-load-estimation/percent-load-estimation.module";
import { MotorDriveModule } from './motor-drive/motor-drive.module';
import { ReplaceExistingModule } from './replace-existing/replace-existing.module';
import { RouterModule } from '@angular/router';
import { MotorsListComponent } from './motors-list/motors-list.component';
import { FullLoadAmpsModule } from './full-load-amps/full-load-amps.module';

@NgModule({
  declarations: [
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
    FullLoadAmpsModule,
    RouterModule
  ]
})

export class MotorsModule { }
