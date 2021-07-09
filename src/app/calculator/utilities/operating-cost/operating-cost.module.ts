import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitConverterService } from './operating-cost.service';
import { SortByPipe } from './sort-by.pipe';
import { OperatingCostComponent } from './operating-cost.component';
import { FormsModule } from '@angular/forms';

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
    OperatingCostService
  ]
})
export class OperatingCostModule { }
