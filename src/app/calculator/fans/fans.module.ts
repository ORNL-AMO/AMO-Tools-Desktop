import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Fsat203Module } from './fsat-203/fsat-203.module';
import { FansComponent } from './fans.component';
import { SystemCurveModule } from '../pumps/system-curve/system-curve.module';
import { PumpCurveModule } from '../pumps/pump-curve/pump-curve.module';
import { FanEfficiencyModule } from './fan-efficiency/fan-efficiency.module';
import { FanService } from './fan.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Fsat203Module,
    SystemCurveModule,
    PumpCurveModule,
    FanEfficiencyModule
  ],
  declarations: [FansComponent],
  exports: [FansComponent],
  providers: [FanService]
})
export class FansModule { }
