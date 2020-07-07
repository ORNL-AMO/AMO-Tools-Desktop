import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import * as Plotly from 'plotly.js';
import { SelectedDataPoint, SimpleChart, TraceData, DataPoint } from '../../../shared/models/plotting';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';

interface HoverGroupData {
  baseline: SelectedDataPoint,
  modification?: SelectedDataPoint,
  system: SelectedDataPoint,
  fluidPower?: number
};

interface HoverPoint extends DataPoint {
  color: string;
}

@Component({
  selector: 'app-system-and-equipment-curve-graph',
  templateUrl: './system-and-equipment-curve-graph.component.html',
  styleUrls: ['./system-and-equipment-curve-graph.component.css']
})
export class SystemAndEquipmentCurveGraphComponent implements OnInit {
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
  hasHoverGroupData: boolean;
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
  userDataPoints: Array<SelectedDataPoint> = [];
  pointColors: Array<string>;
  curveEquipmentChart: SimpleChart;
  currentHoverData: HoverGroupData;
  
  // Default traces
  defaultPointCount: number = 0;
  defaultTraceOutlineColor = 'rgba(0, 0, 0, .6)';
  defaultTraceBackground = 'rgba(0, 0, 0, 0)';
  defaultTraceChanges: boolean;
  traces = {
    'system': 0,
    'baseline': 1,
    'baselineIntersect': 2,
    'modification': 3,
    'modificationIntersect': 4,
    'systemHover': 5,
    'baselineHover': 6,
    'modificationHover': 7,
  };
  yName: string = 'Pressure';
  yUnits: string = '';
  xUnits: string = '';

  // Update conditions/data
  isSystemCurveShown: boolean;
  isEquipmentCurveShown: boolean;
  isEquipmentModificationShown: boolean;
  chartSetup: boolean = false;
  updatedTraces: Array<number> = [];
  fluidPowerData: Array<number>;


