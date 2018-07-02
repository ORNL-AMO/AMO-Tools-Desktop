import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeatSystemEfficiencyComponent } from './heat-system-efficiency.component';
import { HeatSystemEfficiencyCompareService } from './heat-system-efficiency-compare.service';
import {SharedModule} from "../../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [HeatSystemEfficiencyComponent],
  providers:[HeatSystemEfficiencyCompareService],
  exports: [HeatSystemEfficiencyComponent]
})
export class HeatSystemEfficiencyModule { }

