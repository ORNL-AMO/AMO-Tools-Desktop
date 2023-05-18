import { ElementRef, HostListener, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ChillerPerformanceOutput } from '../../../../shared/models/chillers';
import { SimpleChart, TraceData } from '../../../../shared/models/plotting';

import * as Plotly from 'plotly.js-dist';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-cooling-tower-fan-chart',
  templateUrl: './cooling-tower-fan-chart.component.html',
  styleUrls: ['./cooling-tower-fan-chart.component.css']
})
export class CoolingTowerFanChartComponent implements OnInit {
  @Input()
  output: ChillerPerformanceOutput;
  @Input()
  settings: Settings;
  @ViewChild("ngChartContainer", { static: false })
  ngChartContainer: ElementRef;

  tabPanelChartId: string = "tabPanelDiv";
  expandedChartId: string = "expandedChartDiv";
  currentChartId: string = "tabPanelDiv";
  chillerPerformanceChart: SimpleChart;

  expanded: boolean;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  displayCollapseTooltip: boolean;

  constructor() {}

  ngOnInit() {
    this.triggerInitialResize();
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      this.initRenderChart();
    }, 100);
  }

  ngOnDestroy(){
    window.dispatchEvent(new Event("resize"));
  }

  @HostListener("document:keyup", ["$event"])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === "Escape") {
        this.contractChart();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.output && !changes.output.firstChange) {
      this.initRenderChart();
    }
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    let powerUnit = this.settings.unitsOfMeasure == 'Imperial'? 'hp' : 'kW'; 
    this.chillerPerformanceChart = this.getEmptyChart(powerUnit);
    let traces: Array<TraceData> = [
      {
        x: ['Baseline'],
        y: [this.output.baselinePower],
        type: "bar",
        name: 'Baseline',
        hovertemplate: `%{y:,.2r} % ${powerUnit}`,
        showlegend: false,
      },
      {
        x: ['Modification'],
        y: [this.output.modPower],
        type: "bar",
        name: 'Modification',
        hovertemplate: `%{y:,.2r} ${powerUnit}`,
        showlegend: false,
      },
    ];

    let chartLayout = JSON.parse(JSON.stringify(this.chillerPerformanceChart.layout));
    Plotly.newPlot(
      this.currentChartId,
      traces,
      chartLayout,
      this.chillerPerformanceChart.config
    );
  }

  getEmptyChart(powerUnit: string): SimpleChart {
    return {
      name: 'Power Consumption',
      data: [],
      layout: {
        hovermode: 'closest',
        showlegend: false,
        xaxis: {
          autorange: true,
          type: 'auto',
          showgrid: false,
          showticksuffix: ''
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: false,
          showticksuffix: '',
          title: {
            text: `Power Consumption (${powerUnit})`
          },
        },
        margin: {
          t: 25,
          b: 75,
          l: 75,
          r: 25
        }
      },
      config: {
        modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
    };
  }

  resizeGraph() {
    let expandedChart = this.ngChartContainer.nativeElement;
    if (expandedChart) {
      if (this.expanded) {
        this.currentChartId = this.expandedChartId;
      } else {
        this.currentChartId = this.tabPanelChartId;
      }
      this.initRenderChart();
    }
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip("btnExpandChart");
    this.hideTooltip("btnCollapseChart");
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip("btnExpandChart");
    this.hideTooltip("btnCollapseChart");
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }

  hideTooltip(btnType: string) {
    if (btnType === "btnExpandChart") {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    } else if (btnType === "btnCollapseChart") {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
  }

  initTooltip(btnType: string) {
    if (btnType === "btnExpandChart") {
      this.hoverBtnExpand = true;
    } else if (btnType === "btnCollapseChart") {
      this.hoverBtnCollapse = true;
    } 
    setTimeout(() => {
      this.checkHover(btnType);
    }, 200);
  }

  checkHover(btnType: string) {
    if (btnType === "btnExpandChart") {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      } else {
        this.displayExpandTooltip = false;
      }
    } else if (btnType === "btnCollapseChart") {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      } else {
        this.displayCollapseTooltip = false;
      }
    }
  }
}
