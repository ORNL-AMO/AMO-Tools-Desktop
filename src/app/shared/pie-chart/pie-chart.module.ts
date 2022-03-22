import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleTooltipModule } from '../simple-tooltip/simple-tooltip.module';
import { PlotlyPieChartComponent } from '../plotly-pie-chart/plotly-pie-chart.component';
import { PlotlyBarChartComponent } from '../plotly-bar-chart/plotly-bar-chart.component';



@NgModule({
  declarations: [
    PlotlyPieChartComponent,
    PlotlyBarChartComponent
  ],
  imports: [
    CommonModule,
    SimpleTooltipModule
  ],
  exports: [
    PlotlyPieChartComponent,
    PlotlyBarChartComponent
  ]
})
export class PieChartModule { }
