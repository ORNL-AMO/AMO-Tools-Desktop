import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { FormGroup } from '../../../../../../node_modules/@angular/forms';
import { SimpleChart, TraceData, TraceCoordinates } from '../../../../shared/models/plotting';
import { AchievableEfficiencyService, EfficiencyPoint, EfficiencyTrace } from '../achievable-efficiency.service';
import { pumpTypeRanges } from '../../../../psat/psatConstants';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-achievable-efficiency-graph',
    templateUrl: './achievable-efficiency-graph.component.html',
    styleUrls: ['./achievable-efficiency-graph.component.css'],
    standalone: false
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

  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;


  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;

  validEfficiency: boolean = false;
  firstChange: boolean = true;

  // Graphing / Defaults
  selectedDataPoints: Array<EfficiencyPoint>;
  pointColors: Array<string>;
  efficiencyChart: SimpleChart;
  xAxisTitle: string;
  defaultTraceCount: number = 2;
  defaultTraceOutlineColor = 'rgba(0, 0, 0, .6)';
  dataPointTraces: Array<EfficiencyTrace>;

  constructor(private psatService: PsatService,
    private achievableEfficiencyService: AchievableEfficiencyService,
    private cd: ChangeDetectorRef,
    private plotlyService: PlotlyService) { }

  ngOnInit() {
    this.xAxisTitle = `Flow Rate (${this.settings.flowMeasurement})`;
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (this.checkForm()) {
        this.achievableEfficiencyService.initChartData();
        this.renderChart();
      }
    } else {
      this.firstChange = false;
    }
  }

  save() {
    this.achievableEfficiencyService.efficiencyChart.next(this.efficiencyChart);
    this.achievableEfficiencyService.selectedDataPoints.next(this.selectedDataPoints);
    this.achievableEfficiencyService.dataPointTraces.next(this.dataPointTraces);
  }

  renderChart() {
    this.pointColors = graphColors;
    this.efficiencyChart = this.achievableEfficiencyService.efficiencyChart.getValue();
    this.dataPointTraces = this.achievableEfficiencyService.dataPointTraces.getValue();
    this.selectedDataPoints = this.achievableEfficiencyService.selectedDataPoints.getValue();
    this.setMaxAvgLines();
    this.setMaxAndAvgPoints();
    this.newPlot();
    this.save();
  }

  newPlot() {
    let traceData: Array<TraceData> = new Array();
    this.efficiencyChart.data.forEach((trace, i) => {
      traceData.push(trace);
    });
    this.dataPointTraces.forEach(trace => {
      traceData.push(trace);
    });

    let chartLayout = JSON.parse(JSON.stringify(this.efficiencyChart.layout));
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, traceData, chartLayout, this.efficiencyChart.config)
        .then(chart => {
          chart.on('plotly_click', (graphData) => {
            this.createDataPoints(graphData);
          });
        });
    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, traceData, chartLayout, this.efficiencyChart.config)
        .then(chart => {
          chart.on('plotly_click', (graphData) => {
            this.createDataPoints(graphData);
          });
        });
    }
  }

  updateChart() {
    this.setMaxAndAvgPoints();
    this.newPlot();
    this.save();
  }

  setMaxAvgLines() {
    // Default line traces
    let maxData: TraceCoordinates = this.getMaxData();
    this.efficiencyChart.data[0].x = maxData.x;
    this.efficiencyChart.data[0].y = maxData.y;
    this.efficiencyChart.data[0].line.color = this.getPointColor(0);

    let avgData: TraceCoordinates = this.getAvgData();
    this.efficiencyChart.data[1].x = avgData.x;
    this.efficiencyChart.data[1].y = avgData.y;
    this.efficiencyChart.data[1].line.color = this.getPointColor(1);

    this.efficiencyChart.layout.xaxis.title.text = this.xAxisTitle;
  }

  setMaxAndAvgPoints() {
    let currentPoints: EfficiencyPoint[] = this.getCurrentPoints(false);
    let isInvalidPlot: boolean = currentPoints.some(point => isNaN(point.x) || isNaN(point.y)
      || !isFinite(point.x) || !isFinite(point.y)
    );

    if (!isInvalidPlot) {
      this.validEfficiency = true;
      let maximumPoint: EfficiencyPoint = {
        id: undefined,
        pointColor: this.getPointColor(0),
        x: currentPoints[0].x,
        y: currentPoints[0].y,
        name: 'Maximum',
        avgMaxEffColumn: this.getAvgMaxEffColumn(currentPoints[1].y, currentPoints[0].y)
      }

      if (this.selectedDataPoints.length === 0) {
        this.selectedDataPoints.push(maximumPoint);
      } else {
        this.selectedDataPoints.shift();
        this.selectedDataPoints.unshift(maximumPoint);
      }
  
      let maximumPointTrace = this.achievableEfficiencyService.getTraceDataFromPoint(maximumPoint);
      let hoverTemplate = 'Flow Rate' + ': %{x} <br>' + 'Maximum' + ': %{y:.2r}% <br>' + '<extra></extra>';
      maximumPointTrace.hovertemplate = hoverTemplate;
      maximumPointTrace.marker.line = {
        color: this.defaultTraceOutlineColor,
        width: 4
      }
      this.efficiencyChart.data[this.defaultTraceCount] = maximumPointTrace;

  
      let averagePoint: EfficiencyPoint = {
        id: undefined,
        pointColor: this.getPointColor(1),
        x: currentPoints[1].x,
        y: currentPoints[1].y,
        name: 'Average'
      }
      let averagePointTrace = this.achievableEfficiencyService.getTraceDataFromPoint(averagePoint);
      hoverTemplate = 'Flow Rate' + ': %{x} <br>' + 'Average' + ': %{y:.2r}% <br>' + '<extra></extra>';
      averagePointTrace.hovertemplate = hoverTemplate;
      averagePointTrace.marker.line = {
        color: this.defaultTraceOutlineColor,
        width: 4
      }
      this.efficiencyChart.data[this.defaultTraceCount + 1] = averagePointTrace;
      this.cd.detectChanges();

    } else {
      this.validEfficiency = false;
    }
  }


  getCurrentPoints(isUserDataPoint: boolean, userDataPointX?: number): Array<EfficiencyPoint> {
    let flowRateValue: number = isUserDataPoint ? userDataPointX : this.efficiencyForm.controls.flowRate.value;
    let points: Array<EfficiencyPoint> = [];
    let efficiencyMax = this.calculateYmax(flowRateValue);
    let efficiencyAvg = this.calculateYaverage(flowRateValue);

    if (efficiencyMax >= 0 && efficiencyAvg >= 0) {
      points.push({
        id: undefined,
        pairId: undefined,
        x: flowRateValue,
        y: efficiencyMax,
        avgMaxEffColumn: this.getAvgMaxEffColumn(efficiencyMax, efficiencyAvg)
      });
    }
    if (efficiencyAvg >= 0) {
      points.push({
        id: undefined,
        x: flowRateValue,
        y: efficiencyAvg,
        avgMaxEffColumn: undefined
      });
    }

    return points;
  }

  createDataPoints(graphData) {
    let dataPoints: EfficiencyPoint[] = this.getCurrentPoints(true, graphData.points[0].x);

    let maximumPoint: EfficiencyPoint = {
      id: undefined,
      pairId: undefined,
      pointColor: this.getPointColor(0),
      x: dataPoints[0].x,
      y: dataPoints[0].y,
      name: 'Maximum',
      avgMaxEffColumn: this.getAvgMaxEffColumn(dataPoints[1].y, dataPoints[0].y)
    }
    
    let maximumPointTrace = this.achievableEfficiencyService.getTraceDataFromPoint(maximumPoint);
    let hoverTemplate = 'Flow Rate' + ': %{x} <br>' + 'Maximum' + ': %{y:.2r}% <br>' + '<extra></extra>';
    maximumPointTrace.hovertemplate = hoverTemplate;

    let averagePoint: EfficiencyPoint = {
      id: undefined,
      pointColor: this.getPointColor(1),
      x: dataPoints[1].x,
      y: dataPoints[1].y,
      name: 'Average'
    }
    let averagePointTrace: EfficiencyTrace = this.achievableEfficiencyService.getTraceDataFromPoint(averagePoint);
    hoverTemplate = 'Flow Rate' + ': %{x} <br>' + 'Average' + ': %{y:.2r}% <br>' + '<extra></extra>';
    averagePointTrace.hovertemplate = hoverTemplate;
    
    maximumPointTrace.id = maximumPointTrace.id;
    maximumPointTrace.pairId = averagePointTrace.id;
    maximumPoint.id = maximumPointTrace.id;
    maximumPoint.pairId = averagePointTrace.id;

    this.selectedDataPoints.push(maximumPoint);
    this.dataPointTraces.push(maximumPointTrace, averagePointTrace);

    this.newPlot();
    this.cd.detectChanges();
    this.save();
  }

  deleteDataPoint(deletePoint: EfficiencyPoint, index: number) {
    this.dataPointTraces = this.dataPointTraces.filter(trace => { return trace.id != deletePoint.id && trace.id != deletePoint.pairId});
    this.selectedDataPoints.splice(index, 1);
    this.newPlot();
    this.cd.detectChanges();
    this.save();
  }


  setXRange() {
    let ranges = JSON.parse(JSON.stringify(pumpTypeRanges));
    let xRange = {
      range: { min: 0, max: 0 },
      increment: 10,
    };
    xRange.range = ranges.find(pumpType => pumpType.value == this.efficiencyForm.controls.pumpType.value).range;
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
        this.efficiencyForm.controls.rpm.value,
        this.efficiencyForm.controls.kinematicViscosity.value,
        this.efficiencyForm.controls.stageCount.value,
        this.efficiencyForm.controls.head.value,
        this.efficiencyForm.controls.pumpEfficiency.value,
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
        this.efficiencyForm.controls.rpm.value,
        this.efficiencyForm.controls.kinematicViscosity.value,
        this.efficiencyForm.controls.stageCount.value,
        this.efficiencyForm.controls.head.value,
        this.efficiencyForm.controls.pumpEfficiency.value,
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
      this.efficiencyForm.controls.rpm.status === 'VALID' &&
      this.efficiencyForm.controls.kinematicViscosity.status === 'VALID' &&
      this.efficiencyForm.controls.stageCount.status === 'VALID' &&
      this.efficiencyForm.controls.head.status === 'VALID' &&
      this.efficiencyForm.controls.pumpEfficiency.status === 'VALID' &&
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
      this.newPlot();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.newPlot();
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

  getPointColor(index: number, getRandom = false) {
    let color = index % 2 === 0? this.pointColors[0] : this.pointColors[1]
    if(!getRandom) {
      return color;
    }
    // return this.getRandomOpacity(color);
    return this.pointColors[(this.dataPointTraces.length + 1) % this.pointColors.length];
  }

  getAvgMaxEffColumn(avg: number, max: number) {
    return `${avg} - ${max}`;
  }

//   getRandomOpacity(pointColor: string) {
//     const sanitizedHex = pointColor.replace("#", "");
//     const bigint = parseInt(sanitizedHex, 16);
//     const r = (bigint >> 16) & 255;
//     const g = (bigint >> 8) & 255;
//     const b = bigint & 255;

//     const minOpacity = 0.3; 
//     const maxOpacity = 0.9;
//     const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity;

//     return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`;
// }

}
