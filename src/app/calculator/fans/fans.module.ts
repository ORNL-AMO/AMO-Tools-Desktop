import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FansComponent } from './fans.component';
import { SystemCurveModule } from '../pumps/system-curve/system-curve.module';
import { PumpCurveModule } from '../pumps/pump-curve/pump-curve.module';
import { FanEfficiencyModule } from './fan-efficiency/fan-efficiency.module';
import { FanAnalysisModule } from './fan-analysis/fan-analysis.module';
import { SystemAndEquipmentCurveModule } from '../system-and-equipment-curve/system-and-equipment-curve.module';

@NgModule({
  imports: [
    CommonModule,
    SystemCurveModule,
    PumpCurveModule,
    FanEfficiencyModule,
    FanAnalysisModule,
    SystemAndEquipmentCurveModule
  ],
  declarations: [FansComponent],
  exports: [FansComponent]
})
export class FansModule { }
