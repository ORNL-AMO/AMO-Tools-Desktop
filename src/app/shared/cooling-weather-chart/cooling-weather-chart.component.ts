import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { WeatherBinnedChartData } from '../models/chillers';

@Component({
    selector: 'app-cooling-weather-chart',
    templateUrl: './cooling-weather-chart.component.html',
    styleUrls: ['./cooling-weather-chart.component.css'],
    standalone: false
})
export class CoolingWeatherChartComponent implements OnInit {
  @Input()
  weatherBinnedChartData: WeatherBinnedChartData;
  @Input()
  chartTitle: string;

  @ViewChild('coolingTowerBasinChart', { static: false }) barChart: ElementRef;

  constructor() { }

  ngOnInit(): void {}

  ngAfterViewInit() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      this.createChart();
    }, 20);
  }
  
  ngOnDestroy(){
    window.dispatchEvent(new Event("resize"));
  }

  ngOnChanges() {
    if (this.barChart) {
      this.createChart();
    }
  }

  createChart() {
    let traces = this.getTraces();
    let layout = {
      width: this.barChart.nativeElement.clientWidth,
      barmode: 'group',
      showlegend: true,
      legend: { 
        "orientation": "h",
        x: 0,
        xanchor: 'left',
        y: 1.25
       },
      font: {
        size: 12,
      },
      yaxis: {
        hoverformat: '.3r',
        title: {
          text: this.weatherBinnedChartData.yAxisLabel,
          standoff: 15,
          font: {
            size: 14
          }
        },
        automargin: true
      },
      xaxis: {
        tickangle: -45,
        title: {
          text: `Dry Bulb Temperature Range (${this.weatherBinnedChartData.parameterUnit})`,
          standoff: 25,
          font: {
            size: 14
          }
        },
        automargin: true

      },
      margin: { t: 50, b: 100, l: 75, r: 25 }
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.newPlot(this.barChart.nativeElement, traces, layout, configOptions);
  }

  getTraces(): Array<CoolingChartTraceData>{
    let traces: Array<CoolingChartTraceData> = new Array();
    this.weatherBinnedChartData.barChartDataArray.forEach((bar, index) => {
      traces.push({
        x: bar.barChartLabels,
        y: bar.barChartValues,
        textposition: 'auto',
        hovertemplate: `%{y:.2r} ${this.weatherBinnedChartData.yValueUnit}`
        ,
        name: bar.name,
        type: 'bar',
      })
    });
    return traces;
  }

}

export interface CoolingChartData { 
  barChartLabels: Array<string>, 
  barChartValues: Array<number>, 
  chartHourValues: Array<number>, 
  name: string 
}

export interface CoolingChartTraceData { 
  x: Array<string>, 
  y: Array<number>, 
  name?: string, 
  type?: string, 
  text?: Array<string>, 
  textposition?: string, 
  hovertemplate?: string 
}