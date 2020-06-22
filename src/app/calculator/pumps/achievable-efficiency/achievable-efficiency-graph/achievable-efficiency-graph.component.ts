import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { FormGroup } from '../../../../../../node_modules/@angular/forms';

import * as Plotly from 'plotly.js';
import { SelectedDataPoint, SimpleChart, TraceData, TraceCoordinates, DataPoint } from '../../../../shared/models/plotting';
import { AchievableEfficiencyService } from '../achievable-efficiency.service';


@Component({
  selector: 'app-achievable-efficiency-graph',
  templateUrl: './achievable-efficiency-graph.component.html',
  styleUrls: ['./achievable-efficiency-graph.component.css']
})
export class AchievableEfficiencyGraphComponent implements OnInit {
  @Input()
  efficiencyForm: FormGroup;
  @Input()
  toggleCalculate: boolean;
  @Input()
  toggleResetData: boolean;
  @Input()
  toggleExampleData: boolean;
  @Input()
  settings: Settings;

  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild('achievableEfficiency', { static: false }) specSpeedChart: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }
  
  validEfficiency: boolean;
  firstChange: boolean = true;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  
  currentPumpType: any;
  defaultTraceCount: number = 2;
  expanded: boolean = false;
  
  selectedDataPoints: Array<SelectedDataPoint>;
  pointColors: Array<string>;
  efficiencyChart: SimpleChart;

  constructor(private psatService: PsatService,
              private achievableEfficiencyService: AchievableEfficiencyService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.currentPumpType = this.efficiencyForm.controls.pumpType.value;
    this.triggerInitialResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleResetData) {
        this.achievableEfficiencyService.initChartData();
        this.initRenderChart();
      }
      // TODO combine toggleExampleData into toggleCalculate?
      if (changes.toggleExampleData) {
        if (this.checkForm()) {
          this.initRenderChart();
        }
      }
      if (changes.toggleCalculate) {
        if (this.checkForm()) {
          this.checkReplotMethod();
        }
      }
    } else {
      this.firstChange = false;
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
      if (this.checkForm()) {
        this.initRenderChart();
      }
    }
  }

  save() {
    this.achievableEfficiencyService.efficiencyChart.next(this.efficiencyChart);
    this.achievableEfficiencyService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    
    this.initChartSetup();
    this.setCalculatedTraces();

    let chartLayout = JSON.parse(JSON.stringify(this.efficiencyChart.layout));
    Plotly.newPlot(this.currentChartId, this.efficiencyChart.data, chartLayout, this.efficiencyChart.config)
      .then(chart => {
        chart.on('plotly_click', (graphData) => {
          this.createSelectedDataPoint(graphData);
        });
      });
    this.save();
  }

  updateChart() {
    let chartLayout = JSON.parse(JSON.stringify(this.efficiencyChart.layout));
    this.setCalculatedTraces();
    Plotly.update(this.currentChartId, this.efficiencyChart.data, chartLayout, [1]);
    this.save();
  }

  initChartSetup() {
    this.pointColors = graphColors;
    this.efficiencyChart = this.achievableEfficiencyService.efficiencyChart.getValue();
    this.selectedDataPoints = this.achievableEfficiencyService.selectedDataPoints.getValue();
    
    let maxData: TraceCoordinates = this.getMaxData();
    let avgData: TraceCoordinates = this.getAvgData();
    // // maxTrace
    this.efficiencyChart.data[0].x = maxData.x;
    this.efficiencyChart.data[0].y = maxData.y;
    // avgTrace
    this.efficiencyChart.data[1].x = avgData.x;
    this.efficiencyChart.data[1].y = avgData.y;

    this.efficiencyChart.layout.xaxis.title.text =  `Flow Rate ("${this.settings.flowMeasurement}")`;
  }

  getCurrentPoints(): Array<DataPoint> {
    let points: Array<DataPoint> = [];
    // Y values
    let efficiencyMax = this.calculateYmax(this.efficiencyForm.controls.flowRate.value);
    let efficiencyAvg = this.calculateYaverage(this.efficiencyForm.controls.flowRate.value);
    let calculatedX: number;
    
    if (efficiencyMax >= 0) {
      calculatedX = this.efficiencyForm.controls.flowRate.value;
      points.push({x: calculatedX, y: efficiencyMax});
    } 
    if (efficiencyAvg >= 0) {
      calculatedX = this.efficiencyForm.controls.flowRate.value;
      points.push({x: calculatedX, y: efficiencyAvg});
    }

    return points;
  }

  setCalculatedTraces() {
    let currentPoints = this.getCurrentPoints();
    currentPoints.forEach((point, i) => {
      let calculatedPoint: SelectedDataPoint = {
        pointColor: '#000',
        pointX: point.x,
        pointY: point.y
      }

      let resultCoordinateTrace: TraceData = this.achievableEfficiencyService.getTraceDataFromPoint(calculatedPoint);
      resultCoordinateTrace.name = i == 0? "Achievable Efficiency (Max)" : "Achievable Efficiency (Avg)";

      if (!isNaN(calculatedPoint.pointX)) {
        this.validEfficiency = true;
        this.efficiencyChart.data[this.defaultTraceCount + i] = resultCoordinateTrace;
        this.selectedDataPoints.splice(this.defaultTraceCount + i, 1, calculatedPoint);
        this.cd.detectChanges();
      } else {
        this.validEfficiency = false;
      }
    });
  }

  createSelectedDataPoint(graphData) {
    let selectedPoint: SelectedDataPoint = {
      pointColor: this.pointColors[(this.efficiencyChart.data.length + 1) % this.pointColors.length],
      pointX: graphData.points[0].x,
      pointY: graphData.points[0].y
    }

    let selectedPointTrace = this.achievableEfficiencyService.getTraceDataFromPoint(selectedPoint);
    Plotly.addTraces(this.currentChartId, selectedPointTrace);
    this.selectedDataPoints.push(selectedPoint);
    this.cd.detectChanges();
    this.save();
  }

  checkReplotMethod() {
    if (this.efficiencyForm.controls.pumpType.value !== this.currentPumpType) {
      this.currentPumpType = this.efficiencyForm.controls.pumpType.value;
      this.initRenderChart();
    } else {
      this.updateChart();
    }
  }

  deleteDataPoint(point: SelectedDataPoint) {
    let traceCount: number = this.efficiencyChart.data.length;
    let deleteTraceIndex: number = this.efficiencyChart.data.findIndex(trace => trace.x[0] == point.pointX && trace.y[0] == point.pointY);
    
    // ignore default traces
    if (traceCount > this.defaultTraceCount && deleteTraceIndex != -1) {
      Plotly.deleteTraces(this.currentChartId, [deleteTraceIndex]);
      this.selectedDataPoints.splice(deleteTraceIndex - this.defaultTraceCount, 1);
      this.cd.detectChanges();
      this.save();
    }
  }

  calculateYaverage(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.controls.pumpType.value,
        flow,
        this.settings
      );
      return tmpResults.average;
    } else { return 0; }
  }
  
  calculateYmax(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.controls.pumpType.value,
        flow,
        this.settings
      );
      return tmpResults.max;
    } else { return 0; }
  }

  checkForm() {
    if (
      this.efficiencyForm.controls.pumpType.status === 'VALID' &&
      this.efficiencyForm.controls.flowRate.status === 'VALID' &&
      this.efficiencyForm.controls.pumpType.value !== 'Specified Optimal Efficiency'
    ) {
      return true;
    } else {
      return false;
    }
  }

  //   let tmpMax: any = _.maxBy(_.union(this.avgData, this.maxData), (val: { x: number, y: number }) => { return val.y; });
  //   let tmpMin: any = _.minBy(_.union(this.avgData, this.maxData), (val: { x: number, y: number }) => { return val.y; });
  //   let max = tmpMax.y;
  //   let min = tmpMin.y;
  //   let xRange: { min: number, max: number };
  //   xRange = {
  //     min: 0,
  //     max: this.width
  //   };
  //   let xDomain: { min: number, max: number };
  //   xDomain = {
  //     min: 0,
  //     max: 5000
  //   };
  //   this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);
  //   this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 16, 0, 0, 0);
  //   let yRange: { min: number, max: number };
  //   yRange = {
  //     min: this.height,
  //     max: 0
  //   };
  //   let yDomain: { min: number, max: number };
  //   yDomain = {
  //     min: min - 10,
  //     max: max + 10
  //   };
  //   this.y = this.lineChartHelperService.setScale('linear', yRange, yDomain);
  //   this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 11, 0, 0, 15);
  //   this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, "Flow Rate (" + this.settings.flowMeasurement + ")");
  //   this.lineChartHelperService.setYAxisLabel(this.svg, 0, this.height, -60, 0, "Achievable Efficiency (%)");



  getAvgData(): TraceCoordinates {
    let data: TraceCoordinates = {
      x: [],
      y: [],
    };
    for (var i = 0; i < 5000; i = i + 10) {
      if (this.calculateYaverage(i) <= 100) {
        data.x.push(i);
        data.y.push(this.calculateYaverage(i));
      }
    }
    return data;
  }
  getMaxData(): TraceCoordinates  {
    let data: TraceCoordinates = {
      x: [],
      y: [],
    };
    for (var i = 0; i < 5000; i = i + 10) {
      if (this.calculateYmax(i) <= 100) {
        data.x.push(i);
        data.y.push(this.calculateYmax(i));
      }
    }
    return data;
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
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

}
