import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FansComponent } from './fans.component';
import { FanEfficiencyModule } from './fan-efficiency/fan-efficiency.module';
import { FanAnalysisModule } from './fan-analysis/fan-analysis.module';
import { SystemAndEquipmentCurveModule } from '../system-and-equipment-curve/system-and-equipment-curve.module';
import { FansListComponent } from './fans-list/fans-list.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FanEfficiencyModule,
    FanAnalysisModule,
    SystemAndEquipmentCurveModule,
    RouterModule
  ],
  declarations: [FansComponent, FansListComponent],
  exports: [FansListComponent]
})
export class FansModule { }