  constructor(
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {    
    this.setChartUnits();
    this.triggerInitialResize();
    this.updateGraphSub = this.systemAndEquipmentCurveService.updateGraph.subscribe(val => {
      if (val == true) {
        this.isSystemCurveShown = (this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'open');
        this.isEquipmentCurveShown = (this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open');
        this.setIsModificationShown();

        if (this.createGraphTimer != undefined) {
          clearTimeout(this.createGraphTimer);
        }
        this.createGraphTimer = setTimeout(() => {
          // this.initRenderChart();
          
          // If below logic is used - when adding a user selectedDataPoint - the chart draws a new 
          // baseline, even though this code is never visibly executed. ???
          if (this.chartSetup) {
            this.updateChart();
          } else {
            this.initRenderChart();
          }

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

  setChartUnits() {
    if (this.equipmentType == 'pump') {
      this.yName = 'Head';
      this.yUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.distanceMeasurement);
      this.xUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.flowMeasurement);
    } else {
      this.yUnits = this.settings.fanPressureMeasurement;
      this.xUnits = this.settings.fanFlowRate;
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
      this.initRenderChart();
    }
  }

  save() {
    this.systemAndEquipmentCurveGraphService.curveEquipmentChart.next(this.curveEquipmentChart);
    this.systemAndEquipmentCurveGraphService.selectedDataPoints.next(this.selectedDataPoints);
    console.log('chart', this.curveEquipmentChart);
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    this.initChartSetup();
    this.drawTraceData();

    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));
    Plotly.newPlot(this.currentChartId, this.curveEquipmentChart.data, chartLayout, this.curveEquipmentChart.config)
      .then(chart => {
        chart.on('plotly_click', (graphData) => {
          this.createSelectedDataPoint(graphData);
        });
        if (this.hasHoverGroupData) {
          chart.on('plotly_hover', hoverData => {
            if (hoverData.points[0].pointIndex != 0) {
              this.initHoverGroupData(hoverData);
            }
          });
          chart.on('plotly_unhover', unhoverData => {
            this.removeHoverGroupData();
          });
        }
    });

    // If we re-render every time
    // Calls addTraces - must be used after Plotly graphdata/plot exists
    // if(this.userDataPoints && this.userDataPoints.length > 0) {
    //   this.userDataPoints.forEach(selectedPoint => {
    //     this.createSelectedDataPoint(undefined, selectedPoint);
    //   })
    // }

    this.save();
  }

  updateChart() {
    this.drawTraceData();
    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));
    Plotly.update(this.currentChartId, this.curveEquipmentChart.data, chartLayout, [0,1,2,3,4]);
  }

  initChartSetup() {
    this.hasHoverGroupData = false;
    this.pointColors = graphColors;
    this.currentHoverData = undefined;
    this.fluidPowerData = [];

    // Trace data only updated if '..Shown' bools met - Get empty chart every render
    this.systemAndEquipmentCurveGraphService.initChartData();
    this.curveEquipmentChart = this.systemAndEquipmentCurveGraphService.curveEquipmentChart.getValue();

    // Track existing user points if we have to re-render every time
    // if (this.selectedDataPoints && this.selectedDataPoints.length > this.defaultPointCount) {
    //   this.userDataPoints = this.selectedDataPoints.slice(this.defaultPointCount);
    // }
    this.selectedDataPoints = this.systemAndEquipmentCurveGraphService.selectedDataPoints.getValue();

    this.curveEquipmentChart.layout.xaxis.title.text = `Flow (${this.xUnits})`;
    this.curveEquipmentChart.layout.yaxis.title.text = `${this.yName} (${this.yUnits})`;
    
    this.chartSetup = true;
  }

  drawTraceData() {
    if (this.isSystemCurveShown == true && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
      this.hasHoverGroupData = true;
      this.drawSystemCurve();
    }
    if (this.isEquipmentCurveShown == true) {
      if (this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
        this.drawBaselineEquipmentCurve(this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs);
        
        if (this.isEquipmentModificationShown == true) {
          this.drawModificationEquipmentCurve(this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs);
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
    curveTraceData.forEach(coordinate => {
      this.curveEquipmentChart.data[this.traces.system].x.push(Math.round(coordinate.x));
      this.curveEquipmentChart.data[this.traces.system].y.push(Math.round(coordinate.y));
      this.fluidPowerData.push(coordinate.fluidPower);
    });
    this.setHoverTemplate('System Curve', this.traces.system);
  }

  setHoverTemplate(traceTitle: string, traceIndex) {
    // let template = `${traceTitle}<br>Flow: %{x} (${this.xUnits})<br>${this.yName}: %{y} (${this.yUnits})<br>`;
    let template = `${traceTitle}<br>Flow: %{x} ${this.xUnits}<br>${this.yName}: %{y} ${this.yUnits}<br>`;
    this.curveEquipmentChart.data[traceIndex].hovertemplate = template;
  }

  drawBaselineEquipmentCurve(baselineTraceData: Array<DataPoint>) {
    baselineTraceData.forEach(coordinate => {
      this.curveEquipmentChart.data[this.traces.baseline].x.push(Math.round(coordinate.x));
      this.curveEquipmentChart.data[this.traces.baseline].y.push(Math.round(coordinate.y));
    });
    this.curveEquipmentChart.data[this.traces.baseline].line.color = this.pointColors[0];
    this.setHoverTemplate('Baseline', this.traces.baseline);
  }

  drawModificationEquipmentCurve(modificationTraceData: Array<DataPoint>) {
    modificationTraceData.forEach(coordinate => {
      this.curveEquipmentChart.data[this.traces.modification].x.push(Math.round(coordinate.x));
      this.curveEquipmentChart.data[this.traces.modification].y.push(Math.round(coordinate.y));
    });
    this.curveEquipmentChart.data[this.traces.modification].line.color = this.pointColors[1];
    this.setHoverTemplate('Modification', this.traces.modification);
  }

  addIntersectionPoints() {
    let baselineIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs, this.systemAndEquipmentCurveService.systemCurveRegressionData);
    if (baselineIntersectionPoint != undefined) {
      this.defaultPointCount = 1;
      this.setIntersectionTrace(baselineIntersectionPoint, this.traces.baselineIntersect, 'Baseline');
      this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.next(baselineIntersectionPoint);
    }
    if (this.isEquipmentModificationShown && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
      let modifiedIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getModifiedIntersectionPoint(baselineIntersectionPoint, this.settings, this.equipmentType, this.systemAndEquipmentCurveService.equipmentInputs.getValue());
      if (modifiedIntersectionPoint != undefined) {
        this.defaultPointCount = 2;
        this.setIntersectionTrace(modifiedIntersectionPoint, this.traces.modificationIntersect, 'Modification');
        this.systemAndEquipmentCurveGraphService.modificationIntersectionPoint.next(modifiedIntersectionPoint);
      }
    }
  }

  initHoverGroupData(hoverEventData) {
    let currentPointIndex = hoverEventData.points[0].pointIndex;

    let systemX = this.curveEquipmentChart.data[this.traces.system].x;
    let systemY = this.curveEquipmentChart.data[this.traces.system].y;
    let baselineX = this.curveEquipmentChart.data[this.traces.baseline].x;
    let baselineY = this.curveEquipmentChart.data[this.traces.baseline].y;

    this.currentHoverData = {
      system: {
        pointX: Number(systemX[currentPointIndex]),
        pointY: Number(systemY[currentPointIndex]),
        pointColor: 'red'
      },
      baseline: {
        pointX: Number(baselineX[currentPointIndex]),
        pointY: Number(baselineY[currentPointIndex]),
        pointColor: this.pointColors[0]
      },
      fluidPower: this.fluidPowerData[currentPointIndex]
    };

    if (this.isEquipmentModificationShown) {
      let modificationX = this.curveEquipmentChart.data[this.traces.modification].x;
      let modificationY = this.curveEquipmentChart.data[this.traces.modification].y;
      this.currentHoverData.modification = {
        pointX: Number(modificationX[currentPointIndex]),
        pointY: Number(modificationY[currentPointIndex]),
        pointColor: this.pointColors[1]
      };
    }

    this.cd.detectChanges();
  }

  removeHoverGroupData() {
    this.currentHoverData = {
      system: {
        pointX: 0,
        pointY: 0,
        pointColor: ''
      },
      baseline: {
        pointX: 0,
        pointY: 0,
        pointColor: ''
      },
      fluidPower: 0
    };

    if (this.isEquipmentModificationShown) {
      this.currentHoverData.modification = {
        pointX: 0,
        pointY: 0,
        pointColor: ''
      }
    }
    this.cd.detectChanges();
  }

  removeHoverPointTrace() {
    let systemHoverTrace: TraceData = this.curveEquipmentChart.data[this.traces['systemHover']];
    let baselineHoverTrace: TraceData = this.curveEquipmentChart.data[this.traces['baselineHover']];
    let modificationHoverTrace: TraceData = this.curveEquipmentChart.data[this.traces['modificationHover']];

    systemHoverTrace.x = [];
    systemHoverTrace.y = [];
    baselineHoverTrace.x = [];
    baselineHoverTrace.y = [];
    modificationHoverTrace.x = [];
    modificationHoverTrace.y = [];

    this.curveEquipmentChart.data[this.traces['systemHover']] = systemHoverTrace;
    this.curveEquipmentChart.data[this.traces['baselineHover']] = baselineHoverTrace;
    this.curveEquipmentChart.data[this.traces['modificationHover']] = modificationHoverTrace;
  }

  setIntersectionTrace(point: DataPoint, traceDataIndex: number, name: string) {
    let intersectionTrace = this.curveEquipmentChart.data[traceDataIndex];
    intersectionTrace.x = [Math.round(point.x)];
    intersectionTrace.y = [Math.round(point.y)];
    intersectionTrace.hovertemplate = `${name} Intersection<br>Flow: %{x} ${this.xUnits}<br>${this.yName}: %{y} ${this.yUnits}`;
    
    this.curveEquipmentChart.data[traceDataIndex] = intersectionTrace;

    let selectedPoint: SelectedDataPoint = {
      pointColor: this.pointColors[(this.curveEquipmentChart.data.length + 1) % this.pointColors.length],
      pointX: point.x,
      pointY: point.y
    }

    this.selectedDataPoints.push(selectedPoint);
    this.cd.detectChanges();
    this.save();
  }

  createSelectedDataPoint(graphData, existingPoint?: SelectedDataPoint) {
    let selectedPoint = existingPoint;
    if (!selectedPoint) {
      selectedPoint = {
        pointColor: this.pointColors[(this.curveEquipmentChart.data.length + 1) % this.pointColors.length],
        pointX: graphData.points[0].x,
        pointY: graphData.points[0].y
      }
    }
    let selectedPointTrace = this.systemAndEquipmentCurveGraphService.getTraceDataFromPoint(selectedPoint);
    let hoverTemplate = `Flow: ${selectedPoint.pointX} ${this.xUnits}<br>${this.yName}: ${selectedPoint.pointY}  ${this.yUnits}<br>`;
    selectedPointTrace.hovertemplate = hoverTemplate;

    Plotly.addTraces(this.currentChartId, selectedPointTrace);
    this.selectedDataPoints.push(selectedPoint);
    
    this.cd.detectChanges();
    this.save();
  }

  deleteDataPoint(point: SelectedDataPoint, index: number) {
    let traceCount: number = this.curveEquipmentChart.data.length;
    let deleteTraceIndex: number = this.curveEquipmentChart.data.findIndex(trace => trace.x[0] == point.pointX && trace.y[0] == point.pointY);
    // ignore default traces
    if (traceCount > this.defaultPointCount && deleteTraceIndex != -1) {
      Plotly.deleteTraces(this.currentChartId, [deleteTraceIndex]);
      this.selectedDataPoints.splice(index, 1);
      this.cd.detectChanges();
      this.save();
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
    let showingGridX: boolean = this.curveEquipmentChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.curveEquipmentChart.layout.yaxis.showgrid;
    this.curveEquipmentChart.layout.xaxis.showgrid = !showingGridX;
    this.curveEquipmentChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }

}

