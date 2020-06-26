import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import * as Plotly from 'plotly.js';
import { SelectedDataPoint, SimpleChart, TraceData, DataPoint } from '../../../../shared/models/plotting';
import { Settings } from '../../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';
import { SystemAndEquipmentCurveGraphService } from '../system-and-equipment-curve-graph.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

interface HoverGroupData {
  system: DataPoint,
  baseline: DataPoint,
  modification?: DataPoint,
};

@Component({
  selector: 'app-curve-graph',
  templateUrl: './curve-graph.component.html',
  styleUrls: ['./curve-graph.component.css']
})
export class CurveGraphComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  equipmentType: string;
  
  // DOM
  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';
  hoverGroup: boolean;
  fluidPowerHoverText: string[];
  
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }
  updateGraphSub: Subscription;
  
  // Tooltips
  firstChange: boolean = true;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;
  firstRender: boolean = true;
  createGraphTimer: NodeJS.Timeout;

  // Graphing
  selectedDataPoints: Array<SelectedDataPoint>;
  pointColors: Array<string>;
  curveEquipmentChart: SimpleChart;
  
  // Default traces
  defaultTraceCount: number = 3;
  defaultTraceOutlineColor = 'rgba(0, 0, 0, .6)';
  // TODO move to service
  traces = {
    'system': 0,
    'baseline': 1,
    'baselineIntersect': 2,
    'modification': 3,
    'modificationIntersect': 4,
    'systemHover': 5,
    'baselineHover': 6,
  };
  yName: string = 'Pressure';

  // Update conditions/data
  isSystemCurveShown: boolean;
  isEquipmentCurveShown: boolean;
  isEquipmentModificationShown: boolean;
  chartSetup: boolean = false;
  updatedTraces: Array<number> = [];
  fluidPowerData: Array<number>;
  hoverData: Array<string> = [];


  constructor(
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {    
    // this.triggerInitialResize();
    if (this.equipmentType == 'pump') {
      this.yName = 'Head';
    }
    this.updateGraphSub = this.systemAndEquipmentCurveService.updateGraph.subscribe(val => {
      if (val == true) {
        this.isSystemCurveShown = (this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'open');
        this.isEquipmentCurveShown = (this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open');
        this.setIsModificationShown();

        if (this.createGraphTimer != undefined) {
          clearTimeout(this.createGraphTimer);
        }
        this.createGraphTimer = setTimeout(() => {
          this.initRenderChart();
        }, 100);
        this.systemAndEquipmentCurveService.updateGraph.next(false);
      }
    });
  }

  ngOnDestroy() {
    this.updateGraphSub.unsubscribe();
  }

  setIsModificationShown() {
    if (this.isEquipmentCurveShown && this.systemAndEquipmentCurveService.equipmentInputs.getValue() != undefined) {
      this.isEquipmentModificationShown = this.systemAndEquipmentCurveService.equipmentInputs.getValue().baselineMeasurement != this.systemAndEquipmentCurveService.equipmentInputs.getValue().modifiedMeasurement;
    } else {
      this.isEquipmentModificationShown = false;
    }
  }


  triggerInitialResize() {
    this.firstRender = false;
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
      // TODO validation condition somewhere?
      if (true) {
        this.initRenderChart();
      }
    }
  }

  save() {
    this.systemAndEquipmentCurveGraphService.curveEquipmentChart.next(this.curveEquipmentChart);
    this.systemAndEquipmentCurveGraphService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    this.initChartSetup();
    this.drawTraceData();

    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));
    Plotly.newPlot(this.currentChartId, this.curveEquipmentChart.data, chartLayout, this.curveEquipmentChart.config)
      .then(chart => {
        chart.on('plotly_click', (graphData) => {
          // this.createSelectedDataPoints(graphData);
        });
        if (this.hoverGroup) {
          chart.on('plotly_hover', hoverData => {
            this.initHoverGroup(hoverData);
            console.log(hoverData);
          });
          chart.on('plotly_unhover', unhoverData => {
            this.removeHoverGroup();
          });
        }
      });

    this.save();
  }

  updateChart(hoverTraces?: Array<number>) {
    if (!hoverTraces) {
      this.updatedTraces = [];
      this.drawTraceData();
    }
    
    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));
    let updateIndices = hoverTraces || this.updatedTraces || undefined;
    console.log(updateIndices);
    Plotly.update(this.currentChartId, this.curveEquipmentChart.data, chartLayout, updateIndices);
    this.save();
  }

  initChartSetup() {
    this.hoverGroup = false;
    this.pointColors = graphColors;
    this.hoverData = [];
    // Trace data only updated if '..Shown' bools met - Get empty chart every render
    this.systemAndEquipmentCurveGraphService.initChartData();
    this.curveEquipmentChart = this.systemAndEquipmentCurveGraphService.curveEquipmentChart.getValue();
    this.selectedDataPoints = this.systemAndEquipmentCurveGraphService.selectedDataPoints.getValue();

    let measurement = this.equipmentType == 'pump' ?
      this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.distanceMeasurement)
      : this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanPressureMeasurement);
    this.curveEquipmentChart.layout.xaxis.title.text = `Flow (${this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanFlowRate)}))`;
    this.curveEquipmentChart.layout.yaxis.title.text = `${this.yName} (${measurement})`;
    this.chartSetup = true;
  }

  drawTraceData() {
    if (this.isSystemCurveShown == true
      && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
      this.hoverGroup = true;
      this.drawSystemCurve();
      this.updatedTraces.push(this.traces.system);          
    }

    if (this.isEquipmentCurveShown == true) {
      if (this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
        this.drawBaselineEquipmentCurve(this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs);
        this.updatedTraces.push(this.traces.baseline);          

        if (this.isEquipmentModificationShown == true) {
          this.drawModificationEquipmentCurve(this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs);
          this.updatedTraces.push(this.traces.modification);          
        } 
      }
    } 

    if (this.isSystemCurveShown && this.isEquipmentCurveShown
      && this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined
      && this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.length != 0
      && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined
      && this.systemAndEquipmentCurveService.systemCurveRegressionData.length != 0
    ) {
      this.addIntersectionPoints();
    } 
  }

  drawSystemCurve() {
    let curveTraceData: Array<any> = this.systemAndEquipmentCurveService.systemCurveRegressionData;
    curveTraceData.forEach((coordinate, index) => {
      this.curveEquipmentChart.data[this.traces.system].x.push(coordinate.x);
      this.curveEquipmentChart.data[this.traces.system].y.push(coordinate.y);


      let hoverText = `System Curve Flow: ${coordinate.x} (${this.settings.flowMeasurement})<br>System Curve ${this.yName}: ${coordinate.y.toFixed(2)} (${this.settings.distanceMeasurement})<br> Fluid Power: ${coordinate.fluidPower.toFixed(2)} (${this.settings.powerMeasurement})<br>`;
      this.hoverData.push(hoverText);
    });

    let systemHover = `System Curve Flow: %{x:.2r} (${this.settings.flowMeasurement})<br>System Curve ${this.yName}: %{y:.2r} (${this.settings.distanceMeasurement})<br>`
    this.curveEquipmentChart.data[this.traces.system].hovertemplate = systemHover;
  }

  drawBaselineEquipmentCurve(baselineTraceData: Array<DataPoint>) {
    baselineTraceData.forEach((coordinate, index) => {
      this.curveEquipmentChart.data[this.traces.baseline].x.push(coordinate.x);
      this.curveEquipmentChart.data[this.traces.baseline].y.push(coordinate.y);
      let hoverText = `Base Flow: ${coordinate.x} (${this.settings.flowMeasurement})<br>Base ${this.yName}: ${coordinate.y.toFixed(2)}  (${this.settings.distanceMeasurement})<br>`;
      if (this.isSystemCurveShown) {
        this.hoverData[index] += hoverText;
      } else {
        this.hoverData.push(hoverText);
      }
      
    });
    this.curveEquipmentChart.data[this.traces.baseline].line.color = this.pointColors[0];
    let baselineHover = `Base Flow: %{x:.2r} (${this.settings.flowMeasurement})<br>Base ${this.yName}: %{y:.2r} (${this.settings.distanceMeasurement})<br>`
    this.curveEquipmentChart.data[this.traces.baseline].hovertemplate = baselineHover;
  }

  drawModificationEquipmentCurve(modificationTraceData: Array<DataPoint>) {
    modificationTraceData.forEach((coordinate, index) => {
      this.curveEquipmentChart.data[this.traces.modification].x.push(coordinate.x);
      this.curveEquipmentChart.data[this.traces.modification].y.push(coordinate.y);
      this.curveEquipmentChart.data[this.traces.modification].line.color = this.pointColors[1];

      let hoverText = `Modification Flow: ${coordinate.x} (${this.settings.flowMeasurement})<br>Modification ${this.yName}: ${coordinate.y.toFixed(2)}  (${this.settings.distanceMeasurement})<br>`;
      this.hoverData[index] += hoverText;
      this.hoverData.push(hoverText);

    });
    let modificationHover = `Modification Flow: %{x:.2r} (${this.settings.flowMeasurement})<br>Modification ${this.yName}: %{y:.2r} (${this.settings.distanceMeasurement})<br>`
    this.curveEquipmentChart.data[this.traces.modification].hovertemplate = modificationHover;
  }

  addIntersectionPoints() {
    let baselineIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs, this.systemAndEquipmentCurveService.systemCurveRegressionData);
    if (baselineIntersectionPoint != undefined) {
      this.setIntersectionTrace(baselineIntersectionPoint, this.traces.baselineIntersect);
      this.updatedTraces.push(this.traces.baselineIntersect);
      this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.next(baselineIntersectionPoint);
    }
    if (this.isEquipmentModificationShown && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
      let modifiedIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getModifiedIntersectionPoint(baselineIntersectionPoint, this.settings, this.equipmentType, this.systemAndEquipmentCurveService.equipmentInputs.getValue());
      if (modifiedIntersectionPoint != undefined) {
        this.setIntersectionTrace(modifiedIntersectionPoint, this.traces.modificationIntersect);
        this.updatedTraces.push(this.traces.modificationIntersect);
        this.systemAndEquipmentCurveGraphService.modificationIntersectionPoint.next(modifiedIntersectionPoint);
      }
    }
  }

  initHoverGroup(hoverData) {
    let isOnTrace: boolean = hoverData && hoverData.points && hoverData.points.length > 0 && hoverData.points[0].curveNumber == this.traces.baseline || hoverData.points[0].curveNumber == this.traces.system;
    let currentPointIndex = hoverData.points[0].pointIndex;

    // TODO FIX these conditions prevent RangeError Exception when hover is triggered out of bounds
    let inPlotCanvas = currentPointIndex - 1 <= this.curveEquipmentChart.data[this.traces.baseline].x.length 
                      && currentPointIndex > 1 && currentPointIndex < 101;

    if (isOnTrace && inPlotCanvas) {
      let systemX = this.curveEquipmentChart.data[this.traces.system].x;
      let systemY = this.curveEquipmentChart.data[this.traces.system].y;

      let baselineX = this.curveEquipmentChart.data[this.traces.baseline].x;
      let baselineY = this.curveEquipmentChart.data[this.traces.baseline].y;
      
      // TODO These hoverGroupData names should be interchangable pumps/fans
      let hoverGroupData: HoverGroupData = {
        system: {
          x: Number(systemX[currentPointIndex]),
          y: Number(systemY[currentPointIndex])
        },
        baseline: {
          x: Number(baselineX[currentPointIndex]),
          y: Number(baselineY[currentPointIndex])
        },
      }

      this.setHoverPointTrace(hoverGroupData, hoverData.points[0].curveNumber);
      this.setHoverGroupTemplate(currentPointIndex);
      let updateIndices = [this.traces.systemHover, this.traces.baselineHover];
      this.updateChart(updateIndices);
    }
  }

  removeHoverGroup() {
    this.removeHoverPointTrace();
    let updateIndices = [this.traces.systemHover, this.traces.baselineHover];
    this.updateChart(updateIndices);
  }

  setHoverPointTrace(hoverGroupData: HoverGroupData, curveNumber) {
    if (curveNumber == this.traces.system) {
      let baselineHoverTrace: TraceData = this.curveEquipmentChart.data[this.traces.baselineHover];
      baselineHoverTrace.x = [hoverGroupData.baseline.x];
      baselineHoverTrace.y = [hoverGroupData.baseline.y];
      this.curveEquipmentChart.data[this.traces.baselineHover] = baselineHoverTrace;
    }
    else if (curveNumber == this.traces.baseline) {
      let systemHoverTrace: TraceData = this.curveEquipmentChart.data[this.traces.systemHover];
      systemHoverTrace.x = [hoverGroupData.system.x];
      systemHoverTrace.y = [hoverGroupData.system.y];
      this.curveEquipmentChart.data[this.traces.systemHover] = systemHoverTrace;
    }
  }

  setHoverGroupTemplate(pointIndex: number) {
    let hoverGroupText = this.hoverData[pointIndex];
    let systemTrace = this.curveEquipmentChart.data[this.traces.system];
    systemTrace.hovertemplate = hoverGroupText;

    let baselineTrace = this.curveEquipmentChart.data[this.traces.baseline];
    baselineTrace.hovertemplate = hoverGroupText;

  }

  removeHoverPointTrace() {
    let systemHoverTrace: TraceData = this.curveEquipmentChart.data[this.traces['systemHover']];
    let baselineHoverTrace: TraceData = this.curveEquipmentChart.data[this.traces['baselineHover']];

    systemHoverTrace.x = [];
    systemHoverTrace.y = [];
    baselineHoverTrace.x = [];
    baselineHoverTrace.y = [];

    this.curveEquipmentChart.data[this.traces['systemHover']] = systemHoverTrace;
    this.curveEquipmentChart.data[this.traces['baselineHover']] = baselineHoverTrace;
  }

  setIntersectionTrace(point: DataPoint, traceDataIndex: number) {
    let intersectionTrace = this.curveEquipmentChart.data[traceDataIndex];
    intersectionTrace.x = [point.x];
    intersectionTrace.y = [point.y];
    this.curveEquipmentChart.data[traceDataIndex] = intersectionTrace;
  }

  // createSelectedDataPoints(graphData) {
  //   let dataPoints: DataPoint[] = this.getCurrentPoints(true, graphData.points[0].x);
    
  //   dataPoints.forEach((point, i) => {
  //     let selectedPoint: SelectedDataPoint = {
  //       pointColor: this.pointColors[(this.curveEquipmentChart.data.length + 1) % this.pointColors.length],
  //       pointX: point.x,
  //       pointY: point.y
  //     }
  //     let selectedPointTrace = this.systemAndEquipmentCurveGraphService.getTraceDataFromPoint(selectedPoint);
  //     let yMeasureTitle = i == 0? 'Maximum' : 'Average';
  //     let hoverTemplate = 'Flow Rate' + ': %{x} <br>' + yMeasureTitle + ': %{y:.2r}% <br>' + '';
  //     selectedPointTrace.hovertemplate = hoverTemplate;

  //     Plotly.addTraces(this.currentChartId, selectedPointTrace);
  //     this.selectedDataPoints.push(selectedPoint);
  //   });
    
  //   this.cd.detectChanges();
  //   this.save();
  // }

  // deleteDataPoint(point: SelectedDataPoint) {
  //   let traceCount: number = this.curveEquipmentChart.data.length;
  //   let deleteTraceIndex: number = this.curveEquipmentChart.data.findIndex(trace => trace.x[0] == point.pointX && trace.y[0] == point.pointY);
    
  //   // ignore default traces
  //   if (traceCount > this.defaultTraceCount && deleteTraceIndex != -1) {
  //     Plotly.deleteTraces(this.currentChartId, [deleteTraceIndex]);
  //     this.selectedDataPoints.splice(deleteTraceIndex - this.defaultTraceCount, 1);
  //     this.cd.detectChanges();
  //     this.save();
  //   }
  // }


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
    let showingGridX: boolean = this.curveEquipmentChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.curveEquipmentChart.layout.yaxis.showgrid;
    this.curveEquipmentChart.layout.xaxis.showgrid = !showingGridX;
    this.curveEquipmentChart.layout.yaxis.showgrid = !showingGridY;
    // this.updateChart();
  }

}
