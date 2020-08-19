import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { FormGroup } from '../../../../../../node_modules/@angular/forms';

import * as Plotly from 'plotly.js';
import { SelectedDataPoint, SimpleChart, TraceData, TraceCoordinates, DataPoint } from '../../../../shared/models/plotting';
import { AchievableEfficiencyService } from '../achievable-efficiency.service';
import { pumpTypeRanges } from '../../../../psat/psatConstants';


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
  
  validEfficiency: boolean = false;
  firstChange: boolean = true;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;
  
  selectedDataPoints: Array<SelectedDataPoint>;
  pointColors: Array<string>;
  efficiencyChart: SimpleChart;

  xAxisTitle: string = "Flow Rate (gpm)";
  currentPumpType: any;
  defaultTraceCount: number = 2;
  defaultTraceOutlineColor = 'rgba(0, 0, 0, .6)';

  constructor(private psatService: PsatService,
              private achievableEfficiencyService: AchievableEfficiencyService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.xAxisTitle = `Flow Rate (${this.settings.flowMeasurement})`;
    this.currentPumpType = this.efficiencyForm.controls.pumpType.value;
    this.triggerInitialResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleResetData) {
        this.achievableEfficiencyService.initChartData();
        this.initRenderChart();
      }
      if (changes.toggleExampleData) {
        if (this.checkForm()) {
          this.achievableEfficiencyService.initChartData();
          this.initRenderChart();
        }
      }
      if (changes.toggleCalculate && !changes.toggleResetData && !changes.toggleExampleData) {
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
          this.createSelectedDataPoints(graphData);
        });
      });
    this.save();
  }

  updateChart() {
    let chartLayout = JSON.parse(JSON.stringify(this.efficiencyChart.layout));
    this.setCalculatedTraces();
    Plotly.update(this.currentChartId, this.efficiencyChart.data, chartLayout, [2,3]);

    this.save();
  }

  initChartSetup() {
    this.pointColors = graphColors;
    this.efficiencyChart = this.achievableEfficiencyService.efficiencyChart.getValue();
    this.selectedDataPoints = this.achievableEfficiencyService.selectedDataPoints.getValue();
    
    // Default line traces
    let maxData: TraceCoordinates = this.getMaxData();
    this.efficiencyChart.data[0].x = maxData.x;
    this.efficiencyChart.data[0].y = maxData.y;
    this.efficiencyChart.data[0].line.color = this.pointColors[0];

    let avgData: TraceCoordinates = this.getAvgData();
    this.efficiencyChart.data[1].x = avgData.x;
    this.efficiencyChart.data[1].y = avgData.y;
    this.efficiencyChart.data[1].line.color = this.pointColors[1];
    
    this.efficiencyChart.layout.xaxis.title.text = this.xAxisTitle;
  }
  

  getCurrentPoints(isUserDataPoint: boolean, userDataPointX?: number): Array<DataPoint> {
    let flowRateValue: number = isUserDataPoint? userDataPointX : this.efficiencyForm.controls.flowRate.value;
    let points: Array<DataPoint> = [];
    
    // Y values
    let efficiencyMax = this.calculateYmax(flowRateValue);
    let efficiencyAvg = this.calculateYaverage(flowRateValue);
    let calculatedX: number;
    
    if (efficiencyMax >= 0) {
      calculatedX = flowRateValue;
      points.push({x: calculatedX, y: efficiencyMax});
    } 
    if (efficiencyAvg >= 0) {
      calculatedX = flowRateValue;
      points.push({x: calculatedX, y: efficiencyAvg});
    }

    return points;
  }

  setCalculatedTraces() {
    let currentPoints: DataPoint[] = this.getCurrentPoints(false);
    let isInvalidPlot: boolean = currentPoints.some(point => isNaN(point.x) || isNaN(point.y)
      || !isFinite(point.x) || !isFinite(point.y)
    );

    if (!isInvalidPlot) {
      this.validEfficiency = true;
      currentPoints.forEach((point, i) => {
        let calculatedPoint: SelectedDataPoint = {
          pointColor: this.pointColors[i],
          pointX: point.x,
          pointY: point.y
        }
        let resultCoordinateTrace: TraceData = this.achievableEfficiencyService.getTraceDataFromPoint(calculatedPoint);
        let yMeasureTitle = i == 0? 'Maximum' : 'Average';
        let hoverTemplate = 'Flow Rate' + ': %{x} <br>' + yMeasureTitle + ': %{y:.2r}% <br>' + '<extra></extra>';
        resultCoordinateTrace.hovertemplate = hoverTemplate;
        resultCoordinateTrace.marker.color = calculatedPoint.pointColor;
        resultCoordinateTrace.marker.line = {
          color: this.defaultTraceOutlineColor,
          width: 4
        }

        this.efficiencyChart.data[this.defaultTraceCount + i] = resultCoordinateTrace;
        this.selectedDataPoints.splice(i, 1, calculatedPoint);
        this.cd.detectChanges();
      });
    } else {
      this.validEfficiency = false;
    }
  }

  createSelectedDataPoints(graphData) {
    let dataPoints: DataPoint[] = this.getCurrentPoints(true, graphData.points[0].x);
    
    dataPoints.forEach((point, i) => {
      let selectedPoint: SelectedDataPoint = {
        pointColor: this.pointColors[(this.efficiencyChart.data.length + 1) % this.pointColors.length],
        pointX: point.x,
        pointY: point.y
      }
      let selectedPointTrace = this.achievableEfficiencyService.getTraceDataFromPoint(selectedPoint);
      let yMeasureTitle = i == 0? 'Maximum' : 'Average';
      let hoverTemplate = 'Flow Rate' + ': %{x} <br>' + yMeasureTitle + ': %{y:.2r}% <br>' + '<extra></extra>';
      selectedPointTrace.hovertemplate = hoverTemplate;

      Plotly.addTraces(this.currentChartId, selectedPointTrace);
      this.selectedDataPoints.push(selectedPoint);
    });
    
    this.cd.detectChanges();
    this.save();
  }

  checkReplotMethod() {
    if (this.efficiencyForm.controls.pumpType.value !== this.currentPumpType) {
      this.currentPumpType = this.efficiencyForm.controls.pumpType.value;
      this.achievableEfficiencyService.initChartData();
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

  setXRange() {
    let ranges = JSON.parse(JSON.stringify(pumpTypeRanges));
    let xRange = {
      range: {min: 0, max: 0},
      increment: 10,
    };
    xRange.range = ranges.find(pumpType => pumpType.value == this.currentPumpType).range;
    if (xRange.range.min <= 5000) {
      xRange.increment = 10;
    } else if (xRange.range.max <= 50000) {
      xRange.increment = 100;
    } else {
      xRange.increment = 250;
    }
    this.efficiencyChart.layout.xaxis.range = [xRange.range.min, xRange.range.max];
    return xRange;
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

  getAvgData(): TraceCoordinates {
    let xRange = this.setXRange();
    let data: TraceCoordinates = {
      x: [],
      y: [],
    };
    for (let i = xRange.range.min; i < xRange.range.max; i = i + xRange.increment) {
      if (this.calculateYaverage(i) <= 100) {
        data.x.push(i);
        data.y.push(this.calculateYaverage(i));
      }
    }
    return data;
  }
  getMaxData(): TraceCoordinates {
    let xRange = this.setXRange();
    let data: TraceCoordinates = {
      x: [],
      y: [],
    };
    for (let i = xRange.range.min; i < xRange.range.max; i = i + xRange.increment) {
      if (this.calculateYmax(i) <= 100) {
        data.x.push(i);
        data.y.push(this.calculateYmax(i));
      }
    }
    return data;
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
