import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { DataPoint, SimpleChart, TraceData } from '../../../shared/models/plotting';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { SystemAndEquipmentCurveGraphService, HoverGroupData, SystemCurveDataPoint, CurveTraceData } from './system-and-equipment-curve-graph.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { CurveDataService } from '../curve-data.service';
import { PlotlyService } from 'angular-plotly.js';
import * as Plotly from 'plotly.js-dist';
import { HelperFunctionsService } from '../../../shared/helper-services/helper-functions.service';
import { CurveCoordinatePairs, FanSystemCurveData, PumpSystemCurveData } from '../../../shared/models/system-and-equipment-curve';
import { RegressionEquationsService } from '../regression-equations.service';


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
  @ViewChild("expandedPowerChartDiv", { static: false }) expandedPowerChartDiv: ElementRef;
  @ViewChild("expandedSystemChartDiv", { static: false }) expandedSystemChartDiv: ElementRef;

  @ViewChild("powerChartPanelDiv", { static: false }) powerChartPanelDiv: ElementRef;
  @ViewChild("systemPanelDiv", { static: false }) systemPanelDiv: ElementRef;

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
  createGraphTimer: any;

  // Graphing
  selectedDataPoints: Array<SystemCurveDataPoint>;
  userDataPoints: Array<SystemCurveDataPoint> = [];
  pointColors: Array<string>;
  curveEquipmentChart: SimpleChart;
  powerChart: SimpleChart;
  currentHoverData: HoverGroupData;
  defaultPointCount = 0;
  defaultPointOutlineColor = 'rgba(0, 0, 0, .6)';
  defaultPointBackgroundColor = 'rgba(0, 0, 0, 0)';
  yName = 'Pressure';
  yUnits = '';
  xUnits = '';
  powerUnits = '';
  systemColor = '#FF0000';

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
  fluidPowerData: {
    system?: Array<number>;
    baseline?: Array<number>;
    modification?: Array<number>;
  }
  hoverChartElement: ElementRef;
  imperialFanPrecision: string;
  constructor(
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private regressionEquationsService: RegressionEquationsService,
    private curveDataService: CurveDataService,
    private cd: ChangeDetectorRef,
    private plotlyService: PlotlyService,
    private helperService: HelperFunctionsService
  ) { }

  ngOnInit(): void {
    this.setChartUnits();
  }

  ngAfterViewInit() {
    this.initSubscriptions();
    this.initRenderChart();
    this.cd.detectChanges();
  }

  initSubscriptions() {
    this.updateGraphSub = this.systemAndEquipmentCurveService.updateGraph.subscribe(updateGraph => {
      if (updateGraph == true) {
        if (this.createGraphTimer != undefined) {
          clearTimeout(this.createGraphTimer);
        }
        this.createGraphTimer = setTimeout(() => {
          this.initRenderChart();
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
        this.curveEquipmentChart.layout.xaxis.title.text = `Flow (${this.xUnits})`;
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
    this.isSystemCurveShown = this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'closed' ? false : true;
    this.isEquipmentCurveShown = (this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open');
    if (this.isEquipmentCurveShown && this.systemAndEquipmentCurveService.equipmentInputs.getValue() != undefined) {
      if (this.equipmentType == 'pump') {
        this.isEquipmentModificationShown = this.systemAndEquipmentCurveService.pumpModificationCollapsed.getValue() == 'closed' ? false : true;
      } else {
        this.isEquipmentModificationShown = this.systemAndEquipmentCurveService.fanModificationCollapsed.getValue() == 'closed' ? false : true;
      }
    } else {
      this.isEquipmentModificationShown = false;

    }
  }

  setChartUnits() {
    if (this.equipmentType == 'pump') {
      this.yName = 'Head';
      this.yUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.distanceMeasurement);
      this.xUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.flowMeasurement);
      this.powerUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.powerMeasurement);
    } else {
      this.yName = 'Pressure';
      this.yUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanPressureMeasurement);
      this.xUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanFlowRate);
      this.powerUnits = this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanPowerMeasurement);
      if (this.settings.unitsOfMeasure == 'Imperial') {
        this.imperialFanPrecision = '.2f';
      }
    }
  }

  save() {
    this.systemAndEquipmentCurveGraphService.curveEquipmentChart.next(this.curveEquipmentChart);
    this.systemAndEquipmentCurveGraphService.powerChart.next(this.powerChart);
    this.systemAndEquipmentCurveGraphService.selectedDataPoints.next(this.selectedDataPoints);
  }

  // Every update is newPlot to force resize
  initRenderChart(isResize = false) {
    this.setDisplayDataOptions();
    this.selectedDataPoints = new Array();
    this.initChartSetup(isResize);
    this.drawTraceData();
    this.newPlot();
    this.save();
  }

  newPlot() {
    let chartLayout = this.helperService.copyObject(this.curveEquipmentChart.layout);
    let traceData: Array<TraceData> = new Array();
    this.curveEquipmentChart.data.forEach((trace, i) => {
      traceData.push(trace);
    });
    this.selectedDataPoints.forEach(point => {
      if (point.isUserPoint) {
        let selectedPointTrace: TraceData = this.systemAndEquipmentCurveGraphService.getTraceDataFromPoint(point);
        traceData.push(selectedPointTrace);
      }
    })
    if (this.expanded && this.expandedSystemChartDiv) {
      this.plotlyService.newPlot(this.expandedSystemChartDiv.nativeElement, traceData, chartLayout, this.curveEquipmentChart.config)
        .then(chart => {
          chart.on('plotly_click', (graphData) => {
            this.createDataPoint(graphData);
          });
          chart.on('plotly_hover', hoverData => {
            this.displayHoverData(hoverData);
          });
          chart.on('plotly_unhover', unhoverData => {
            this.removeHoverData(this.powerChartPanelDiv);
          });
        });

    } else if (!this.expanded && this.systemPanelDiv) {
      this.plotlyService.newPlot(this.systemPanelDiv.nativeElement, traceData, chartLayout, this.curveEquipmentChart.config)
        .then(chart => {
          chart.on('plotly_click', (graphData) => {
            this.createDataPoint(graphData);
          });
          chart.on('plotly_hover', hoverData => {
            this.displayHoverData(hoverData);
          });
          chart.on('plotly_unhover', unhoverData => {
            this.removeHoverData(this.powerChartPanelDiv);
          });
        });

    }

    if (this.displayPowerChart) {
      let powerChartLayout = this.helperService.copyObject(this.powerChart.layout);
      if (this.powerExpanded && this.expandedPowerChartDiv) {
        this.plotlyService.newPlot(this.expandedPowerChartDiv.nativeElement, this.powerChart.data, powerChartLayout, this.powerChart.config)
          .then(chart => {
            chart.on('plotly_hover', powerHoverData => {
              this.displayHoverData(powerHoverData, true);
            });
            chart.on('plotly_unhover', unhoverData => {
              this.removeHoverData(this.systemPanelDiv);
            });
          });
      } else if (!this.powerExpanded && this.powerChartPanelDiv) {
        this.plotlyService.newPlot(this.powerChartPanelDiv.nativeElement, this.powerChart.data, powerChartLayout, this.powerChart.config)
          .then(chart => {
            chart.on('plotly_hover', powerHoverData => {
              this.displayHoverData(powerHoverData, true);
            });
            chart.on('plotly_unhover', unhoverData => {
              this.removeHoverData(this.systemPanelDiv);
            });
          });
      }
    }
  }


  initChartSetup(isResize) {
    this.pointColors = this.helperService.copyObject(graphColors);
    this.resetHoverData();
    this.fluidPowerData = {};

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
    this.curveEquipmentChart.layout.yaxis.title.text = `${this.yName} (${this.yUnits})`;

    let powerChartHeight = this.powerExpanded ? undefined : 250;
    let curveEquipmentChartHeight = this.expanded ? undefined : 350;
    this.powerChart.layout.height = powerChartHeight;
    this.curveEquipmentChart.layout.height = curveEquipmentChartHeight;
    this.isChartSetup = true;
  }

  drawTraceData() {
    if (this.isSystemCurveShown == true && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
      this.drawSystemCurve();
    } else {
      this.setEmptyTrace(this.curveEquipmentChart, this.traces.system);
    }
    if (this.isEquipmentCurveShown == true) {
      if (this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
        this.drawEquipmentCurve(this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs, this.traces.baseline, 'Baseline');
        if (this.isEquipmentModificationShown == true) {
          this.drawEquipmentCurve(this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs, this.traces.modification, 'Modification');
        }
        else {
          this.setEmptyTrace(this.curveEquipmentChart, this.traces.modification);
        }
      }
    }
      this.drawPowerLine(this.systemAndEquipmentCurveService.baselinePowerDataPairs, 0, 'Baseline');
      if (this.isEquipmentModificationShown == true && this.systemAndEquipmentCurveService.modificationPowerDataPairs) {
        this.drawPowerLine(this.systemAndEquipmentCurveService.modificationPowerDataPairs, 1, 'Modification');
      } else {
        this.setEmptyTrace(this.powerChart, 1);
      }
      this.displayPowerChart = true;
      this.curveEquipmentChart.layout.xaxis.title.text = `Flow (${this.xUnits})`;
    // }
    if (this.isEquipmentCurveShown
      && this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined
      && this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.length != 0
      && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined
      && this.systemAndEquipmentCurveService.systemCurveRegressionData.length != 0
    ) {
      this.addIntersectionPoints();
    }
  }

  setIntersectionTrace(point: SystemCurveDataPoint, traceDataIndex: number, name: string) {
    let intersectionTrace = this.curveEquipmentChart.data[traceDataIndex];
    let curveTraceData: CurveTraceData = this.getCurveTraceData([point], `${name} Intersection`);

    intersectionTrace.x = curveTraceData.xCoordinates;
    intersectionTrace.y = curveTraceData.yCoordinates;
    intersectionTrace.customdata = curveTraceData.customData;
    intersectionTrace.hovertemplate = '%{customdata}';
    this.curveEquipmentChart.data[traceDataIndex] = intersectionTrace;

    point.pointColor = this.defaultPointBackgroundColor;
    point.pointOutlineColor = this.defaultPointOutlineColor;
    point.pointTraceIndex = traceDataIndex;

    let systemCurveData: FanSystemCurveData | PumpSystemCurveData;
    let fluidPower: number;

    if (this.yName === 'Head') {
      systemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue() as PumpSystemCurveData;
      fluidPower = this.regressionEquationsService.getPumpFluidPower(point.y, point.x, systemCurveData.specificGravity, this.settings);
    } else {
      systemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.getValue() as FanSystemCurveData;
      fluidPower = this.regressionEquationsService.getFanFluidPower(point.y, point.x, systemCurveData.compressibilityFactor, this.settings);
    }

    point.fluidPower = fluidPower;

    let updatedPoint = false;
    this.selectedDataPoints = this.selectedDataPoints.map(existingPoint => {
      if (existingPoint.pointTraceIndex == traceDataIndex) {
        existingPoint = point;
        updatedPoint = true;
        return point;
      } else {
        return existingPoint;
      }
    });

    if (!updatedPoint) {
      if (name == 'Modification') {
        this.selectedDataPoints.splice(1, 0, point);
      } else {
        this.selectedDataPoints.push(point);
      }
    }
    this.cd.detectChanges();
    this.save();
  }

  drawSystemCurve() {
    let curveTraceData: CurveTraceData = this.getCurveTraceData(this.systemAndEquipmentCurveService.systemCurveRegressionData, 'System Curve');
    this.curveEquipmentChart.data[this.traces.system].x = curveTraceData.xCoordinates;
    this.curveEquipmentChart.data[this.traces.system].y = curveTraceData.yCoordinates;
    this.fluidPowerData.system = curveTraceData.fluidPower;
    this.curveEquipmentChart.data[this.traces.system].customdata = curveTraceData.customData;
    this.curveEquipmentChart.data[this.traces.system].hovertemplate = '%{customdata}';
  }
  
  drawEquipmentCurve(equipmentCurvedata: Array<DataPoint>, traceIndex: number, traceTitle: string) {
    let curveTraceData: CurveTraceData = this.getCurveTraceData(equipmentCurvedata, traceTitle);
    this.curveEquipmentChart.data[traceIndex].x = curveTraceData.xCoordinates;
    this.curveEquipmentChart.data[traceIndex].y = curveTraceData.yCoordinates;
    if (traceTitle === 'Baseline') {
      this.fluidPowerData.baseline = curveTraceData.fluidPower;
    } {
      this.fluidPowerData.modification = curveTraceData.fluidPower;
    }
    this.curveEquipmentChart.data[traceIndex].customdata = curveTraceData.customData;
    this.curveEquipmentChart.data[traceIndex].hovertemplate = '%{customdata}';
    this.curveEquipmentChart.data[traceIndex].line.color = this.pointColors[traceIndex - 1];
  }
  

  getCurveTraceData(curveData: Array<SystemCurveDataPoint>, traceName: string): CurveTraceData {
    let curveTraceData: CurveTraceData = {
      xCoordinates: [],
      yCoordinates: [],
      customData: [],
      fluidPower: [],
    }

    curveData.forEach(coordinate => {
      let x: number = coordinate.x;
      let y: number = coordinate.y;
      let fluidPower: number = coordinate.fluidPower;
      curveTraceData.xCoordinates.push(x);
      curveTraceData.yCoordinates.push(y);
      curveTraceData.fluidPower.push(fluidPower);
      x = this.getRoundedXCoordinate(x);
      y = this.getRoundedYCoordinate(y);

      if (fluidPower !== undefined) {
        fluidPower = this.getRoundedFluidCoordinate(fluidPower)
      }

      let pairHoverTemplate: string = `${traceName} ${this.yName}: ${y} ${this.yUnits}`;
      if (traceName.includes('Intersection')) {
        pairHoverTemplate = `${traceName}<br>Flow: ${x} ${this.xUnits}<br>${this.yName}: ${y} ${this.yUnits}`;
      } 

      curveTraceData.customData.push(pairHoverTemplate);
    });

    return curveTraceData;
  }

  getRoundedYCoordinate(y: number) {
    if (this.imperialFanPrecision) {
      return this.helperService.roundVal(y, 2);
    } else if (y >= 100) {
      return this.helperService.roundVal(y, 0);
    } else {
      return this.helperService.roundVal(y, 1);
    }
  }

  getRoundedXCoordinate(x: number) {
    if (x >= 100) {
      return this.helperService.roundVal(x, 0);
     } else {
      return this.helperService.roundVal(x, 1);
   }
  }

  getRoundedFluidCoordinate(fluidPower: number) {
    return this.getRoundedXCoordinate(fluidPower)
  }

  setEmptyTrace(chart, traceIndex) {
    chart.data[traceIndex].x = [];
    chart.data[traceIndex].y = [];
  }

  drawPowerLine(powerData: Array<SystemCurveDataPoint>, traceIndex: number, name: string) {
    let xTmp = [];
    let yTmp = [];
    if (powerData) {
      powerData.forEach(coordinate => {
        let x = this.getRoundedXCoordinate(coordinate.x);
        let y = this.getRoundedYCoordinate(coordinate.y);
        xTmp.push(x);
        yTmp.push(y);
      });
    }
    this.powerChart.data[traceIndex].x = xTmp;
    this.powerChart.data[traceIndex].y = yTmp;
    this.powerChart.layout.xaxis.title.text = `Flow (${this.xUnits})`;
    this.powerChart.layout.yaxis.title.text = 'Power ' + `(${this.powerUnits})`;

    this.powerChart.data[traceIndex].line.color = this.pointColors[traceIndex + traceIndex];
    let template = `${name} Power %{y} ${this.powerUnits}`;
    this.powerChart.data[traceIndex].hovertemplate = template;
  }

  addIntersectionPoints() {
    let baselineIntersectionPoint: SystemCurveDataPoint = this.systemAndEquipmentCurveGraphService.getBaselineIntersectionPoint(this.equipmentType, this.settings);
    if (baselineIntersectionPoint != undefined && this.isSystemCurveShown) {
      this.defaultPointCount = 1;
      this.setIntersectionTrace(baselineIntersectionPoint, this.traces.baselineIntersect, 'Baseline');
    } else {
      this.removeIntersectionPoint(0, this.traces.baselineIntersect);
    }
    if (this.isEquipmentModificationShown && this.isSystemCurveShown && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
      let modIntersectionPoint = this.systemAndEquipmentCurveGraphService.calculateModificationIntersectionPoint(this.equipmentType, this.settings);
      if (modIntersectionPoint != undefined) {
        this.defaultPointCount = 2;
        this.setIntersectionTrace(modIntersectionPoint, this.traces.modificationIntersect, 'Modification');
      }
    } else {
      this.removeIntersectionPoint(1, this.traces.modificationIntersect);
    }
  }

  removeIntersectionPoint(selectedDataPointIndex: number, traceIndex: number) {
    this.defaultPointCount = selectedDataPointIndex;
    this.setEmptyTrace(this.curveEquipmentChart, traceIndex);
    this.selectedDataPoints.splice(selectedDataPointIndex, 1);
    this.cd.detectChanges();
    this.save();
  }

  buildHoverGroupData(plotlyHoverEvent) {
    let currentPointIndex = plotlyHoverEvent.points[0].pointIndex;
    let baselineX = this.curveEquipmentChart.data[this.traces.baseline].x;
    let baselineY = this.curveEquipmentChart.data[this.traces.baseline].y;

    let hoverBaselineIntersect = plotlyHoverEvent.points[0].curveNumber == this.traces.baselineIntersect;
    let hoverModificationIntersect = plotlyHoverEvent.points[0].curveNumber == this.traces.modificationIntersect;
    let hoverColors = this.helperService.copyObject(graphColors);
    if (!hoverBaselineIntersect) {
      let x: number = Number(baselineX[currentPointIndex]);
      let y: number = Number(baselineY[currentPointIndex]);
      this.currentHoverData.baseline.x = isNaN(x)? undefined : x;
      this.currentHoverData.baseline.y = isNaN(y)? undefined : y;
      this.currentHoverData.baseline.pointColor = hoverColors[this.traces.baseline - 1];

    } else if (hoverBaselineIntersect) {
      currentPointIndex = this.systemAndEquipmentCurveGraphService.findApproximateFlowIndex(plotlyHoverEvent.points[0].x, this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs)
      this.currentHoverData.baseline.x = Number(plotlyHoverEvent.points[0].x);
      this.currentHoverData.baseline.y = Number(plotlyHoverEvent.points[0].y);
      this.currentHoverData.baseline.pointColor = hoverColors[this.traces.baseline - 1];
    }

    if (!hoverModificationIntersect) {
      let modificationX = this.curveEquipmentChart.data[this.traces.modification].x;
      let modificationY = this.curveEquipmentChart.data[this.traces.modification].y;
      let x: number = Number(modificationX[currentPointIndex]);
      let y: number = Number(modificationY[currentPointIndex]);
      this.currentHoverData.modification.x = isNaN(x)? undefined : x;
      this.currentHoverData.modification.y = isNaN(y)? undefined : y;

      this.currentHoverData.modification.pointColor = hoverColors[this.traces.modification - 1];

    } else if (hoverModificationIntersect) {
      currentPointIndex = this.systemAndEquipmentCurveGraphService.modifiedIntersectionIndex;
      this.currentHoverData.modification.x = Number(plotlyHoverEvent.points[0].x);
      this.currentHoverData.modification.y = Number(plotlyHoverEvent.points[0].y);
      this.currentHoverData.modification.pointColor = hoverColors[this.traces.modification - 1];

      let x: number = Number(baselineX[currentPointIndex]);
      let y: number = Number(baselineY[currentPointIndex]);
      this.currentHoverData.baseline.x = isNaN(x)? undefined : x;
      this.currentHoverData.baseline.y = isNaN(y)? undefined : y;
      this.currentHoverData.baseline.pointColor = hoverColors[this.traces.baseline - 1];
    }
    this.currentHoverData.baseline.fluidPower = isNaN(this.fluidPowerData.baseline[currentPointIndex])? undefined : this.fluidPowerData.baseline[currentPointIndex];
    this.currentHoverData.modification.fluidPower = isNaN(this.fluidPowerData.modification[currentPointIndex])? undefined : this.fluidPowerData.modification[currentPointIndex];

    let systemX = this.curveEquipmentChart.data[this.traces.system].x;
    let systemY = this.curveEquipmentChart.data[this.traces.system].y;
    let x: number = Number(systemX[currentPointIndex]);
    let y: number = Number(systemY[currentPointIndex]);
    this.currentHoverData.system.x = isNaN(x)? undefined : x;
    this.currentHoverData.system.y = isNaN(y)? undefined : y;
    this.currentHoverData.system.pointColor = this.systemColor;

    this.currentHoverData.baselinePower = isNaN(Number(this.powerChart.data[0].y[currentPointIndex]))? undefined : this.powerChart.data[0].y[currentPointIndex] as number;
    this.currentHoverData.modificationPower = isNaN(Number(this.powerChart.data[1].y[currentPointIndex]))? undefined : this.powerChart.data[1].y[currentPointIndex] as number;
    this.cd.detectChanges();
  }

  displayHoverData(plotlyHoverEvent, onPowerChart: boolean = false) {
    this.buildHoverGroupData(plotlyHoverEvent);
    let hoveredPoint = plotlyHoverEvent.points[0];
    let hoveredPointIndex: number = this.powerChart.data[0].x.findIndex(x => x == hoveredPoint.x);
    let powerFlowValue = this.powerChart.data[0].x[hoveredPointIndex];
    this.hoverChartElement = this.displayPowerChart ? this.powerChartPanelDiv : undefined;
    let hoverTraces = [{ curveNumber: 0, pointNumber: hoveredPointIndex }];

    if (hoveredPoint.curveNumber == this.traces.modification) {
      // Hovering on equipment mod
      // Round up or down to nearest 10 - (mod x coordinates are offset by the base/mod speed ratio)
      let pointX = Math.round(hoveredPoint.x / 10) * 10;
      hoveredPointIndex = this.powerChart.data[0].x.findIndex(x => x == pointX);
      hoverTraces[0].pointNumber = hoveredPointIndex;
    }

    if (!onPowerChart && this.powerChart.data[1]) {
      // hovertag for power chart modification
      if (hoveredPoint.curveNumber != this.traces.modification) {
        hoveredPointIndex = this.powerChart.data[0].x.findIndex(x => x == powerFlowValue);
      } else {
        // Modification lines are same length - use index
        hoveredPointIndex = hoveredPoint.pointIndex;
      }
      hoverTraces.push({ curveNumber: 1, pointNumber: hoveredPointIndex });
    } else if (onPowerChart && hoveredPoint.curveNumber == 0) {
      // Hovering on power baseline
      hoveredPointIndex = this.curveEquipmentChart.data[this.traces.baseline].x.findIndex(x => x == hoveredPoint.x);
      this.hoverChartElement = this.systemPanelDiv;
      hoverTraces[0].curveNumber = this.traces.baseline;
    } else if (onPowerChart && hoveredPoint.curveNumber == 1) {
      // Hovering on power modification
      hoveredPointIndex = hoveredPoint.pointIndex;
      this.hoverChartElement = this.systemPanelDiv;
      hoverTraces[0].curveNumber = this.traces.modification;
      hoverTraces[0].pointNumber = hoveredPointIndex;
    }

    if (this.hoverChartElement) {
      Plotly.Fx.hover(this.hoverChartElement.nativeElement, hoverTraces);
    }
  }

  removeHoverData(element: ElementRef) {
    this.resetHoverData();
    if (this.hoverChartElement) {
      Plotly.Fx.hover(element.nativeElement, []);
    }
    this.cd.detectChanges();
  }


  createDataPoint(graphData) {
    let pointIndex = graphData.points[0].pointIndex;
    let fluidPower = 0;
    if (graphData.points[0].curveNumber == this.traces.baseline) {
      fluidPower = this.fluidPowerData.baseline[pointIndex];
    } else if (graphData.points[0].curveNumber == this.traces.modification) {
      fluidPower = this.fluidPowerData.modification[pointIndex];
    }

    let pointId: string = this.helperService.getNewIdString();
    if (this.pointColors.length === 0) {
      this.pointColors = this.helperService.copyObject(graphColors);
    } 
    let nextColorIndex: number = (this.selectedDataPoints.filter(point => point.isUserPoint).length + 1) % this.pointColors.length;
    let nextColor: string = this.pointColors[nextColorIndex];  
    this.pointColors.splice(nextColorIndex, 1);

    let selectedPoint: SystemCurveDataPoint = {
      pointColor: nextColor,
      x: this.getRoundedXCoordinate(graphData.points[0].x),
      y: this.getRoundedYCoordinate(graphData.points[0].y),
      fluidPower: fluidPower,
      id: pointId,
      power: 0,
      efficiency: 0,
      isUserPoint: true
    }
    let isModification: boolean;
    if (graphData.points[0].curveNumber == this.traces.modification || graphData.points[0].curveNumber == this.traces.modificationIntersect) {
      isModification = true;
    } else if (graphData.points[0].curveNumber == this.traces.baseline || graphData.points[0].curveNumber == this.traces.baselineIntersect) {
      isModification = false;
    }
    selectedPoint = this.systemAndEquipmentCurveGraphService.getSelectedDataPointEfficiency(selectedPoint, this.equipmentType, this.settings, isModification);
    this.selectedDataPoints.push(selectedPoint);
    this.newPlot();
    this.cd.detectChanges();
    this.save();
  }

  deleteDataPoint(point: SystemCurveDataPoint) {
    let traceCount: number = this.curveEquipmentChart.data.length;
    // ignore default traces
    if (traceCount > this.defaultPointCount && point.isUserPoint) {
      let deleteTraceIndex: number = this.selectedDataPoints.findIndex(trace => trace.id === point.id);
      this.selectedDataPoints.splice(deleteTraceIndex, 1);
      this.cd.detectChanges();
      this.newPlot();
      this.save();
    }
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

  resetHoverData() {
    this.currentHoverData = {
      system: {
        x: 0,
        y: 0,
        fluidPower: 0,
        pointColor: ''
      },
      baseline: {
        x: 0,
        y: 0,
        fluidPower: 0,
        pointColor: ''
      },
      modification: {
        x: 0,
        y: 0,
        fluidPower: 0,
        pointColor: ''
      },
    };
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
      this.newPlot();
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
    let showingGridX: boolean = this.curveEquipmentChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.curveEquipmentChart.layout.yaxis.showgrid;
    let powerGridX: boolean = this.powerChart.layout.xaxis.showgrid;
    let powerGridY: boolean = this.powerChart.layout.yaxis.showgrid;
    this.curveEquipmentChart.layout.xaxis.showgrid = !showingGridX;
    this.curveEquipmentChart.layout.yaxis.showgrid = !showingGridY;
    this.powerChart.layout.xaxis.showgrid = !powerGridX;
    this.powerChart.layout.yaxis.showgrid = !powerGridY;
    this.initRenderChart(true);
  }

}

