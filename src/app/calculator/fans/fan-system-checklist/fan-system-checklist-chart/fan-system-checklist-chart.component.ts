import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { FanSystemChecklistOutput } from '../../../../shared/models/fans';
import { SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-fan-system-checklist-chart',
  templateUrl: './fan-system-checklist-chart.component.html',
  styleUrls: ['./fan-system-checklist-chart.component.css']
})
export class FanSystemChecklistChartComponent implements OnInit {
  @Input()
  output: FanSystemChecklistOutput;
  @Input()
  settings: Settings;

  @ViewChild("expandedChartDiv", { static: false })  expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false })  panelChartDiv: ElementRef;
  fanChecklistChart: SimpleChart;

  expanded: boolean;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  displayCollapseTooltip: boolean;

  constructor(private plotlyService: PlotlyService) {}

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.renderChart();
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
      this.renderChart();
    }
  }

  renderChart() {
    let traces: Array<TraceData> = [];
    let xEquipment: Array<string> = [];
    let totalScores: Array<number> = [];
    let controlStack: Array<number> = [];
    let systemStack: Array<number> = [];
    let productionStack: Array<number> = [];
    let motorPowerStack: Array<number> = [];
    let operatingHourStack: Array<number> = [];

    if (this.output.equipmentResults) {

      this.output.equipmentResults.forEach(result => {
        xEquipment.push(result.name);
        controlStack.push(result.controlsScore);
        systemStack.push(result.systemScore);
        productionStack.push(result.productionScore);
        motorPowerStack.push(result.motorPowerScore);
        operatingHourStack.push(result.operatingHoursScore);
        totalScores.push(result.totalScore);
      });

      traces = [
        {
          x: xEquipment,
          y: motorPowerStack,
          type: 'bar',
          name: 'Motor Power',
          showlegend: true,
        },
        {
          x: xEquipment,
          y: operatingHourStack,
          type: 'bar',
          name: 'Operating Hours',
          showlegend: true,
        },
        {
          x: xEquipment,
          y: controlStack,
          type: 'bar',
          name: 'Control',
          showlegend: true,
        },
        {
          x: xEquipment,
          y: systemStack,
          type: 'bar',
          name: 'System',
          showlegend: true,
        },
        {
          x: xEquipment,
          y: productionStack,
          type: 'bar',
          name: 'Production',
          showlegend: true,
        },

      ];
    }

    let annotations = [];
    totalScores.forEach((score, index) => {
      annotations.push(
        {
          x: xEquipment[index], 
          y: score * 1.05, 
          text: String(score), showarrow: false
        })
    })
    this.fanChecklistChart = this.getEmptyChart(traces.length - 1);
    this.fanChecklistChart.layout.annotations = annotations;

    let chartLayout = JSON.parse(JSON.stringify(this.fanChecklistChart.layout));
    if(this.expanded && this.expandedChartDiv){
      this.plotlyService.newPlot(
        this.expandedChartDiv.nativeElement,
        traces,
        chartLayout,
        this.fanChecklistChart.config
      );
    }else if(!this.expanded && this.panelChartDiv){
      this.plotlyService.newPlot(
        this.panelChartDiv.nativeElement,
        traces,
        chartLayout,
        this.fanChecklistChart.config
      );
    }
  }


  getEmptyChart(xMaxValue: number): SimpleChart {
    return {
      name: 'Fan Checklist Scorecard',
      data: [],
      layout: {
        hovermode: 'closest',
        barmode: 'stack',
        showlegend: true,
        legend: {
          orientation: 'h',
          y: 1.5,
        },
        shapes: [
          {
            type: 'line',
            x0: -1,
            y0: 2,
            x1: xMaxValue,
            y1: 2,
            line: {
              color: 'rgb(192,192,192)',
              width: 4,
              dash: 'dot'
            }
          },
          {
            type: 'line',
            x0: -1,
            y0: 4,
            x1: xMaxValue,
            y1: 4,
            line: {
              color: 'rgb(192,192,192)',
              width: 4,
              dash: 'dot'
            }
          },
        ],
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
            text: 'Score'
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

  expandChart() {
    this.expanded = true;
    this.hideTooltip("btnExpandChart");
    this.hideTooltip("btnCollapseChart");
    setTimeout(() => {
      this.renderChart();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip("btnExpandChart");
    this.hideTooltip("btnCollapseChart");
    setTimeout(() => {
      this.renderChart();
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