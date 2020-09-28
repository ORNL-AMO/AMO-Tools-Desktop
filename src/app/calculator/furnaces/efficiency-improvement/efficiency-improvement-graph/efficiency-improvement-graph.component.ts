import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SimpleChart, TraceCoordinates } from '../../../../shared/models/plotting';

import * as Plotly from 'plotly.js';
import { Settings } from '../../../../shared/models/settings';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../../shared/models/phast/efficiencyImprovement';
import { Axis, DisplayPoint, EfficiencyImprovementGraphService } from '../efficiency-improvement-graph.service';

@Component({
  selector: 'app-efficiency-improvement-graph',
  templateUrl: './efficiency-improvement-graph.component.html',
  styleUrls: ['./efficiency-improvement-graph.component.css']
})
export class EfficiencyImprovementGraphComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  @Input()
  reset: boolean;
  @Input()
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;
  
  // DOM
  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';

  // Graph Data
  selectedDataPoints: Array<DisplayPoint>;
  defaultSelectedPointsData: Array<DisplayPoint>;
  efficiencyChart: SimpleChart;
  selectedAxisOptions = Array<{display: string, value: number}>();
  selectedAxis: number = 0;
  xAxis: Axis;

  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  constructor(private cd: ChangeDetectorRef,
              private efficiencyImprovementGraphService: EfficiencyImprovementGraphService) { }

  ngOnInit() {
    this.initAxisOptions();
    this.triggerInitialResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.efficiencyImprovementInputs.firstChange && !this.reset) {
      this.updateChart();
    } else {
      this.initRenderChart();
    }
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      this.initRenderChart();
    }, 25)
  }

  resizeGraph() {
    let expandedChart = this.ngChartContainer.nativeElement;
    if (expandedChart) {
      if (this.expanded) {
        this.currentChartId = this.expandedChartId;
      }
      else {
        this.currentChartId = this.tabPanelChartId;
      }
      this.initRenderChart();
    }
  }

  initAxisOptions() {
    let temperatureUnit = '&#8457;';
    if (this.settings.unitsOfMeasure == 'Metric') {
      temperatureUnit = '&#8451;';
    }
    this.selectedAxisOptions = [
      {display: 'Combustion Air Preheat Temperature ' + temperatureUnit, value: 0},
      {display: 'Flue Gas Temperature ' + temperatureUnit, value: 1},
      {display: 'O2 in Flue Gases (%)', value: 2},
    ];
  }

  save() {
    this.efficiencyImprovementGraphService.efficiencyChart.next(this.efficiencyChart);
    this.efficiencyImprovementGraphService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    this.initChartSetup();
    this.setTraces('Baseline');
    this.setTraces('Modification');

    let chartLayout = JSON.parse(JSON.stringify(this.efficiencyChart.layout));
    Plotly.newPlot(this.currentChartId, this.efficiencyChart.data, chartLayout, this.efficiencyChart.config)
      .then(chart => {
        chart.on('plotly_hover', hoverData => {
          this.displayHoverGroupData(hoverData);
        });
        chart.on('plotly_unhover', unhoverData => {
          this.removeHoverGroupData();
        });
      });
    this.save();
  }

  initChartSetup() {
    this.efficiencyImprovementGraphService.initChartData();
    this.efficiencyChart = this.efficiencyImprovementGraphService.efficiencyChart.getValue();
    this.selectedDataPoints = this.efficiencyImprovementGraphService.selectedDataPoints.getValue();
  }

  updateChart() {
    this.setTraces('Baseline');
    this.setTraces('Modification');
    let chartLayout = JSON.parse(JSON.stringify(this.efficiencyChart.layout));
    Plotly.update(this.currentChartId, this.efficiencyChart.data, chartLayout);
    this.save();
  }

  setAxisAndUpdate() {
    this.updateChart();
  }

  setTraces(name = 'Baseline') {
      let isBaseline = true;
      let currentColor = '#000';
      let lineIndex = 0;
      let pointIndex = 1;
      if (name === 'Modification') {
        currentColor = graphColors[1];
        this.efficiencyImprovementInputs.currentEnergyInput = this.efficiencyImprovementOutputs.newEnergyInput;
        lineIndex = 2;
        pointIndex = 3;
        isBaseline = false;
      }

      // Line trace
      let graphData: {data: TraceCoordinates, xAxis: Axis} = this.efficiencyImprovementGraphService.getGraphData(this.settings, this.efficiencyImprovementInputs, this.selectedAxis, isBaseline);
      this.xAxis = graphData.xAxis;
      let lineTrace = this.efficiencyImprovementGraphService.getLineTrace();
      lineTrace.x = graphData.data.x;
      lineTrace.y = graphData.data.y;
      lineTrace.name = name;
      lineTrace.hovertemplate = this.xAxis.hoverTemplate;
      lineTrace.line.color = currentColor;
      
      // Point trace
      let fuelSavings = 0;
      let combAirTemp = this.efficiencyImprovementInputs.currentCombustionAirTemp;
      let o2FlueGas =  this.efficiencyImprovementInputs.currentFlueGasOxygen;
      let flueGasTemp =  this.efficiencyImprovementInputs.currentFlueGasTemp;
      let xPropertyValue = this.efficiencyImprovementInputs[this.xAxis.pointPropertyName];

      if (!isBaseline) {
        fuelSavings = this.efficiencyImprovementOutputs.newFuelSavings;
        combAirTemp = this.efficiencyImprovementInputs.newCombustionAirTemp;
        o2FlueGas =  this.efficiencyImprovementInputs.newFlueGasOxygen;
        flueGasTemp =  this.efficiencyImprovementInputs.newFlueGasTemp;
        xPropertyValue = this.efficiencyImprovementInputs[this.xAxis.pointModificationName];
      }
      let displayPoint: DisplayPoint = {
        name: `${name}`,
        pointColor: currentColor,
        pointX: xPropertyValue,
        pointY: fuelSavings,
        combAirTemp: combAirTemp,
        o2FlueGas: o2FlueGas,
        flueGasTemp: flueGasTemp
      };

      let pointTrace = this.efficiencyImprovementGraphService.getPointTrace(displayPoint);
      pointTrace.hovertemplate = this.xAxis.hoverTemplate;
      lineTrace.line.color = currentColor;
      pointTrace.marker.color = currentColor
      pointTrace.marker.line.color = currentColor;
      displayPoint.pointColor = currentColor;

      if (!this.efficiencyChart.data[lineIndex] && !this.efficiencyChart.data[pointIndex]) {
        this.efficiencyChart.data.push(lineTrace, pointTrace);
        this.selectedDataPoints.push(displayPoint);
      } else {
        this.efficiencyChart.data[lineIndex] = lineTrace;
        this.efficiencyChart.data[pointIndex] = pointTrace;
        this.selectedDataPoints.map((point, i) => { 
          if (i == pointIndex - lineIndex) {
            point.combAirTemp = displayPoint.combAirTemp;
            point.o2FlueGas = displayPoint.o2FlueGas;
            point.flueGasTemp = displayPoint.flueGasTemp;
          }
        })
      }
  }

  displayHoverGroupData(hoverEventData) {
    let hoverIndex = hoverEventData.points[0].pointIndex;
    // Save initial point data - assign on removeHoverGroupData
    this.defaultSelectedPointsData = JSON.parse(JSON.stringify(this.selectedDataPoints));
    this.selectedDataPoints.forEach((line, index) => {
      let splineTraceIndex = index + index;
      if (hoverIndex != 0) {
        line[this.xAxis.hoverName] = Number(this.efficiencyChart.data[splineTraceIndex].x[hoverIndex]);
        line.pointY = Number(this.efficiencyChart.data[splineTraceIndex].y[hoverIndex]);
      } else {
        // Hovering over trace marker - assign x,y directly
        line.pointX = Number(hoverEventData.points[0].x);
        line.pointY = Number(hoverEventData.points[0].y);
      }
    });
    this.cd.detectChanges();
  }

  removeHoverGroupData() {
    this.selectedDataPoints = this.defaultSelectedPointsData;
    this.cd.detectChanges();
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }


  hideTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
  }

  initTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 200);
  }

  checkHover(btnType: string) {
    if (btnType === 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
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
    else if (btnType === 'btnCollapseChart') {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      }
      else {
        this.displayCollapseTooltip = false;
      }
    }
  }

  toggleGrid() {
    let showingGridX: boolean = this.efficiencyChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.efficiencyChart.layout.yaxis.showgrid;
    this.efficiencyChart.layout.xaxis.showgrid = !showingGridX;
    this.efficiencyChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

}
