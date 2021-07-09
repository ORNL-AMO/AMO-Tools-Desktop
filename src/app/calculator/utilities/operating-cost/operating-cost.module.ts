import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Doesn't exist
// import { UnitConverterService } from './operating-cost.service';
import { SortByPipe } from './sort-by.pipe';
import { OperatingCostComponent } from './operating-cost.component';
import { FormsModule } from '@angular/forms';
import { OperatingCostService } from '../../compressed-air/operating-cost/operating-cost.service';

@NgModule({
  declarations: [
    OperatingCostComponent,
    SortByPipe
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    OperatingCostComponent
  ],
  providers: [
    // This needed to be imported above (use CTRL + .)
    OperatingCostService
  ]
})
export class OperatingCostModule { }
