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

  hoverBtnLabels: boolean = false;
  displayLabelsTooltip: boolean = false;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;

  chartCurves: Array<{curveNumber: number, pointNumber: number, isHidden: boolean}> = [];
  hoverLabels: Array<{curveNumber: number, pointNumber: number, isHidden: boolean}> = [];
  showingHoverLabels: boolean = false;
  effortChartId: string = 'effortChartDiv';
  effortChart: SimpleChart;
  constructor() { }

  ngOnInit(): void {
    this.initRenderChart();
  }

  
  initRenderChart() {
    Plotly.purge(this.effortChartId);

    this.effortChart = {
      name: 'Payback vs. Effort to Implement',
      data: [],
      layout: {
        height: 600,
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
          b: 50,
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
    Plotly.newPlot(this.effortChartId, this.effortChart.data, chartLayout, this.effortChart.config)
      .then(chart => {
        chart.on('plotly_beforehover', () => {
          if (this.showingHoverLabels) {
            return false;
          }
        });
        chart.on('plotly_legendclick', (legendClick) => {
         this.updateVisibleLabels(legendClick);
        });
        chart.on('plotly_relayout', () => {
          // this.refreshHoverLabels();
          this.showingHoverLabels = false;
        });
      });
  }

  // refreshHoverLabels() {
  //   if (this.showingHoverLabels) {
  //     // reset labels on zoom in/out
  //     Plotly.Fx.hover(this.effortChartId, []);
  //     Plotly.Fx.hover(this.effortChartId, this.hoverLabels);
  //   }
  // }

  updateVisibleLabels(legendClick) {
    this.chartCurves.map(label => {
      if (label.curveNumber == legendClick.curveNumber) {
        label.isHidden = !label.isHidden;
      }
    });
    this.hoverLabels = this.chartCurves.filter(label => !label.isHidden);
    if (this.showingHoverLabels) {
      // Match Plotly's 300ms doubleclick timeout
      setTimeout(() => {
        Plotly.Fx.hover(this.effortChartId, []);
        Plotly.Fx.hover(this.effortChartId, this.hoverLabels);
      }, 300);
    }
  }

  updateChart() {
    let chartLayout = JSON.parse(JSON.stringify(this.effortChart.layout));
    Plotly.relayout(this.effortChartId, chartLayout);
  }

  buildTrace() {
    this.treasureHuntResults.opportunitySummaries.forEach((summary, index) => {
      if (summary.opportunityCost.implementationEffort) {
        let trace: TraceData = {
          x: [summary.payback],
          y: [summary.opportunityCost.implementationEffort],
          type: 'scatter',
          name: summary.opportunityName,
          showlegend: true,
          hovertemplate: `${summary.opportunityName}<br>Cost Savings: %{marker.size:$,.2r}<br>`,
          hoverlabel: {
            namelength: 0,
          },
          mode: 'markers',
          marker: {
            color: [graphColors[index]],
            size: [summary.costSavings],
            sizeref: 6,
            // Plotly default size calc
            // sizeref: 2.0 * Math.max(...sizePayback) / (maxMarkerSize**2),
            sizemin: 10,
            sizemode: 'area',
          },
        }
        this.effortChart.data.push(trace);
        this.chartCurves.push({curveNumber: index, pointNumber: 0, isHidden: false});
      }
    });
    this.hoverLabels = JSON.parse(JSON.stringify(this.chartCurves));
  }

   hideTooltip(btnType: string) {
    if (btnType === 'btnLabels') {
      this.hoverBtnLabels = false;
      this.displayLabelsTooltip = false;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
  }

  initTooltip(btnType: string) {
    if (btnType === 'btnLabels') {
      this.hoverBtnLabels = true;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 200);
  }

  checkHover(btnType: string) {
    if (btnType === 'btnLabels') {
      if (this.hoverBtnLabels) {
        this.displayLabelsTooltip = true;
      }
      else {
        this.displayLabelsTooltip = false;
      }
    }
    else if (btnType === 'btnGridLines') {
      if (this.hoverBtnGridLines) {
        this.displayGridLinesTooltip = true;
      }
      else {
        this.displayGridLinesTooltip = false;
      }
    }
  }
  
  toggleLabels() {
    if (!this.showingHoverLabels) {
      Plotly.Fx.hover(this.effortChartId, this.hoverLabels);
      this.showingHoverLabels = true;
    } else {
      Plotly.Fx.hover(this.effortChartId, []);
      this.showingHoverLabels = false;
    }
  }

  toggleGrid() {
    let showingGridX: boolean = this.effortChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.effortChart.layout.yaxis.showgrid;
    this.effortChart.layout.xaxis.showgrid = !showingGridX;
    this.effortChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }

}
