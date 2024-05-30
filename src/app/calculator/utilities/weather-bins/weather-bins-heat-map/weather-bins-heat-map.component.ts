import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { WeatherBinsInput, WeatherBinsService } from '../weather-bins.service';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js-dist';
import { Settings } from '../../../../shared/models/settings';
import * as Papa from 'papaparse';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { copyObject } from '../../../../shared/helperFunctions';


@Component({
  selector: 'app-weather-bins-heat-map',
  templateUrl: './weather-bins-heat-map.component.html',
  styleUrl: './weather-bins-heat-map.component.css'
})
export class WeatherBinsHeatMapComponent {
  @ViewChild('weatherBinsHeatMap', { static: false }) weatherBinsHeatMap: ElementRef;
  @Input()
  settings: Settings;
  weatherBinsInput: WeatherBinsInput;
  weatherBinsInputSub: Subscription;
  heatMap: PlotlyHeatmapData;
  heatmapCSVstring: string;
  activateCheckmark: boolean = false;
  showNotification: boolean = false;

  constructor(private weatherBinsService: WeatherBinsService, private windowRefService: WindowRefService) { }

  ngOnInit(): void {
    this.triggerInitialResize();
    this.weatherBinsInputSub = this.weatherBinsService.inputData.subscribe(val => {
      this.weatherBinsInput = val;
      this.createHeatMap();
    });
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      this.createHeatMap();
    }, 20);
  }

  ngOnDestroy() {
    window.dispatchEvent(new Event("resize"));
    this.weatherBinsInputSub.unsubscribe();
  }

  createHeatMap() {
    if (this.weatherBinsHeatMap && this.weatherBinsInput.binParameters.length > 1) {
      let yParamTitle = this.weatherBinsService.getParameterLabelFromCSVName(this.weatherBinsInput.binParameters[0].name, this.settings);
      let xParamTitle = this.weatherBinsService.getParameterLabelFromCSVName(this.weatherBinsInput.binParameters[1].name, this.settings);
      let yLabels = this.weatherBinsInput.cases.map(yParam => this.weatherBinsService.getfilledLabelRangeString(this.settings, yParam.field, yParam.lowerBound, yParam.upperBound, true));
      let xlabels = this.weatherBinsInput.cases[0].caseParameters.map(xParam => this.weatherBinsService.getfilledLabelRangeString(this.settings, xParam.field, xParam.lowerBound, xParam.upperBound, true));

      let heatMapData = this.weatherBinsInput.heatMapHoursMatrix;
      this.heatMap = {
        data: this.weatherBinsInput.heatMapHoursMatrix,
        yLabels: yLabels,
        xlabels: xlabels
      }

      let layout = {
        title: 'Dual-bin Case Occurence (hours)',
        annotations: [],
        xaxis: {
          ticks: '',
          title: {
            text: xParamTitle,
            font: {
              family: 'Arial',
              size: 16
            }
          },
          side: 'bottom',
          automargin: true
        },
        margin: { t: 50, b: 100, l: 100, r: 50, },
        yaxis: {
          ticks: '',
          ticksuffix: ' ',
          title: {
            text: yParamTitle,
            font: {
              family: 'Arial',
              size: 16
            }
          },
          autosize: false,
          automargin: true
        }
      };

      for (let i = 0; i < yLabels.length; i++) {
        for (let j = 0; j < xlabels.length; j++) {
          let currentValue = heatMapData[i][j];
          let result = {
            xref: 'x1',
            yref: 'y1',
            x: xlabels[j],
            y: yLabels[i],
            text: String(currentValue),
            font: {
              family: 'Arial',
              size: 14,
              color: this.getFontColor(currentValue)
            },
            showarrow: false,
          };
          layout.annotations.push(result);
        }
      }

      let data = [{
        y: yLabels,
        x: xlabels,
        z: heatMapData,
        type: 'heatmap',
        hovertemplate: `%{z} hours<br> ${yParamTitle} %{y}<br> ${xParamTitle} %{x} <extra></extra>`,
        colorscale: 'Greens',
        showscale: false
      }];


      let configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };

      this.setCSVstring();
      Plotly.newPlot(this.weatherBinsHeatMap.nativeElement, data, layout, configOptions);
    } else if (this.weatherBinsHeatMap) {
      Plotly.purge(this.weatherBinsHeatMap.nativeElement);
    }
  }

  getFontColor(value: number): string {
    if (value !== undefined && isNaN(value) == false) {
      // * within 25% of min/max
      let datapointOccurenceRange = this.weatherBinsInput.multiBinDetails.max - this.weatherBinsInput.multiBinDetails.min;
      let rangeIntersection = datapointOccurenceRange * .50;
      if (value <= rangeIntersection || value === this.weatherBinsInput.multiBinDetails.min) {
        return "white";
      } else if (value > rangeIntersection || value === this.weatherBinsInput.multiBinDetails.max) {
        return "black";
      }
    }
    return "red";
  }

  setCSVstring() {
    let escapeDateFormattingToken = '';
    // Plotly heatmap data is bottom to top
    let heatMapCopy = copyObject(this.heatMap);
    let heatMapData = heatMapCopy.data.reverse();
    let yLabels = this.weatherBinsInput.cases.map(yParam => this.weatherBinsService.getfilledLabelRangeString(this.settings, yParam.field, yParam.lowerBound, yParam.upperBound));
    yLabels = yLabels.reverse();
    let xlabels = this.weatherBinsInput.cases[0].caseParameters.map(xParam => this.weatherBinsService.getfilledLabelRangeString(this.settings, xParam.field, xParam.lowerBound, xParam.upperBound));
    xlabels = xlabels.map(label => escapeDateFormattingToken + label)
    xlabels.unshift('')

    for(let i = 0; i < heatMapData.length; i++) {
      let yParamRange: Array<number | string> = heatMapData[i];
      let yLabelFormattingEscaped = escapeDateFormattingToken + yLabels[i]
      yParamRange.unshift(yLabelFormattingEscaped);
    }

    let csvData = {
      fields: xlabels,
      data: heatMapData
    }

    const csv = Papa.unparse(csvData);
    this.heatmapCSVstring = csv;
  }

    copySuccess() {
    this.showNotification = true;
    this.activateCheckmark = true;

    setTimeout(() => {
      this.showNotification = false;
      this.activateCheckmark = false;
    }, 5000);
  }

  // * Keep this code for ref
  // exportHeatmap() {
  //     console.log(this.weatherBinsInput);
  //     let escapeDateFormattingToken = '';
  //     // Plotly heatmap data is bottom to top
  //     let heatMapData = this.heatMap.data.reverse();
  //     let yLabels = this.weatherBinsInput.cases.map(yParam => this.weatherBinsService.getfilledLabelRangeString(this.settings, yParam.field, yParam.lowerBound, yParam.upperBound));
  //     yLabels = yLabels.reverse();
  //     let xlabels = this.weatherBinsInput.cases[0].caseParameters.map(xParam => this.weatherBinsService.getfilledLabelRangeString(this.settings, xParam.field, xParam.lowerBound, xParam.upperBound));
  //     xlabels = xlabels.map(label => escapeDateFormattingToken + label)
  //     xlabels.unshift('')

  //     for (let i = 0; i < heatMapData.length; i++) {
  //         let yParamRange: Array<number | string> = heatMapData[i];
  //         let yLabelFormattingEscaped = escapeDateFormattingToken + yLabels[i]
  //         yParamRange.unshift(yLabelFormattingEscaped);
  //     }

  //     let csvData = {
  //         fields: xlabels,
  //         data: heatMapData
  //       }

  //     const csv = Papa.unparse(csvData);

  //     let doc = this.windowRefService.getDoc();
  //     let dlLink = doc.createElement("a");
  //     let dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  //     dlLink.setAttribute("href", dataStr);
  //     // * don't access first index with empty string spacer
  //     let filenameXLabel = xlabels[xlabels.length - 1].split('(')[0];
  //     let filenameYLabel = yLabels[yLabels.length - 1].split('(')[0];
  //     dlLink.setAttribute('download', `Heatmap-${filenameXLabel}_${filenameYLabel}.csv`);
  //     dlLink.click();

  // }


}

// keep
const colorscaleValue = [
  [0, "rgb(255, 255, 255)"],
  [0.1, "rgb(255, 255, 255)"],

  [0.1, "rgb(20, 20, 20)"],
  [0.2, "rgb(20, 20, 20)"],

  [0.2, "rgb(40, 40, 40)"],
  [0.3, "rgb(40, 40, 40)"],

  [0.3, "rgb(60, 60, 60)"],
  [0.4, "rgb(60, 60, 60)"],

  [0.4, "rgb(80, 80, 80)"],
  [0.5, "rgb(80, 80, 80)"],

  [0.5, "rgb(100, 100, 100)"],
  [0.6, "rgb(100, 100, 100)"],

  [0.6, "rgb(120, 120, 120)"],
  [0.7, "rgb(120, 120, 120)"],

  [0.7, "rgb(140, 140, 140)"],
  [0.8, "rgb(140, 140, 140)"],

  [0.8, "rgb(160, 160, 160)"],
  [0.9, "rgb(160, 160, 160)"],

  [0.9, "rgb(180, 180, 180)"],
  [1.0, "rgb(180, 180, 180)"]
];


export interface PlotlyHeatmapData {
  data: Array<Array<number>>,
  yLabels: Array<string>,
  xlabels: Array<string>
}