import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { WeatherBinsService, WeatherBinsInput } from '../weather-bins.service';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-weather-bins-bar-chart',
  templateUrl: './weather-bins-bar-chart.component.html',
  styleUrls: ['./weather-bins-bar-chart.component.css']
})
export class WeatherBinsBarChartComponent implements OnInit {
  @ViewChild('weatherBinsBarChart', { static: false }) weatherBinsBarChart: ElementRef;

  tableData: WeatherBinsInput;
  inputDataSub: Subscription;
  sumTotal: number;
  constructor(private weatherBinsService: WeatherBinsService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.inputDataSub = this.weatherBinsService.inputData.subscribe(inputData => {      
      this.tableData = inputData;
      this.createBarChart(inputData);
    });
  }

  ngOnDestroy() {
    this.inputDataSub.unsubscribe();
  }

  createBarChart(inputData: WeatherBinsInput) {
    this.setSumTotal(inputData);
    if (this.weatherBinsBarChart && this.sumTotal != 0) {
      let xData: Array<string> = inputData.cases.map(caseData => { return caseData.caseName });
      let yData: Array<number> = inputData.cases.map(caseData => { return caseData.totalNumberOfDataPoints });
      let traces = [{
        x: xData,
        y: yData,
        type: 'bar'
      }]
      let layout = {
        width: this.weatherBinsBarChart.nativeElement.clientWidth,
        // barmode: 'group',
        // showlegend: true,
        font: {
          size: 12,
        },
        yaxis: {
          hoverformat: '.3r',
          title: {
            text: 'Number of Hours',
            font: {
              family: 'Arial',
              size: 12
            }
          },
          // fixedrange: true
          automargin: true
        },
        xaxis: {
          // rangemode: 'tozero'
          automargin: true
        },
        margin: { t: 50, b: 50, l: 50, r: 50 }
      };

      var configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      Plotly.react(this.weatherBinsBarChart.nativeElement, traces, layout, configOptions);
    } else if (this.weatherBinsBarChart) {
      Plotly.purge(this.weatherBinsBarChart.nativeElement);
    }
  }

  setSumTotal(inputData: WeatherBinsInput) {
    this.sumTotal = 0;
    inputData.cases.forEach(caseItem => {
      this.sumTotal += caseItem.totalNumberOfDataPoints;
    });
    this.cd.detectChanges();
  }
}
