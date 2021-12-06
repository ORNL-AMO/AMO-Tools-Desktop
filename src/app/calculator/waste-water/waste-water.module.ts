import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterListComponent } from './waste-water-list/waste-water-list.component';
import { RouterModule } from '@angular/router';
import { O2UtilizationRateModule } from './o2-utilization-rate/o2-utilization-rate.module';
import { StatePointAnalysisModule } from './state-point-analysis/state-point-analysis.module';
import { WaterReductionModule } from './water-reduction/water-reduction.module';

@NgModule({
  declarations: [WasteWaterListComponent],
  exports: [WasteWaterListComponent],
  imports: [
    CommonModule,
    RouterModule,
    O2UtilizationRateModule,
    StatePointAnalysisModule,
    WaterReductionModule
  ]
})
export class WasteWaterModule { }
