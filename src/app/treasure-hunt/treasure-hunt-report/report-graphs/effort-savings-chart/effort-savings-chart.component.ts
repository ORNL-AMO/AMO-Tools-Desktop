import { Component, Input, OnInit } from '@angular/core';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';

import * as Plotly from 'plotly.js';
import { SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-effort-savings-chart',
  templateUrl: './effort-savings-chart.component.html',
  styleUrls: ['./effort-savings-chart.component.css']
})
export class EffortSavingsChartComponent implements OnInit {

  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  showPrint: boolean;
  @Input()
  xAxis: string;

  effortChartId: string = 'effortChartDiv';
  effortChart: SimpleChart;
  constructor() { }

  ngOnInit(): void {
    console.log(this.treasureHuntResults);
    this.initRenderChart();
  }

  
  initRenderChart() {
    Plotly.purge(this.effortChartId);

    this.effortChart = {
      name: 'Payback vs. Effort to Implement',
      data: [],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: true,
          type: 'linear',
          showgrid: true,
          showticksuffix: 'all',
          title: {
            text: "Payback Period (years)"
          },
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          rangemode: 'tozero',
          showgrid: true,
          title: {
            text: "Effort to Implement"
          },
          showticksuffix: 'all'
        },
        margin: {
          t: 50,
          b: 100,
          l: 75,
          r: 100
        }
      },
      config: {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'toggleSpikelines', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
    };

    this.buildTrace();
    let chartLayout = JSON.parse(JSON.stringify(this.effortChart.layout));
    Plotly.newPlot(this.effortChartId, this.effortChart.data, chartLayout, this.effortChart.config);
    console.log(this.effortChart);
  }

  buildTrace() {
    let x: number[] = [];
    let y: number[] = [];
    let hoverText: string[] = [];
    let colors: string[] = [];
    let sizeCostSavings: number[] = [];
    let maxMarkerSize = 100;

    this.treasureHuntResults.opportunitySummaries.forEach((summary, index) => {
      if (summary.opportunityCost.implementationEffort) {
        // x.push(summary.payback);
        // y.push(summary.opportunityCost.implementationEffort);
        // sizeCostSavings.push(summary.costSavings);
        // colors.push(graphColors[index]);
        // hoverText.push(summary.opportunityName);

        let trace: TraceData = {
          x: [summary.payback],
          y: [summary.opportunityCost.implementationEffort],
          type: 'scatter',
          name: summary.opportunityName,
          showlegend: true,
          // hovertemplate: `%{text}: %{x:.1r} years<br>`,
          hovertemplate: `${summary.opportunityName}<br>Cost Savings: %{marker.size:$,.2r}<br>`,
          hoverlabel: {
            namelength: 0
          },
          mode: 'markers',
          marker: {
            color: [graphColors[index]],
            size: [summary.costSavings],
            sizeref: 6,
            // sizeref: 2.0 * Math.max(...sizePayback) / (maxMarkerSize**2),
            sizemin: 10,
            sizemode: 'area',
          },
        }
        this.effortChart.data.push(trace);
      }
    });
    
    // let trace: TraceData = {
    //   x: x,
    //   y: y,
    //   text: hoverText,
    //   type: 'scatter',
    //   name: `{text}`,
    //   showlegend: false,
    //   // hovertemplate: `%{text}: %{x:.1r} years<br>`,
    //   hovertemplate: `%{text}<br>Cost Savings: %{marker.size:$,.2r}<br>`,
    //   mode: 'markers',
    //   marker: {
    //     color: colors,
    //     size: sizeCostSavings,
    //     sizeref: 6,
    //     // sizeref: 2.0 * Math.max(...sizePayback) / (maxMarkerSize**2),
    //     sizemin: 10,
    //     sizemode: 'area',
    //   },
    // }
    // this.effortChart.data.push(trace);
  }


}
