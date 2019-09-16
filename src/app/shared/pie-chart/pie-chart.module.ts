import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './pie-chart.component';
import { SimpleTooltipModule } from '../simple-tooltip/simple-tooltip.module';



@NgModule({
  declarations: [
    PieChartComponent
  ],
  imports: [
    CommonModule,
    SimpleTooltipModule
  ],
  exports: [
    PieChartComponent
  ]
})
export class PieChartModule { }
