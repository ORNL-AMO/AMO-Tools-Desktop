import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatSystemEfficiencyComponent } from './heat-system-efficiency.component';
import { HeatSystemEfficiencyCompareService } from './heat-system-efficiency-compare.service';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [HeatSystemEfficiencyComponent],
  providers:[HeatSystemEfficiencyCompareService],
  exports: [HeatSystemEfficiencyComponent]
})
export class HeatSystemEfficiencyModule { }
