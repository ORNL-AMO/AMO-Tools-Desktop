import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { SSMTLosses } from '../../../../shared/models/steam/steam-outputs';
import * as Plotly from 'plotly.js';
import { ReportGraphsService } from '../report-graphs.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-ssmt-waterfall',
  templateUrl: './ssmt-waterfall.component.html',
  styleUrls: ['./ssmt-waterfall.component.css']
})
export class SsmtWaterfallComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  // @Input()
  // selectedSsmt2: SSMT;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string }>;
  @Input()
  settings: Settings;
  @Input()
  xAxisRange: number;

  @ViewChild('ssmtWaterfall', { static: false }) ssmtWaterfall: ElementRef;

  constructor(private reportGraphsService: ReportGraphsService) { }

  ngOnInit(): void {
  }


  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges() {
    if (this.ssmtWaterfall) {
      this.createChart();
    }
  }

  createChart() {
    Plotly.purge(this.ssmtWaterfall.nativeElement);
    let labelsAndValues: Array<{ value: number, label: string, stackTraceValue: number, color: string }> = this.getSsmtWatefallData(this.ssmt);
    let stackTraces = {
      x: labelsAndValues.map(val => { return val.stackTraceValue }),
      y: labelsAndValues.map(val => { return val.label }),
      hoverinfo: 'none',
      // hovertemplate: '%{y:$,.0f}<extra></extra>',
      // name: "Projected Costs",
      type: "bar",
      marker: {
        color: 'rgba(0,0,0,0)',
        width: .8
      },
      orientation: 'h'
    };

    let texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr';
    let energyTraces = {
      x: labelsAndValues.map(val => { return val.value }),
      y: labelsAndValues.map(val => { return val.label }),
      hoverinfo: 'all',
      hovertemplate: '%{x:,.0f}<extra></extra>',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      texttemplate: texttemplate,
      name: "Energy Usage",
      type: "bar",
      marker: {
        color: labelsAndValues.map(val => { return val.color }),
        width: .8
      },
      orientation: 'h'
    };

    var data = [stackTraces, energyTraces];
    var layout = {
      barmode: 'stack',
      showlegend: false,
      font: {
        size: 12,
      },
      yaxis: {
        fixedrange: true
      },
      xaxis: {
        range: [0, this.xAxisRange + 75],
        automargin: true
      },
      margin: { t: 30, b: 40, r: 150, l: 150 },
      clickmode: 'none',
      dragmode: false
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    Plotly.react(this.ssmtWaterfall.nativeElement, data, layout, configOptions);
  }

  // addData(data: Array<any>, ssmt: SSMT): Array<any> {
  //   let labelsAndValues: Array<{ value: number, label: string, measure: string, color: string }> = this.getSsmtWatefallData(ssmt);
  //   data.push(
  //     {
  //       // height: 6,
  //       type: "waterfall",
  //       orientation: "h",
  //       measure: labelsAndValues.map(val => { return val.measure }),
  //       y: labelsAndValues.map(val => { return val.label }),
  //       x: labelsAndValues.map(val => { return val.value }),
  //       marker: {
  //         colors: labelsAndValues.map(val => { return val.color })
  //       },
  //       textposition: 'outside',
  //       hoverinfo: 'all',
  //       texttemplate: '<b>%{label}:</b> %{value:,.2f}',
  //       hovertemplate: 'Energy: %{x:.3r}<extra></extra>'
  //       // connector: {
  //       //   mode: "between",
  //       //   line: {
  //       //     width: 4,
  //       //     color: "rgb(0, 0, 0)",
  //       //     dash: 0
  //       //   }
  //       // }
  //     }
  //   );
  //   return data;
  // }


  getSsmtWatefallData(ssmt: SSMT): Array<{ value: number, label: string, stackTraceValue: number, color: string }> {
    let ssmtLosses: SSMTLosses;
    if (ssmt.name == 'Baseline') {
      ssmtLosses = this.baselineLosses;
    } else {
      ssmtLosses = this.modificationLosses.find(lossObj => { return lossObj.name == ssmt.name }).outputData;
    }
    let labelsAndValues: Array<{ value: number, label: string, stackTraceValue: number, color: string }> = this.reportGraphsService.getWaterfallLabelsAndValues(ssmtLosses);
    return labelsAndValues
  }


  // createBarChart() {
  //   let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData();
  //   let projectCostTrace = {
  //     x: chartData.labels,
  //     y: chartData.projectedCosts,
  //     hoverinfo: 'all',
  //     hovertemplate: '%{y:$,.0f}<extra></extra>',
  //     name: "Projected Costs",
  //     type: "bar",
  //     marker: {
  //       color: graphColors[0],
  //       width: .8
  //     },
  //   };
  //   let costSavingsTrace = {
  //     x: chartData.labels,
  //     y: chartData.costSavings,
  //     hoverinfo: 'all',
  //     hovertemplate: '%{y:$,.0f}<extra></extra>',
  //     name: "Cost Savings",
  //     type: "bar",
  //     marker: {
  //       color: graphColors[1]
  //     },
  //   }

  //   var data = [projectCostTrace, costSavingsTrace];
  //   var layout = {
  //     barmode: 'stack',
  //     showlegend: true,
  //     legend: {
  //       x: .25,
  //       y: 1.5,
  //       orientation: "h"
  //     },
  //     font: {
  //       size: 14,
  //     },
  //     yaxis: {
  //       hoverformat: '.3r',
  //       // automargin: true,
  //       tickformat: '$.2s',
  //       fixedrange: true
  //     },
  //     xaxis: {
  //       automargin: true,
  //       fixedrange: true
  //     },
  //     margin: { t: 15, b: 10 }
  //   };
  //   var configOptions = {
  //     modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
  //     displaylogo: false,
  //     displayModeBar: true,
  //     responsive: true
  //   };

  //   Plotly.react(this.utilityBarChart.nativeElement, data, layout, configOptions);
  // }

}
