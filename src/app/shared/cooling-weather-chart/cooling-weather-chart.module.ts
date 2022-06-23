import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoolingWeatherChartComponent } from './cooling-weather-chart.component';



@NgModule({
  declarations: [CoolingWeatherChartComponent],
  imports: [
    CommonModule
  ],
  exports: [
    CoolingWeatherChartComponent
  ]
})
export class CoolingWeatherChartModule { }
