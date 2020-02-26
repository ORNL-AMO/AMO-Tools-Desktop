import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './pie-chart.component';
import { SimpleTooltipModule } from '../simple-tooltip/simple-tooltip.module';
import { PlotlyPieChartComponent } from '../plotly-pie-chart/plotly-pie-chart.component';



@NgModule({
  declarations: [
    PieChartComponent,
    PlotlyPieChartComponent
  ],
  imports: [
    CommonModule,
    SimpleTooltipModule
  ],
  exports: [
    PieChartComponent,
    PlotlyPieChartComponent
  ]
})
export class PieChartModule { }
