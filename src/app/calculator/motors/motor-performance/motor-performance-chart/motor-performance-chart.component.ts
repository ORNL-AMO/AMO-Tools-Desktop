import { Component, OnInit, HostListener, ViewChild, ElementRef, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { DataPoint, SimpleChart, TraceCoordinates, TraceData } from '../../../../shared/models/plotting';
import { UntypedFormGroup } from '@angular/forms';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { MotorPerformanceChartService, MotorPoint } from '../motor-performance-chart.service';
import { PlotlyService } from 'angular-plotly.js';


@Component({
  selector: 'app-motor-performance-chart',
  templateUrl: './motor-performance-chart.component.html',
  styleUrls: ['./motor-performance-chart.component.css']
})
export class MotorPerformanceChartComponent implements OnInit {
  @Input()
  performanceForm: UntypedFormGroup;
  @Input()
  toggleCalculate: boolean;
  @Input()
  settings: Settings;

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  // DOM
  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;

  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;

  // Graphing
  selectedDataPoints: Array<MotorPoint>;
  performanceChart: SimpleChart;
  traceNames = {
    0: 'Current (FLA)',
    1: 'Power Factor',
    2: 'Efficiency'
  };
  graphColors: Array<string>;

  tempMotorPower: number;
  tempRpm: number;
  tempEfficiencyClass: string;
  tempVoltage: number;
  tempAmps: number;
  tempLineFrequency: string;
  motorPointColors: Array<string>;
  dataPointTraces: Array<TraceData>;
  constructor(private performanceChartService: MotorPerformanceChartService, private cd: ChangeDetectorRef,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleCalculate && !changes.toggleCalculate.firstChange && this.performanceForm.valid) {
      this.checkCurveChanged();
      this.renderChart();
    }
  }

  ngAfterViewInit(){
    this.renderChart();
  }

  renderChart() {
    this.initChartSetup();
    this.drawTraces();
    this.dataPointTraces = new Array();
    this.selectedDataPoints = new Array();
    this.newPlot();
    this.save();
  }

  newPlot() {
    let traceData: Array<TraceData> = new Array();
    this.performanceChart.data.forEach((trace, i) => {
      traceData.push(trace);
    });
    this.dataPointTraces.forEach(trace => {
      traceData.push(trace);
    })

    let chartLayout = JSON.parse(JSON.stringify(this.performanceChart.layout));
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, traceData, chartLayout, this.performanceChart.config)
        .then(chart => {
          chart.on('plotly_click', chartData => {
            this.addSelectedPointTraces(chartData);
          });
        });
    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, traceData, chartLayout, this.performanceChart.config)
        .then(chart => {
          chart.on('plotly_click', chartData => {
            this.addSelectedPointTraces(chartData);
          });
        });
    }
  }

  initChartSetup() {
    this.graphColors = graphColors;
    this.performanceChart = this.performanceChartService.performanceChart.getValue();
    this.selectedDataPoints = this.performanceChartService.selectedDataPoints.getValue();
    this.cd.detectChanges();
  }

  drawTraces() {
    let allLineData: Array<TraceCoordinates> = this.performanceChartService.buildLineData(this.performanceForm, this.settings);
    allLineData.forEach((data, index) => {
      let trace = this.performanceChartService.getEmptyTrace();
      trace.x = data.x;
      trace.y = data.y;
      trace.name = this.traceNames[index];
      trace.hovertemplate = '%{y:.1f}%';
      trace.line.color = this.graphColors[(index) % this.graphColors.length]
      this.performanceChart.data[index] = trace;
    });
  }

  addSelectedPointTraces(graphData) {
    let currentPointIndex: number = graphData.points[0].pointIndex;
    let selectedMotorPoint: MotorPoint = this.getMotorPoint(currentPointIndex, graphData.points[0]);
    let currentColor = this.graphColors[(this.dataPointTraces.length / 3 + 3) % this.graphColors.length]
    this.performanceChart.data.forEach((trace, i) => {
      // Create points for 3 default line traces
      if (i < 3) {
        let point: MotorPoint = {
          pointColor: currentColor,
          current: selectedMotorPoint.current,
          power: selectedMotorPoint.power,
          efficiency: selectedMotorPoint.efficiency,
          shaftLoad: selectedMotorPoint.shaftLoad,
          x: Number(trace.x[currentPointIndex]),
          y: Number(trace.y[currentPointIndex])
        };
        let pointTrace = this.performanceChartService.getTraceDataFromPoint(point);
        this.dataPointTraces.push(pointTrace);
      }
    });
    this.newPlot();
    selectedMotorPoint.pointColor = currentColor;
    selectedMotorPoint.shaftLoad = Number((selectedMotorPoint.shaftLoad * 100).toFixed(3));
    this.selectedDataPoints.push(selectedMotorPoint);
    this.cd.detectChanges();
    this.save();
  }

  checkCurveChanged() {
    let curveChanged = false;
    if (this.tempMotorPower !== this.performanceForm.controls.horsePower.value) {
      curveChanged = true;
      this.tempMotorPower = this.performanceForm.controls.horsePower.value;
    }
    if (this.tempEfficiencyClass !== this.performanceForm.controls.efficiencyClass.value) {
      curveChanged = true;
      this.tempEfficiencyClass = this.performanceForm.controls.efficiencyClass.value;
    }
    if (this.tempRpm !== this.performanceForm.controls.motorRPM.value) {
      curveChanged = true;
      this.tempRpm = this.performanceForm.controls.motorRPM.value;
    }
    if (this.tempAmps !== this.performanceForm.controls.fullLoadAmps.value) {
      curveChanged = true;
      this.tempRpm = this.performanceForm.controls.fullLoadAmps.value;
    }
    if (this.tempVoltage !== this.performanceForm.controls.motorVoltage.value) {
      curveChanged = true;
      this.tempVoltage = this.performanceForm.controls.motorVoltage.value;
    }
    if (this.tempLineFrequency !== this.performanceForm.controls.frequency.value) {
      curveChanged = true;
      this.tempLineFrequency = this.performanceForm.controls.frequency.value;
    }

    if (curveChanged) {
      this.performanceChartService.initChart();
    }
  }

  getMotorPoint(currentPointIndex: number, currentPoint): MotorPoint {
    let relativeCoordinate = {
      shaftLoad: Number(this.performanceChart.data[0].x[currentPointIndex]),
      current: Number(this.performanceChart.data[0].y[currentPointIndex]),
      power: Number(this.performanceChart.data[1].y[currentPointIndex]),
      efficiency: Number(this.performanceChart.data[2].y[currentPointIndex]),
      x: currentPoint.x,
      y: currentPoint.y
    }
    return relativeCoordinate;
  }

  save() {
    this.performanceChartService.performanceChart.next(this.performanceChart);
    this.performanceChartService.selectedDataPoints.next(this.selectedDataPoints);
  }

  deleteDataPoint(point: DataPoint, index: number) {
    this.dataPointTraces = this.dataPointTraces.filter(trace => { return trace.marker.color != point.pointColor });
    this.selectedDataPoints.splice(index, 1);
    this.newPlot();
    this.cd.detectChanges();
    this.save();
  }

  toggleGrid() {
    let showingGridX: boolean = this.performanceChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.performanceChart.layout.yaxis.showgrid;
    this.performanceChart.layout.xaxis.showgrid = !showingGridX;
    this.performanceChart.layout.yaxis.showgrid = !showingGridY;
    this.newPlot();
    this.save();
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

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.newPlot();
    }, 200);
  }

}
