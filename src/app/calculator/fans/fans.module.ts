import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FansComponent } from './fans.component';
import { FanEfficiencyModule } from './fan-efficiency/fan-efficiency.module';
import { FanAnalysisModule } from './fan-analysis/fan-analysis.module';
import { SystemAndEquipmentCurveModule } from '../system-and-equipment-curve/system-and-equipment-curve.module';

@NgModule({
  imports: [
    CommonModule,
    FanEfficiencyModule,
    FanAnalysisModule,
    SystemAndEquipmentCurveModule
  ],
  declarations: [FansComponent],
  exports: [FansComponent]
})
export class FansModule { }
