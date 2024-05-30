import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Input, HostListener, SimpleChanges } from '@angular/core';
import { WeatherBinsService, WeatherBinsInput, WeatherBinCase } from '../weather-bins.service';
import * as Plotly from 'plotly.js-dist';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-weather-bins-bar-chart',
  templateUrl: './weather-bins-bar-chart.component.html',
  styleUrls: ['./weather-bins-bar-chart.component.css']
})
export class WeatherBinsBarChartComponent implements OnInit {
  @ViewChild('weatherBinsBarChart', { static: false }) weatherBinsBarChart: ElementRef;
  @Input() settings: Settings;

  weatherBinsInput: WeatherBinsInput;
  totalNumberOfDataPoints: number;
  weatherBinsInputSub: Subscription;

  constructor(private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.triggerInitialResize();
    this.weatherBinsInputSub = this.weatherBinsService.inputData.subscribe(val => {
      this.weatherBinsInput = val;
      this.createBarChart();
    });
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      // Resize
      this.createBarChart();
    }, 20);
  }


  ngOnDestroy() {
    window.dispatchEvent(new Event("resize"));
    this.weatherBinsInputSub.unsubscribe();
  }

  createBarChart() {
    if (this.weatherBinsBarChart) {
      let xData: Array<string> = this.weatherBinsInput.cases.map((caseData: WeatherBinCase) => { return this.weatherBinsService.getfilledLabelRangeString(this.settings, caseData.field, caseData.lowerBound, caseData.upperBound, true) });
      let yData: Array<number> = this.weatherBinsInput.cases.map(caseData => { return caseData.totalNumberOfDataPoints });

      let xParamTitle = this.weatherBinsService.getParameterLabelFromCSVName(this.weatherBinsInput.binParameters[0].name, this.settings);

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
          hoverformat: '.4r',
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
          title: {
            text: xParamTitle,
            font: {
              family: 'Arial',
              size: 16
            }
          },
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
      Plotly.newPlot(this.weatherBinsBarChart.nativeElement, traces, layout, configOptions);
    } else if (this.weatherBinsBarChart) {
      Plotly.purge(this.weatherBinsBarChart.nativeElement);
    }
  }

}
