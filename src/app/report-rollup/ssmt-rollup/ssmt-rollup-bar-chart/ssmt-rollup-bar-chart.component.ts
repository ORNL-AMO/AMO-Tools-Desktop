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
      this.createBarChart();
    } else {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.ssmtRollupBarChart && !this.printView) {
      this.createBarChart();
    } else if (this.ssmtRollupBarChart && this.printView) {
      this.createPrintChart();
    }
  }

  createBarChart() {
    var data = this.getDataObject();
    let yAxisLabel: string = 'Annual Energy Cost ($/yr)';
    let tickFormat: string = '$.2s';
    if (this.dataOption == 'energy') {
      yAxisLabel = 'Annual Energy Usage (' + this.settings.steamEnergyMeasurement + '/hr)';
      tickFormat = '.2s'
    }
    var layout = {
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: .25,
        y: 1.3,
        orientation: "h"
      },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        // automargin: true,
        tickformat: tickFormat,
        fixedrange: true,
        title: {
          text: yAxisLabel,
          font: {
            size: 14,
          }
        }
      },
      xaxis: {
        automargin: true,
        fixedrange: true
      },
      margin: { t: 15, b: 10 }
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    Plotly.react(this.ssmtRollupBarChart.nativeElement, data, layout, configOptions);
  }

  getDataObject() {
    let hoverTemplate: string = '%{y:$,.0f}<extra></extra>';
    if (this.dataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.steamEnergyMeasurement + '/hr';
    }
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData();
    let projectCostTrace = {
      x: chartData.labels,
      y: chartData.projectedCosts,
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: "Modification Costs",
      type: "bar",
      marker: {
        color: graphColors[1],
        width: .8
      },
    };
    let costSavingsTrace = {
      x: chartData.labels,
      y: chartData.costSavings,
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: "Savings From Baseline",
      type: "bar",
      marker: {
        color: graphColors[0]
      },
    }

    var data = [projectCostTrace, costSavingsTrace];
    return data;
  }

  getChartData(): { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } {
    let ssmtResults: Array<SsmtResultsData> = this.reportRollupService.ssmtResults.getValue();
    let projectedCosts: Array<number> = new Array();
    let labels: Array<string> = new Array();
    let costSavings: Array<number> = new Array();
    if (this.dataOption == 'cost') {
      ssmtResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.operationsOutput.totalOperatingCost - result.modificationResults.operationsOutput.totalOperatingCost);
        projectedCosts.push(result.modificationResults.operationsOutput.totalOperatingCost);
      })
    } else if (this.dataOption == 'energy') {
      ssmtResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.operationsOutput.boilerFuelUsage - result.modificationResults.operationsOutput.boilerFuelUsage);
        projectedCosts.push(result.modificationResults.operationsOutput.boilerFuelUsage);
      })
    }
    return {
      projectedCosts: projectedCosts,
      labels: labels,
      costSavings: costSavings
    }
  }

  createPrintChart() {
    var data = this.getDataObject();
    let yAxisLabel: string = 'Annual Energy Cost ($/yr)';
    let tickFormat: string = '$.2s';
    if (this.dataOption == 'energy') {
      yAxisLabel = 'Annual Energy Usage (' + this.settings.steamEnergyMeasurement + '/hr)';
      tickFormat = '.2s'
    }
    var layout = {
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: .25,
        y: 1.3,
        orientation: "h"
      },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        // automargin: true,
        tickformat: tickFormat,
        fixedrange: true,
        text: yAxisLabel
      },
      xaxis: {
        automargin: true,
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
    Plotly.react(this.ssmtRollupBarChart.nativeElement, data, layout, configOptions);
  }

}
