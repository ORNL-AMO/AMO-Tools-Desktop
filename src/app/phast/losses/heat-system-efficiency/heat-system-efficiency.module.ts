import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HeatSystemEfficiencyComponent } from './heat-system-efficiency.component';
import { HeatSystemEfficiencyCompareService } from './heat-system-efficiency-compare.service';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  declarations: [HeatSystemEfficiencyComponent],
  providers: [HeatSystemEfficiencyCompareService],
  exports: [HeatSystemEfficiencyComponent]
})
export class HeatSystemEfficiencyModule { }

