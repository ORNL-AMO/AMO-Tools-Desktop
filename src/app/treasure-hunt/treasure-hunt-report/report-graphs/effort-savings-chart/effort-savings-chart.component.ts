import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';

import * as Plotly from 'plotly.js';
import { SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from "../../../../shared/models/settings";

export interface ChartOpportunity {
  curveNumber: number, 
  pointNumber: number, 
  isHidden: boolean,
  name: string,
  effort: number,
  savings: number,
  payback: number,
  color: string
};

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
  settings: Settings;

  hoverBtnLabels: boolean = false;
  displayLabelsTooltip: boolean = false;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;

  chartOpportunities: Array<ChartOpportunity> = [];
  hoverLabels: Array<{curveNumber: number, pointNumber: number}> = [];
  showingHoverLabels: boolean = false;
  effortChartId: string = 'effortChartDiv';
  effortChart: SimpleChart;

  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  constructor() { }

  ngOnInit(): void {
    if(!this.showPrint){
      this.initRenderChart();
    }else{
      this.initRenderPrintChart();
    }
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
          this.showingHoverLabels = false;
        });
      });
  }

  initRenderPrintChart() {
    Plotly.purge(this.effortChartId);

    this.effortChart = {
      name: 'Payback vs. Effort to Implement',
      data: [],
      layout: {
        height: 600,
        width: 1000,
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
        displayModeBar: false,
        responsive: false
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
          this.showingHoverLabels = false;
        });
      });
  }

  updateVisibleLabels(legendClick) {
    this.chartOpportunities.map(label => {
      if (label.curveNumber == legendClick.curveNumber) {
        label.isHidden = !label.isHidden;
      }
    });
    this.hoverLabels = this.chartOpportunities.filter(label => !label.isHidden).map(label => {
      return {
        curveNumber: label.curveNumber,
        pointNumber: label.pointNumber
      }
    });

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
        let currentColor = graphColors[index % graphColors.length];
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
            color: [currentColor],
            size: [summary.costSavings],
            sizeref: 6,
            // Plotly default sizeref calc
            // sizeref: 2.0 * Math.max(...sizePayback) / (maxMarkerSize**2),
            sizemin: 10,
            sizemode: 'area',
          },
        }
        this.effortChart.data.push(trace);
        this.chartOpportunities.push(
          {
            curveNumber: index, 
            pointNumber: 0, 
            isHidden: false,
            name: summary.opportunityName,
            effort: summary.opportunityCost.implementationEffort,
            savings: summary.costSavings,
            payback: summary.payback,
            color: currentColor
          }
        );
      }
    });
    this.hoverLabels = JSON.parse(JSON.stringify(this.chartOpportunities.map(label => {
      return {
        curveNumber: label.curveNumber,
        pointNumber: label.pointNumber
      }
    })));
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

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

}
