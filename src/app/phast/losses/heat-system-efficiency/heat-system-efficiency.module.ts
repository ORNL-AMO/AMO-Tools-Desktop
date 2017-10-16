import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeatSystemEfficiencyComponent } from './heat-system-efficiency.component';
import { HeatSystemEfficiencyCompareService } from './heat-system-efficiency-compare.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [HeatSystemEfficiencyComponent],
  providers:[HeatSystemEfficiencyCompareService],
  exports: [HeatSystemEfficiencyComponent]
})
export class HeatSystemEfficiencyModule { }
