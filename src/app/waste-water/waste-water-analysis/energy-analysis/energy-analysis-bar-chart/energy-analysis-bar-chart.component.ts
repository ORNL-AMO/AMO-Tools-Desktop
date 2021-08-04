import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js';
import { WasteWaterAnalysisService } from '../../waste-water-analysis.service';
import { Settings } from '../../../../shared/models/settings'; 
@Component({
  selector: 'app-energy-analysis-bar-chart',
  templateUrl: './energy-analysis-bar-chart.component.html',
  styleUrls: ['./energy-analysis-bar-chart.component.css']
})
export class EnergyAnalysisBarChartComponent implements OnInit {
  @Input()
  chartInfo: string;
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;

  @ViewChild('analysisBarChart', { static: false }) analysisBarChart: ElementRef;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let layout = {
      width: undefined,
      title: {
        text: 'Energy Usage',
      },
      yaxis: {
        width: undefined,
        title: {
          text: 'MWh/yr',
          font: {
            family: 'Arial',
            size: 16
          }
        },
        tickprefix: '',
      }
    };
    let traceData;
    if (this.chartInfo == 'energyCost') {
      traceData = this.getEnergyCostData();
      layout.title.text = 'Energy Cost';
      layout.yaxis.title.text = this.settings.currency + "/yr";
    } else if (this.chartInfo == 'energyUse') {
      traceData = this.getEnergyUsageData();
      layout.yaxis.tickprefix = '';
    }

    if (this.printView) {
      layout.width = 900;
    }

    let configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: !this.printView,
      responsive: true,
    };
    Plotly.newPlot(this.analysisBarChart.nativeElement, traceData, layout, configOptions);
  }

  getEnergyCostData() {
    let yVals: Array<number> = [this.wasteWaterAnalysisService.baselineResults.AeCost];
    let xVals: Array<string> = ['Baseline'];
    let markerColors: Array<string> = ['#1E7640'];
    this.wasteWaterAnalysisService.modificationsResultsArr.forEach(modification => {
      xVals.push(modification.name);
      yVals.push(modification.results.AeCost);
      markerColors.push(modification.color);
    });
    return [{
      x: xVals,
      y: yVals,
      type: 'bar',
      textposition: 'auto',
      hoverinfo: 'text',
      text: yVals.map(val => { return this.getFormatedValue(val) }),
      marker: {
        color: markerColors,
        line: {
          width: 1
        }
      }
    }]
  }

  getEnergyUsageData() {
    let yVals: Array<number> = [this.wasteWaterAnalysisService.baselineResults.AeEnergyAnnual];
    let xVals: Array<string> = ['Baseline'];
    let markerColors: Array<string> = ['#1E7640'];
    this.wasteWaterAnalysisService.modificationsResultsArr.forEach(modification => {
      xVals.push(modification.name);
      yVals.push(modification.results.AeEnergyAnnual);
      markerColors.push(modification.color);
    });
    return [{
      x: xVals,
      y: yVals,
      type: 'bar',
      text: yVals.map(val => { return this.getFormatedValue(val, undefined, 'MWh') }),
      textposition: 'auto',
      hoverinfo: 'text',
      marker: {
        color: markerColors,
        line: {
          width: 1
        }
      }
    }]
  }

  getFormatedValue(num: number, prefix?: string, suffix?: string): string {
    if (num) {
      let formattedWithDecimal = (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      if (prefix) {
        return prefix + formattedWithDecimal.substring(0, formattedWithDecimal.length - 3);
      } else if (suffix) {
        return formattedWithDecimal.substring(0, formattedWithDecimal.length - 3) + ' ' + suffix;
      } else {
        return formattedWithDecimal.substring(0, formattedWithDecimal.length - 3);
      }
    }
    return;
  }
}
