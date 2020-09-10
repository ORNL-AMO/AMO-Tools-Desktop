import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import * as Plotly from 'plotly.js';
import { SimpleChart, ChartConfig } from '../../../shared/models/plotting';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { SystemAndEquipmentCurveGraphService, HoverGroupData, SystemCurveDataPoint } from './system-and-equipment-curve-graph.service';
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
  systemPanelChartId: string = 'systemPanelChartDiv';
  expandedSystemChartId: string = 'expandedSystemChartDiv';
  currentSystemChartId: string = 'systemPanelChartDiv';

  powerPanelChartId: string = 'powerPanelChartDiv';
  expandedPowerChartId: string = 'expandedPowerChartDiv';
  currentPowerChartId: string = 'powerPanelChartDiv';
  powerUnits: string;
  
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  // @HostListener('resize', ['$event'])
  // resizeCurveEquipmentChart(event) {
  //   Plotly.Plots.resize(this.currentSystemChartId);
  // }

  // @HostListener('document:keyup', ['$event'])
  // resizePowerChart(event) {
  //   Plotly.Plots.resize(this.currentPowerChartId);
  // }


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
  powerExpanded: boolean = false;
  createGraphTimer: NodeJS.Timeout;

  // Graphing
  selectedDataPoints: Array<SystemCurveDataPoint>;
  userDataPoints: Array <SystemCurveDataPoint> = [];
  pointColors: Array<string>;
  curveEquipmentChart: SimpleChart;
  powerChart: SimpleChart;
  currentHoverData: HoverGroupData;
  chartConfig: ChartConfig = {
    defaultPointCount: 0,
    defaultPointOutlineColor: 'rgba(0, 0, 0, .6)',
    defaultPointBackgroundColor: 'rgba(0, 0, 0, 0)',
    yName: 'Pressure',
    yUnits: '',
    xUnits: '',
    powerUnits: '',
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
  displayPowerChart: boolean = false;
  fluidPowerData: Array<number>;

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

  // ngAfterViewInit() {
  //   this.setGraphSize();
  //   this.updateGraphSub = this.systemAndEquipmentCurveService.updateGraph.subscribe(val => {
  //     if (val == true) {
  //       this.isSystemCurveShown = (this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'open');
  //       this.isEquipmentCurveShown = (this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open');
  //       this.isEquipmentModificationShown = (this.systemAndEquipmentCurveService.pumpModificationCollapsed.getValue() == 'open' || this.systemAndEquipmentCurveService.fanModificationCollapsed.getValue() == 'open');
  //       this.createSVG();
  //       this.setAxisLabels();
  //       this.setAxis();
  //       this.createGraph();
  //     }

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
        this.displayPowerChart = false;
        this.curveEquipmentChart.layout.xaxis.title.text = `Flow (${this.chartConfig.xUnits})`;
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
      this.chartConfig.powerUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.powerMeasurement);
    } else {
      this.chartConfig.yUnits = this.settings.fanPressureMeasurement;
      this.chartConfig.xUnits = this.settings.fanFlowRate;
      this.chartConfig.powerUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanPowerMeasurement);
    }
  }

  resetHoverData() {
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
      modification: {
        x: 0,
        y: 0,
        pointColor: ''
      },
      fluidPower: 0
    };
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      this.initRenderChart(true);
    }, 25)
  }

  resizeGraph() {
    let expandedChart = this.ngChartContainer.nativeElement;
    if (expandedChart) {
      if (this.expanded) {
        this.currentSystemChartId = this.expandedSystemChartId;
      }
      else {
        this.currentSystemChartId = this.systemPanelChartId;
      }
      
      if (this.powerExpanded) {
        this.currentPowerChartId = this.expandedPowerChartId;
      }
      else {
        this.currentPowerChartId = this.powerPanelChartId;
      } 
      this.initRenderChart(true);
    }
  }

  save() {
    this.systemAndEquipmentCurveGraphService.curveEquipmentChart.next(this.curveEquipmentChart);
    this.systemAndEquipmentCurveGraphService.powerChart.next(this.powerChart);
    this.systemAndEquipmentCurveGraphService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart(isResize = false) {
    Plotly.purge(this.currentSystemChartId);
    Plotly.purge(this.currentPowerChartId);
    this.setDisplayDataOptions();
    this.initChartSetup(isResize);
    this.drawTraceData();

    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));
    Plotly.newPlot(this.currentSystemChartId, this.curveEquipmentChart.data, chartLayout, this.curveEquipmentChart.config)
      .then(chart => {
        chart.on('plotly_click', (graphData) => {
          this.createDataPoint(graphData);
        });
          chart.on('plotly_hover', hoverData => {
                this.displayHoverGroupData(hoverData);
                this.displayDualHover(hoverData);
          });
          chart.on('plotly_unhover', unhoverData => {
              this.removeHoverGroupData();
              this.removeDualHover();
          });
    });
    if (this.displayPowerChart) {
      let powerChartLayout = JSON.parse(JSON.stringify(this.powerChart.layout));
      Plotly.newPlot(this.currentPowerChartId, this.powerChart.data, powerChartLayout, this.powerChart.config);
    }
    this.save();
  }

  updateChart() {
    this.setDisplayDataOptions();
    this.drawTraceData();
    let chartLayout = JSON.parse(JSON.stringify(this.curveEquipmentChart.layout));

    Plotly.update(this.currentSystemChartId, this.curveEquipmentChart.data, chartLayout);
    // Plotly.newPlot(this.currentSystemChartId, this.curveEquipmentChart.data, chartLayout, this.curveEquipmentChart.config)
    //   .then(chart => {
    //     chart.on('plotly_click', (graphData) => {
    //       this.createDataPoint(graphData);
    //     });
    //       chart.on('plotly_hover', hoverData => {
    //             this.displayHoverGroupData(hoverData);
    //             this.displayDualHover(hoverData);
    //       });
    //       chart.on('plotly_unhover', unhoverData => {
    //           this.removeHoverGroupData();
    //           this.removeDualHover();
    //       });
    // });

    if (this.displayPowerChart) {
      let powerChartLayout = JSON.parse(JSON.stringify(this.powerChart.layout));
      Plotly.newPlot(this.currentPowerChartId, this.powerChart.data, powerChartLayout, this.powerChart.config);
      // Plotly.update(this.currentPowerChartId, this.powerChart.data, powerChartLayout);

    }
  }

  initChartSetup(isResize) {
    this.pointColors = graphColors;
    this.resetHoverData();
    this.fluidPowerData = [];

    if (this.curveEquipmentChart && !isResize) {
      this.systemAndEquipmentCurveGraphService.initChartData();
    }
    let currentSystemChart = this.systemAndEquipmentCurveGraphService.curveEquipmentChart.getValue();
    let currentPowerChart = this.systemAndEquipmentCurveGraphService.powerChart.getValue();

    if (currentSystemChart.currentEquipmentType != this.equipmentType) {
      this.systemAndEquipmentCurveGraphService.initChartData();
      this.curveEquipmentChart = this.systemAndEquipmentCurveGraphService.curveEquipmentChart.getValue();
      this.curveEquipmentChart.currentEquipmentType = this.equipmentType;
      this.systemAndEquipmentCurveGraphService.curveEquipmentChart.next(this.curveEquipmentChart);

      this.powerChart = this.systemAndEquipmentCurveGraphService.powerChart.getValue();
      this.systemAndEquipmentCurveGraphService.powerChart.next(this.powerChart);
    } else {
      this.curveEquipmentChart = currentSystemChart;
      this.powerChart = currentPowerChart;
    }

    this.selectedDataPoints = this.systemAndEquipmentCurveGraphService.selectedDataPoints.getValue();
    this.curveEquipmentChart.layout.yaxis.title.text = `${this.chartConfig.yName} (${this.chartConfig.yUnits})`;
    let powerChartHeight = this.powerExpanded? undefined : 250;
    let curveEquipmentChartHeight = this.expanded? undefined : 350;
    this.powerChart.layout.height = powerChartHeight;
    this.curveEquipmentChart.layout.height = curveEquipmentChartHeight;
    this.isChartSetup = true;
  }

  drawTraceData() {
    if (this.isSystemCurveShown == true && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
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
    if (this.systemAndEquipmentCurveService.baselinePowerDataPairs && this.systemAndEquipmentCurveService.baselinePowerDataPairs.length > 0) {
      this.drawPowerLine(this.systemAndEquipmentCurveService.baselinePowerDataPairs);
      this.displayPowerChart = true;
      this.curveEquipmentChart.layout.xaxis.title.text = '';
    } else {
      this.displayPowerChart = false;
      this.curveEquipmentChart.layout.xaxis.title.text = `Flow (${this.chartConfig.xUnits})`;
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
      xTmp.push(coordinate.x);
      yTmp.push(coordinate.y);
      fluidTmp.push(coordinate.fluidPower);
    });
    this.curveEquipmentChart.data[this.traces.system].x = xTmp;
    this.curveEquipmentChart.data[this.traces.system].y = yTmp;
    this.fluidPowerData = fluidTmp;
    let template = `${'System Curve'} ${this.chartConfig.yName}: %{y:.0f} ${this.chartConfig.yUnits}`;
    this.curveEquipmentChart.data[this.traces.system].hovertemplate = template;
  }

  drawEquipmentCurve(systemCurveData: Array <SystemCurveDataPoint>, traceIndex: number, traceTitle: string) {
    let xTmp = [];
    let yTmp = [];
    systemCurveData.forEach(coordinate => {
      xTmp.push(coordinate.x);
      yTmp.push(coordinate.y);
    });
    this.curveEquipmentChart.data[traceIndex].x = xTmp;
    this.curveEquipmentChart.data[traceIndex].y = yTmp;
    this.curveEquipmentChart.data[traceIndex].line.color = this.pointColors[traceIndex - 1];
    let template = `${traceTitle} ${this.chartConfig.yName}: %{y:.0f} ${this.chartConfig.yUnits}<br>`;
    this.curveEquipmentChart.data[traceIndex].hovertemplate = template;
  }

  drawPowerLine(powerData: Array <SystemCurveDataPoint>) {
    let xTmp = [];
    let yTmp = [];
    powerData.forEach(coordinate => {
      xTmp.push(coordinate.x);
      yTmp.push(coordinate.y);
    });
    this.powerChart.data[0].x = xTmp;
    this.powerChart.data[0].y = yTmp;
    this.powerChart.layout.xaxis.title.text = `Flow (${this.chartConfig.xUnits})`;
    this.powerChart.layout.yaxis.title.text = 'Power ' + `(${this.chartConfig.powerUnits})`;

    this.powerChart.data[0].line.color = this.pointColors[0];
    let template = `Power %{y:.1f} ${this.chartConfig.powerUnits}`;
    this.powerChart.data[0].hovertemplate = template;
  }

  addIntersectionPoints() {
    // let baselineIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs);
    // TODO add pointEfficiency to incoming intersection from 3756
    // let baselineIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs, this.systemAndEquipmentCurveService.systemCurveRegressionData);
    let baselineIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.systemCurveRegressionData);
    if (baselineIntersectionPoint != undefined) {
      this.chartConfig.defaultPointCount = 1;
      this.setIntersectionTrace(baselineIntersectionPoint, this.traces.baselineIntersect, 'Baseline');
      this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.next(baselineIntersectionPoint);
    }
    if (this.isEquipmentModificationShown && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
      let modIntersectionPoint = this.calculateModificationIntersectionPoint();

      // let modifiedIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getModifiedIntersectionPoint(baselineIntersectionPoint, this.settings, this.equipmentType, this.systemAndEquipmentCurveService.equipmentInputs.getValue());
      // let modifiedIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getModifiedIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs);
      // let modifiedIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getModifiedIntersectionPoint(this.settings, this.equipmentType, this.systemAndEquipmentCurveService.equipmentInputs.getValue());

      if (modIntersectionPoint != undefined) {
        this.systemAndEquipmentCurveGraphService.modificationIntersectionPoint.next(modIntersectionPoint);
        this.chartConfig.defaultPointCount = 2;
        this.setIntersectionTrace(modIntersectionPoint, this.traces.modificationIntersect, 'Modification');
      }
    }
  }

  calculateModificationIntersectionPoint(): {x: number, y: number, fluidPower: number} {
    let closestSystemCurvePoint;
    let closestModifiedDataPoint;
    let smallestDistanceBetweenPoints = Infinity;
    //system curve data pairs (assuming longer should code in a check to use the longest on the outside of the double loop)
    this.systemAndEquipmentCurveService.systemCurveRegressionData.forEach(systemCurveDataPoint => {
      //modification points
      this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.forEach(modifiedDataPoint => {
        //distance = (p1.x - p2.x)^2 + (p1.y - p2.y)^2
        let distanceBetweenCurrentPoint = Math.pow((systemCurveDataPoint.x - modifiedDataPoint.x), 2) + Math.pow((systemCurveDataPoint.y - modifiedDataPoint.y), 2)
        if(smallestDistanceBetweenPoints > distanceBetweenCurrentPoint){
          smallestDistanceBetweenPoints = distanceBetweenCurrentPoint;
          closestSystemCurvePoint = systemCurveDataPoint;
          closestModifiedDataPoint = modifiedDataPoint;
        }
      })
    });

    console.log('SYSTEM = ');
    console.log(closestSystemCurvePoint);
    console.log('MODIFIED =');
    console.log(closestModifiedDataPoint);
    //find average between points
    let x: number = (closestModifiedDataPoint.x + closestSystemCurvePoint.x) / 2;
    let y: number = (closestModifiedDataPoint.y + closestSystemCurvePoint.y) / 2;
    //TODO: calc fluid power
    return {x: x, y: y, fluidPower: 0};
  }


  // initTooltipData() {
  //   this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
  //   this.tooltipData = this.systemAndEquipmentCurveGraphService.initTooltipData(this.settings, this.equipmentType, this.isEquipmentCurveShown, this.isEquipmentModificationShown, this.isSystemCurveShown);
  // }
  
  // TODO this may be eliminated for separate hover tags
  displayHoverGroupData(plotlyHoverEvent) {
    let currentPointIndex = plotlyHoverEvent.points[0].pointIndex;
    let baselineX = this.curveEquipmentChart.data[this.traces.baseline].x;
    let baselineY = this.curveEquipmentChart.data[this.traces.baseline].y;

    this.currentHoverData = {
      baseline: {
        x: Number(baselineX[currentPointIndex]),
        y: Number(baselineY[currentPointIndex]),
        pointColor: this.pointColors[this.traces.baseline - 1]
      },
      fluidPower: this.fluidPowerData[currentPointIndex]
    };

    let systemX = this.curveEquipmentChart.data[this.traces.system].x;
    let systemY = this.curveEquipmentChart.data[this.traces.system].y;
    this.currentHoverData.system = {
      x: Number(systemX[currentPointIndex]),
      y: Number(systemY[currentPointIndex]),
      pointColor: 'red'
    };
    
    let modificationX = this.curveEquipmentChart.data[this.traces.modification].x;
    let modificationY = this.curveEquipmentChart.data[this.traces.modification].y;
    this.currentHoverData.modification = {
      x: Number(modificationX[currentPointIndex]),
      y: Number(modificationY[currentPointIndex]),
      pointColor: this.pointColors[this.traces.modification - 1]
    };
    this.cd.detectChanges();
  }

  displayDualHover(plotlyHoverEvent) {
    let points = plotlyHoverEvent.points[0];
    let pointIndex: number;
    if (points.curveNumber == this.traces.modification) {
      // Round up or down to nearest 10 - (mod coordinates are offset by a ratio)
      let pointX = Math.round(points.x/10) * 10;
      pointIndex = this.powerChart.data[0].x.findIndex(x => x == pointX);
    } else {
      pointIndex = this.powerChart.data[0].x.findIndex(x => x == points.x);
    }
    let powerTraces = [
      { curveNumber: 0, pointNumber: pointIndex },
    ]
    if (this.powerChart.data[1]) {
      powerTraces.push({ curveNumber: 1, pointNumber: pointIndex });
    }
    Plotly.Fx.hover(this.currentPowerChartId, powerTraces);
  }

  removeHoverGroupData() {
    this.resetHoverData();
    this.cd.detectChanges();
  }

  removeDualHover() {
    Plotly.Fx.hover(this.currentPowerChartId, []);
  }

  setIntersectionTrace(point: SystemCurveDataPoint, traceDataIndex: number, name: string) {
    let intersectionTrace = this.curveEquipmentChart.data[traceDataIndex];
    intersectionTrace.x = [Math.round(point.x)];
    intersectionTrace.y = [Math.round(point.y)];
    intersectionTrace.hovertemplate = `${name} Intersection<br>Flow: %{x} ${this.chartConfig.xUnits}<br>${this.chartConfig.yName}: %{y} ${this.chartConfig.yUnits}`;
    
    this.curveEquipmentChart.data[traceDataIndex] = intersectionTrace;

    let selectedPoint: SystemCurveDataPoint = {
      pointColor: this.chartConfig.defaultPointBackgroundColor,
      pointOutlineColor: this.chartConfig.defaultPointOutlineColor,
      pointTraceIndex: traceDataIndex,
      x: point.x,
      y: point.y,
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

  createDataPoint(graphData, existingPoint?: SystemCurveDataPoint) {
    let pointIndex = graphData.points[0].pointIndex;
    let selectedPoint = existingPoint;
    let powerAtPoint = this.powerChart.data[0]? this.powerChart.data[0].y[pointIndex] : 0;
    let modPowerAtPoint = this.powerChart.data[1]? this.powerChart.data[1].y[pointIndex] : 0;
    let fluidPower = 0;
    if (graphData.points[0].curveNumber != this.traces.system) {
      fluidPower = this.fluidPowerData[pointIndex];
    }
    if (!selectedPoint) {
      selectedPoint = {
        pointColor: this.getNextColor(),
        x: graphData.points[0].x,
        y: graphData.points[0].y,
        fluidPower: fluidPower,
        power: Number(powerAtPoint),
        modPower: Number(modPowerAtPoint),
        efficiency: 0,
      }
    }
    let selectedPointTrace = this.systemAndEquipmentCurveGraphService.getTraceDataFromPoint(selectedPoint);
    selectedPointTrace.hoverinfo = 'skip';

    Plotly.addTraces(this.currentSystemChartId, selectedPointTrace);
    this.selectedDataPoints.push(selectedPoint);
    
    this.cd.detectChanges();
    this.save();
  }

  deleteDataPoint(point: SystemCurveDataPoint, index: number) {
    let traceCount: number = this.curveEquipmentChart.data.length;
    let deleteTraceIndex: number = this.curveEquipmentChart.data.findIndex(trace => trace.x[0] == point.x && trace.y[0] == point.y);
    // ignore default traces
    if (traceCount > this.chartConfig.defaultPointCount && deleteTraceIndex != -1) {
      Plotly.deleteTraces(this.currentSystemChartId, [deleteTraceIndex]);
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

  expandChart(chart = 'system') {
    if (chart == 'power') {
      this.powerExpanded = true;
    } else {
      this.expanded = true;
    }
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }

  contractChart(chart = 'system') {
    if (chart == 'power') {
      this.powerExpanded = false;
    } else {
      this.expanded = false;
    }
    
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
    let powerGridX: boolean = this.powerChart.layout.xaxis.showgrid;
    let powerGridY: boolean = this.powerChart.layout.yaxis.showgrid;
    this.curveEquipmentChart.layout.xaxis.showgrid = !showingGridX;
    this.curveEquipmentChart.layout.yaxis.showgrid = !showingGridY;
    this.powerChart.layout.xaxis.showgrid = !powerGridX;
    this.powerChart.layout.yaxis.showgrid = !powerGridY;
    this.updateChart();
  }

}

