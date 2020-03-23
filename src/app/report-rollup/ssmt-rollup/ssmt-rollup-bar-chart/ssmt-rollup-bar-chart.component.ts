import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import * as Plotly from 'plotly.js';
import { ReportRollupService } from '../../report-rollup.service';
import { SsmtResultsData } from '../../report-rollup-models';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-ssmt-rollup-bar-chart',
  templateUrl: './ssmt-rollup-bar-chart.component.html',
  styleUrls: ['./ssmt-rollup-bar-chart.component.css']
})
export class SsmtRollupBarChartComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  dataOption: string

  @ViewChild('ssmtRollupBarChart', { static: false }) ssmtRollupBarChart: ElementRef;

  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit(): void {

  }
  ngAfterViewInit() {
    if (!this.printView) {
      this.createChart();
    } else {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.ssmtRollupBarChart && !this.printView) {
      this.createChart();
    } else if (this.ssmtRollupBarChart && this.printView) {
      this.createPrintChart();
    }
  }


  createChart() {
    let traces = new Array();
    let valuesAndLabels = this.getValuesAndLabels();
    let hovertemplate: string;
    if (this.dataOption == 'energy') {
      hovertemplate = '%{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr <extra></extra>';

    } else if (this.dataOption == 'cost') {
      hovertemplate = '%{value:$,.2f}/yr <extra></extra>';
    }

    traces = [{
      x: valuesAndLabels.labels,
      y: valuesAndLabels.baselineValues,
      text: '',
      textposition: 'auto',
      hovertemplate: hovertemplate,
      name: 'Baseline',
      type: 'bar',
    },
    {
      x: valuesAndLabels.labels,
      y: valuesAndLabels.modificationValues,
      text: '',
      textposition: 'auto',
      hovertemplate: hovertemplate,
      name: 'Modification',
      type: 'bar',
    }]

    let yAxisLabel: string = 'Annual Energy Cost ($/yr)';
    let tickFormat: string = '$.2s';
    if(this.dataOption == 'energy'){
      yAxisLabel = 'Annual Energy Usage (' + this.settings.steamEnergyMeasurement + '/hr)';
      tickFormat = '.2s'
    }
    let layout = {
      width: this.ssmtRollupBarChart.nativeElement.clientWidth,
      barmode: 'group',
      showlegend: true,
      legend: {
        orientation: "h"
      },
      font: {
        size: 16,
      },
      yaxis: {
        hoverformat: '.3r',
        tickformat: tickFormat,
        title: {
          text: yAxisLabel,
          font: {
            family: 'Arial',
            size: 16
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
      },
      margin: { t: 30, l: 100, r: 30, b: 50 }
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.ssmtRollupBarChart.nativeElement, traces, layout, configOptions);
  }

  // getValuesAndLabels(): Array<{ baselineValue: number, baselineLabel: string, modificationValue: number, modificationLabel: string, name: string }> {
  //   let ssmtResults: Array<SsmtResultsData> = this.reportRollupService.ssmtResults.getValue();
  //   let valuesAndLabels: Array<{ baselineValue: number, baselineLabel: string, modificationValue: number, modificationLabel: string, name: string }> = new Array();
  //   if (this.dataOption == 'cost') {
  //     ssmtResults.forEach(result => {
  //       valuesAndLabels.push({
  //         name: result.name,
  //         baselineValue: result.baselineResults.operationsOutput.totalOperatingCost,
  //         baselineLabel: 'Baseline',
  //         modificationLabel: result.modName,
  //         modificationValue: result.modificationResults.operationsOutput.totalOperatingCost
  //       });
  //     })
  //   } else if (this.dataOption == 'energy') {
  //     ssmtResults.forEach(result => {
  //       valuesAndLabels.push({
  //         name: result.name,
  //         baselineValue: result.baselineResults.operationsOutput.boilerFuelUsage,
  //         baselineLabel: 'Baseline',
  //         modificationLabel: result.modName,
  //         modificationValue: result.modificationResults.operationsOutput.boilerFuelUsage
  //       });
  //     })
  //   }
  //   return valuesAndLabels;
  // }

  getValuesAndLabels(): { labels: Array<string>, baselineValues: Array<number>, modificationValues: Array<number> } {
    let ssmtResults: Array<SsmtResultsData> = this.reportRollupService.ssmtResults.getValue();
    let labels: Array<string> = new Array();
    let baselineValues: Array<number> = new Array();
    let modificationValues: Array<number> = new Array();

    // let valuesAndLabels: Array<{ baselineValue: number, baselineLabel: string, modificationValue: number, modificationLabel: string, name: string }> = new Array();
    if (this.dataOption == 'cost') {
      ssmtResults.forEach(result => {
        labels.push(result.name);
        baselineValues.push(result.baselineResults.operationsOutput.totalOperatingCost);
        modificationValues.push(result.modificationResults.operationsOutput.totalOperatingCost);
        // valuesAndLabels.push({
        //   name: result.name,
        //   baselineValue: result.baselineResults.operationsOutput.totalOperatingCost,
        //   baselineLabel: 'Baseline',
        //   modificationLabel: result.modName,
        //   modificationValue: result.modificationResults.operationsOutput.totalOperatingCost
        // });
      })
    } else if (this.dataOption == 'energy') {
      ssmtResults.forEach(result => {
        labels.push(result.name);
        baselineValues.push(result.baselineResults.operationsOutput.boilerFuelUsage);
        modificationValues.push(result.modificationResults.operationsOutput.boilerFuelUsage);
        // valuesAndLabels.push({
        //   name: result.name,
        //   baselineValue: result.baselineResults.operationsOutput.boilerFuelUsage,
        //   baselineLabel: 'Baseline',
        //   modificationLabel: result.modName,
        //   modificationValue: result.modificationResults.operationsOutput.boilerFuelUsage
        // });
      })
    }
    return {
      labels: labels,
      baselineValues: baselineValues,
      modificationValues: modificationValues
    };
  }

  createPrintChart() {
    let traces = new Array();
    let valuesAndLabels = this.getValuesAndLabels();
    // let hovertemplate: string;
    // if (this.dataOption == 'energy') {
    //   hovertemplate = '%{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr <extra></extra>';

    // } else if (this.dataOption == 'cost') {
    //   hovertemplate = '%{value:$,.2f}/yr <extra></extra>';
    // }

    traces = [{
      x: valuesAndLabels.labels,
      y: valuesAndLabels.baselineValues,
      text: '',
      textposition: 'auto',
      // hovertemplate: hovertemplate,
      name: 'Baseline',
      type: 'bar',
    },
    {
      x: valuesAndLabels.labels,
      y: valuesAndLabels.modificationValues,
      text: '',
      textposition: 'auto',
      // hovertemplate: hovertemplate,
      name: 'Modification',
      type: 'bar',
    }]

    let yAxisLabel: string = 'Annual Energy Cost ($/yr)';
    let tickFormat: string = '$.2s';
    if(this.dataOption == 'energy'){
      yAxisLabel = 'Annual Energy Usage (' + this.settings.steamEnergyMeasurement + '/hr)';
      tickFormat = '.2s'
    }
    let layout = {
      // width: this.ssmtRollupBarChart.nativeElement.clientWidth,
      barmode: 'group',
      showlegend: true,
      legend: {
        orientation: "h"
      },
      font: {
        size: 16,
      },
      yaxis: {
        hoverformat: '.3r',
        tickformat: tickFormat,
        title: {
          text: yAxisLabel,
          font: {
            family: 'Arial',
            size: 16
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
      },
      
      width: 1000,
      margin: { t: 20, l: 100, r: 30, b: 40 }
    };

    var configOptions = {
      // modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: false,
    };
    Plotly.react(this.ssmtRollupBarChart.nativeElement, traces, layout, configOptions);
  }

}
