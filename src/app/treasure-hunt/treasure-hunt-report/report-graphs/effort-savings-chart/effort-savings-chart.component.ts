import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';

import * as Plotly from 'plotly.js-dist';
import { SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from "../../../../shared/models/settings";
import { PlotlyService } from 'angular-plotly.js';

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
    styleUrls: ['./effort-savings-chart.component.css'],
    standalone: false
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
  hoverLabels: Array<{ curveNumber: number, pointNumber: number }> = [];
  showingHoverLabels: boolean = false;
  effortChartId: string = 'effortChartDiv';
  effortChart: SimpleChart;

  showlegend: boolean = true;

  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  @ViewChild('effortChartDiv', { static: false }) effortChartDiv: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resize();
    }, 100);
  }
  dataSummaryTableString: any;
  constructor(private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  resize() {
    if (!this.showPrint) {
      this.initRenderChart();
    } else {
      this.initRenderPrintChart();
    }
  }

  ngAfterViewInit(){
    if (!this.showPrint) {
      this.initRenderChart();
    } else {
      this.initRenderPrintChart();
    }
  }

  initRenderChart() {
    if(this.effortChartDiv) {
      if (this.effortChartDiv.nativeElement.offsetWidth < 786 ) {
        this.showlegend = false;
      } else {
        this.showlegend = true;
      }
    }
    this.effortChart = {
      name: 'Payback vs. Effort to Implement',
      data: [],
      layout: {        
        showlegend: this.showlegend,
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
          l: 50,
          r: 5
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
    this.newPlot();
  }

  newPlot() {
    let chartLayout = JSON.parse(JSON.stringify(this.effortChart.layout));
    this.plotlyService.newPlot(this.effortChartDiv.nativeElement, this.effortChart.data, chartLayout, this.effortChart.config)
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
    this.effortChart = {
      name: 'Payback vs. Effort to Implement',
      data: [],
      layout: {
        showlegend: true,
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
          l: 50,
          r: 5
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
    this.plotlyService.newPlot(this.effortChartDiv.nativeElement, this.effortChart.data, chartLayout, this.effortChart.config);
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
        Plotly.Fx.hover(this.effortChartDiv.nativeElement, []);
        Plotly.Fx.hover(this.effortChartDiv.nativeElement, this.hoverLabels);
      }, 300);
    }
  }

  buildTrace() {
    this.treasureHuntResults.opportunitySummaries.forEach((summary, index) => {
      if (summary.opportunityCost && summary.opportunityCost.implementationEffort) {
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
      Plotly.Fx.hover(this.effortChartDiv.nativeElement, this.hoverLabels);
      this.showingHoverLabels = true;
    } else {
      Plotly.Fx.hover(this.effortChartDiv.nativeElement, []);
      this.showingHoverLabels = false;
    }
  }

  toggleGrid() {
    let showingGridX: boolean = this.effortChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.effortChart.layout.yaxis.showgrid;
    this.effortChart.layout.xaxis.showgrid = !showingGridX;
    this.effortChart.layout.yaxis.showgrid = !showingGridY;
    this.newPlot();
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

}
