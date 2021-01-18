import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterListComponent } from './waste-water-list/waste-water-list.component';
import { O2UtilizationRateComponent } from './o2-utilization-rate/o2-utilization-rate.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [WasteWaterListComponent, O2UtilizationRateComponent],
  exports: [WasteWaterListComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class WasteWaterModule { }
