import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FansComponent } from './fans.component';
import { SystemCurveModule } from '../pumps/system-curve/system-curve.module';
import { PumpCurveModule } from '../pumps/pump-curve/pump-curve.module';
import { FanEfficiencyModule } from './fan-efficiency/fan-efficiency.module';
import { FanAnalysisModule } from './fan-analysis/fan-analysis.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SystemCurveModule,
    PumpCurveModule,
    FanEfficiencyModule,
    FanAnalysisModule
  ],
  declarations: [FansComponent],
  exports: [FansComponent],
  providers: []
})
export class FansModule { }
