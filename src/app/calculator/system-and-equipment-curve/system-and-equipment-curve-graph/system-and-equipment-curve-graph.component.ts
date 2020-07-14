import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import * as Plotly from 'plotly.js';
import { DataPoint, SimpleChart, ChartConfig } from '../../../shared/models/plotting';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { SystemAndEquipmentCurveGraphService, HoverGroupData } from './system-and-equipment-curve-graph.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { CurveDataService } from '../curve-data.service';

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
  
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }
  updateGraphSub: Subscription;
  resetSub: Subscription;
  generateExampleSub: Subscription;
  ignoreReset: boolean = false;
  
  // Tooltips
  firstChange: boolean = true;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;
  createGraphTimer: NodeJS.Timeout;

  // Graphing
  selectedDataPoints: Array<DataPoint>;
  userDataPoints: Array<DataPoint> = [];
  pointColors: Array<string>;
  curveEquipmentChart: SimpleChart;
  currentHoverData: HoverGroupData;
  chartConfig: ChartConfig = {
    defaultPointCount: 0,
    defaultPointOutlineColor: 'rgba(0, 0, 0, .6)',
    defaultPointBackgroundColor: 'rgba(0, 0, 0, 0)',
    yName: 'Pressure',
    yUnits: '',
    xUnits: ''
  };

  // Default traces
  traces = {
    'system': 0,
    'baseline': 1,
    'baselineIntersect': 2,
    'modification': 3,
    'modificationIntersect': 4,
  };

  // Update conditions/data
  isSystemCurveShown: boolean;
  isEquipmentCurveShown: boolean;
  isEquipmentModificationShown: boolean;
  isChartSetup: boolean = false;
  fluidPowerData: Array<number>;
  showHoverGroupData: boolean;

  constructor(
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private curveDataService: CurveDataService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.setChartUnits();
    // Force resize during tab change
    this.triggerInitialResize();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.updateGraphSub = this.systemAndEquipmentCurveService.updateGraph.subscribe(updateGraph => {
      if (updateGraph == true) {
        if (this.createGraphTimer != undefined) {
          clearTimeout(this.createGraphTimer);
        }
        this.createGraphTimer = setTimeout(() => {
          if (this.isChartSetup) {
            this.updateChart();
          } else {
            this.initRenderChart();
          }
        }, 100);
        this.systemAndEquipmentCurveService.updateGraph.next(false);
      }
    });
    
    // btnGenerateExample() emits both reset and updateGraph subjects
    // This causes jumping graph visuals - ignore reset if also generateExample
    this.generateExampleSub = this.curveDataService.generateExample.subscribe(example => {
      if (example) {
        this.ignoreReset = true;
      }
    });

    this.resetSub = this.curveDataService.resetForms.subscribe(reset => {
      if (reset && !this.ignoreReset) {
        this.systemAndEquipmentCurveGraphService.initChartData();
        this.initRenderChart();
      }
      this.ignoreReset = false;
    });
  }

  ngOnDestroy() {
    this.updateGraphSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.resetSub.unsubscribe();
  }

  setDisplayDataOptions() {
    this.isSystemCurveShown = (this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'open');
    this.isEquipmentCurveShown = (this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open');
    if (this.isEquipmentCurveShown && this.systemAndEquipmentCurveService.equipmentInputs.getValue() != undefined) {
      this.isEquipmentModificationShown = this.systemAndEquipmentCurveService.equipmentInputs.getValue().baselineMeasurement != this.systemAndEquipmentCurveService.equipmentInputs.getValue().modifiedMeasurement;
    } else {
      this.isEquipmentModificationShown = false;
    }
  }

  setChartUnits() {
    if (this.equipmentType == 'pump') {
      this.chartConfig.yName = 'Head';
      this.chartConfig.yUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.distanceMeasurement);
      this.chartConfig.xUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.flowMeasurement);
    } else {
      this.chartConfig.yUnits = this.settings.fanPressureMeasurement;
      this.chartConfig.xUnits = this.settings.fanFlowRate;
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
      this.initRenderChart(true);
    }
  }

  save() {
    this.systemAndEquipmentCurveGraphService.curveEquipmentChart.next(this.curveEquipmentChart);
    this.systemAndEquipmentCurveGraphService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart(isResize = false) {
    Plotly.purge(this.currentChartId);

    this.setDisplayDataOptions();
    this.initChartSetup(isResize);
    this.drawTraceData();

    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));
    Plotly.newPlot(this.currentChartId, this.curveEquipmentChart.data, chartLayout, this.curveEquipmentChart.config)
      .then(chart => {
        chart.on('plotly_click', (graphData) => {
          this.createDataPoint(graphData);
        });
          chart.on('plotly_hover', hoverData => {
            if (hoverData.points[0].pointIndex != 0 && this.showHoverGroupData) {
                this.initHoverGroupData(hoverData);
            }
          });
          chart.on('plotly_unhover', unhoverData => {
            if (this.showHoverGroupData) {
              this.removeHoverGroupData();
            }
          });
    });
    this.save();
  }

  updateChart() {
    this.setDisplayDataOptions();
    this.drawTraceData();
    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));
    Plotly.update(this.currentChartId, this.curveEquipmentChart.data, chartLayout);
  }

  initChartSetup(isResize) {
    this.showHoverGroupData = false;
    this.pointColors = graphColors;
    this.currentHoverData = undefined;
    this.fluidPowerData = [];

    if (this.curveEquipmentChart && !isResize) {
      this.systemAndEquipmentCurveGraphService.initChartData();
    }

    let currentChart = this.systemAndEquipmentCurveGraphService.curveEquipmentChart.getValue();
    if (currentChart.currentEquipmentType != this.equipmentType) {
      this.systemAndEquipmentCurveGraphService.initChartData();
      this.curveEquipmentChart = this.systemAndEquipmentCurveGraphService.curveEquipmentChart.getValue();
      this.curveEquipmentChart.currentEquipmentType = this.equipmentType;
      this.systemAndEquipmentCurveGraphService.curveEquipmentChart.next(this.curveEquipmentChart);
    } else {
      this.curveEquipmentChart = currentChart;
    }

    this.selectedDataPoints = this.systemAndEquipmentCurveGraphService.selectedDataPoints.getValue();
    this.curveEquipmentChart.layout.xaxis.title.text = `Flow (${this.chartConfig.xUnits})`;
    this.curveEquipmentChart.layout.yaxis.title.text = `${this.chartConfig.yName} (${this.chartConfig.yUnits})`;
    this.isChartSetup = true;
  }

  drawTraceData() {
    if (this.isSystemCurveShown == true && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
      this.showHoverGroupData = true;
      this.drawSystemCurve();
    } 
    if (this.isEquipmentCurveShown == true) {
      if (this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
        this.drawEquipmentCurve(this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs, this.traces.baseline, 'Baseline');
        if (this.isEquipmentModificationShown == true) {
          this.drawEquipmentCurve(this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs, this.traces.modification, 'Modification');
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
    let xTmp = [];
    let yTmp = [];
    let fluidTmp = [];

    curveTraceData.forEach(coordinate => {
      xTmp.push(Math.round(coordinate.x));
      yTmp.push(Math.round(coordinate.y));
      fluidTmp.push(coordinate.fluidPower);
    });
    this.curveEquipmentChart.data[this.traces.system].x = xTmp;
    this.curveEquipmentChart.data[this.traces.system].y = yTmp;
    this.fluidPowerData = fluidTmp;
    this.setHoverTemplate('System Curve', this.traces.system);
  }

  drawEquipmentCurve(traceData: Array<DataPoint>, traceIndex: number, traceTitle: string) {
    let xTmp = [];
    let yTmp = [];
    traceData.forEach(coordinate => {
      xTmp.push(Math.round(coordinate.x));
      yTmp.push(Math.round(coordinate.y));
    });
    this.curveEquipmentChart.data[traceIndex].x = xTmp;
    this.curveEquipmentChart.data[traceIndex].y = yTmp;
    this.curveEquipmentChart.data[traceIndex].line.color = this.pointColors[traceIndex - 1];
    this.setHoverTemplate(traceTitle, traceIndex);
  }

  setHoverTemplate(traceTitle: string, traceIndex) {
    let template = `${traceTitle}<br>Flow: %{x} ${this.chartConfig.xUnits}<br>${this.chartConfig.yName}: %{y} ${this.chartConfig.yUnits}<br>`;
    this.curveEquipmentChart.data[traceIndex].hovertemplate = template;
  }

  addIntersectionPoints() {
    let baselineIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs, this.systemAndEquipmentCurveService.systemCurveRegressionData);
    if (baselineIntersectionPoint != undefined) {
      this.chartConfig.defaultPointCount = 1;
      this.setIntersectionTrace(baselineIntersectionPoint, this.traces.baselineIntersect, 'Baseline');
      this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.next(baselineIntersectionPoint);
    }
    if (this.isEquipmentModificationShown && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
      let modifiedIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getModifiedIntersectionPoint(baselineIntersectionPoint, this.settings, this.equipmentType, this.systemAndEquipmentCurveService.equipmentInputs.getValue());
      if (modifiedIntersectionPoint != undefined) {
        this.chartConfig.defaultPointCount = 2;
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
        x: Number(systemX[currentPointIndex]),
        y: Number(systemY[currentPointIndex]),
        pointColor: 'red'
      },
      baseline: {
        x: Number(baselineX[currentPointIndex]),
        y: Number(baselineY[currentPointIndex]),
        pointColor: this.pointColors[this.traces.baseline - 1]
      },
      fluidPower: this.fluidPowerData[currentPointIndex]
    };

    if (this.isEquipmentModificationShown) {
      let modificationX = this.curveEquipmentChart.data[this.traces.modification].x;
      let modificationY = this.curveEquipmentChart.data[this.traces.modification].y;
      this.currentHoverData.modification = {
        x: Number(modificationX[currentPointIndex]),
        y: Number(modificationY[currentPointIndex]),
        pointColor: this.pointColors[this.traces.modification - 1]
      };
    }
    this.cd.detectChanges();
  }

  removeHoverGroupData() {
    this.currentHoverData = {
      system: {
        x: 0,
        y: 0,
        pointColor: ''
      },
      baseline: {
        x: 0,
        y: 0,
        pointColor: ''
      },
      fluidPower: 0
    };

    if (this.isEquipmentModificationShown) {
      this.currentHoverData.modification = {
        x: 0,
        y: 0,
        pointColor: ''
      }
    }
    this.cd.detectChanges();
  }

  setIntersectionTrace(point: DataPoint, traceDataIndex: number, name: string) {
    let intersectionTrace = this.curveEquipmentChart.data[traceDataIndex];
    intersectionTrace.x = [Math.round(point.x)];
    intersectionTrace.y = [Math.round(point.y)];
    intersectionTrace.hovertemplate = `${name} Intersection<br>Flow: %{x} ${this.chartConfig.xUnits}<br>${this.chartConfig.yName}: %{y} ${this.chartConfig.yUnits}`;
    
    this.curveEquipmentChart.data[traceDataIndex] = intersectionTrace;

    let selectedPoint: DataPoint = {
      pointColor: this.chartConfig.defaultPointBackgroundColor,
      pointOutlineColor: this.chartConfig.defaultPointOutlineColor,
      pointTraceIndex: traceDataIndex,
      x: point.x,
      y: point.y
    }

    let updatedPoint = false;
    this.selectedDataPoints.forEach(point => {
      if (point.pointTraceIndex == traceDataIndex) {
        point = selectedPoint;
        updatedPoint = true;
      }
    });
    if (!updatedPoint) {
      if (name == 'Modification') {
        this.selectedDataPoints.splice(1, 0, selectedPoint);
      } else {
        this.selectedDataPoints.push(selectedPoint);
      }
    }
    this.cd.detectChanges();
    this.save();
  }

  createDataPoint(graphData, existingPoint?: DataPoint) {
    let selectedPoint = existingPoint;
    if (!selectedPoint) {
      selectedPoint = {
        pointColor: this.getNextColor(),
        x: graphData.points[0].x,
        y: graphData.points[0].y
      }
    }
    let selectedPointTrace = this.systemAndEquipmentCurveGraphService.getTraceDataFromPoint(selectedPoint);
    let hoverTemplate = `Flow: ${selectedPoint.x} ${this.chartConfig.xUnits}<br>${this.chartConfig.yName}: ${selectedPoint.y}  ${this.chartConfig.yUnits}<br>`;
    selectedPointTrace.hovertemplate = hoverTemplate;

    Plotly.addTraces(this.currentChartId, selectedPointTrace);
    this.selectedDataPoints.push(selectedPoint);
    
    this.cd.detectChanges();
    this.save();
  }

  deleteDataPoint(point: DataPoint, index: number) {
    let traceCount: number = this.curveEquipmentChart.data.length;
    let deleteTraceIndex: number = this.curveEquipmentChart.data.findIndex(trace => trace.x[0] == point.x && trace.y[0] == point.y);
    // ignore default traces
    if (traceCount > this.chartConfig.defaultPointCount && deleteTraceIndex != -1) {
      Plotly.deleteTraces(this.currentChartId, [deleteTraceIndex]);
      this.selectedDataPoints.splice(index, 1);
      this.cd.detectChanges();
      this.save();
    }
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

  getNextColor(): string {
    return this.pointColors[(this.curveEquipmentChart.data.length + 1) % this.pointColors.length];
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

