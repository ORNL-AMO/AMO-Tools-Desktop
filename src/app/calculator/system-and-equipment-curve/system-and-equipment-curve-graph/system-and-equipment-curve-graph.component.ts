import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import { LineChartHelperService } from '../../../shared/helper-services/line-chart-helper.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService, PumpSystemCurveData, FanSystemCurveData, EquipmentInputs, ByEquationInputs } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { RegressionEquationsService } from '../regression-equations/regression-equations.service';
import { FanCurveInputData } from '../../../shared/models/fans';

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

  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;
  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;

  expanded: boolean;
  svg: d3.Selection<any>;
  width: number;
  height: number;
  margin: { top: number, right: number, bottom: number, left: number };
  isSystemCurveShown: boolean;
  isEquipmentCurveShown: boolean;
  isEquipmentModificationShown: boolean;

  equipmentCurveCollapsedSub: Subscription;
  systemCurveCollapsedSub: Subscription;
  equipmentInputsSub: Subscription;
  baselineEquipmentCurveDataPairsSub: Subscription;
  modificationEquipmentCurveDataPairsSub: Subscription;
  curveDataSubscription: Subscription;
  byEquationInputsSub: Subscription;
  byDataInputsSub: Subscription;

  baselineEquipmentLine: d3.Selection<any>;
  modificationEquipmentLine: d3.Selection<any>;
  systemCurveLine: d3.Selection<any>;
  x: any;
  y: any;
  isGridToggled: boolean = false;
  xDomain: { min: number, max: number };
  yDomain: { min: number, max: number };
  focusBaselineEquipmentCurve: d3.Selection<any>;
  focusModificationEquipmentCurve: d3.Selection<any>;
  focusSystemCurve: d3.Selection<any>;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;
  canvasWidth: number;

  //
  systemCurveRegressionData: Array<{ x: number, y: number, fluidPower: number }>;
  baselineEquipmentCurveDataPairs: Array<{ x: number, y: number }>;
  modifiedEquipmentCurveDataPairs: Array<{ x: number, y: number }>;
  equipmentInputs: EquipmentInputs;
  fanCurveData: FanSystemCurveData;
  pumpCurveData: PumpSystemCurveData;

  createGraphTimer: any;
  constructor(private lineChartHelperService: LineChartHelperService, private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.equipmentInputsSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.baselineEquipmentCurveDataPairsSub.unsubscribe();
    this.modificationEquipmentCurveDataPairsSub.unsubscribe();
    this.curveDataSubscription.unsubscribe();
    this.byDataInputsSub.unsubscribe();
    this.byEquationInputsSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.setGraphSize();
    this.createSVG();
    this.setAxisLabels();
    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      this.setAxis();
      if (val != undefined) {
        this.isEquipmentCurveShown = (val == 'open');
        if (this.isEquipmentCurveShown == false) {
          this.createGraph();
        }
      }
    });
    this.equipmentInputsSub = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(val => {
      this.setAxis();
      this.equipmentInputs = val;
      if (val != undefined) {
        this.isEquipmentModificationShown = (val.baselineMeasurement != val.modifiedMeasurement);
        this.systemAndEquipmentCurveGraphService.clearDataPoints.next(true);
        this.systemAndEquipmentCurveGraphService.clearDataPoints.next(false);
        this.createGraph();
      }
    });
    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      this.setAxis();
      if (val != undefined) {
        this.isSystemCurveShown = (val == 'open');
        if (this.isSystemCurveShown == false) {
          this.createGraph();
        }
      }
    });

    this.byEquationInputsSub = this.systemAndEquipmentCurveService.byEquationInputs.subscribe(val => {
      this.setAxis();
      if (val != undefined) {
        this.systemAndEquipmentCurveGraphService.clearDataPoints.next(true);
        this.systemAndEquipmentCurveGraphService.clearDataPoints.next(false);
        this.createGraph();
      }
    })

    this.byDataInputsSub = this.systemAndEquipmentCurveService.byDataInputs.subscribe(val => {
      this.setAxis();
      if (val != undefined) {
        this.systemAndEquipmentCurveGraphService.clearDataPoints.next(true);
        this.systemAndEquipmentCurveGraphService.clearDataPoints.next(false);
        this.createGraph();
      }
    })

    this.baselineEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.subscribe(baselinePair => {
      this.setAxis();
      this.baselineEquipmentCurveDataPairs = baselinePair;
      if (this.baselineEquipmentCurveDataPairs != undefined) {
        this.createGraph();
      }
    });
    this.modificationEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.subscribe(modificationPairs => {
      this.modifiedEquipmentCurveDataPairs = modificationPairs;
      this.setAxis();
      if (this.modifiedEquipmentCurveDataPairs != undefined) {
        this.createGraph();
      }
    });

    if (this.equipmentType == 'pump') {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.pumpSystemCurveData.subscribe(pumpSystemCurve => {
        this.pumpCurveData = pumpSystemCurve;
        this.setAxis();
        if (pumpSystemCurve != undefined && this.xDomain != undefined) {
          this.systemAndEquipmentCurveGraphService.clearDataPoints.next(true);
          this.systemAndEquipmentCurveGraphService.clearDataPoints.next(false);
          this.systemCurveRegressionData = this.regressionEquationsService.calculatePumpSystemCurveData(pumpSystemCurve, this.xDomain.max, this.settings);
          this.createGraph();
        } else {
          this.systemCurveRegressionData = undefined;
        }
      });
    } else {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.fanSystemCurveData.subscribe(fanSystemCurve => {
        this.fanCurveData = fanSystemCurve;
        this.setAxis();
        if (fanSystemCurve != undefined && this.xDomain != undefined) {
          this.systemAndEquipmentCurveGraphService.clearDataPoints.next(true);
          this.systemAndEquipmentCurveGraphService.clearDataPoints.next(false);
          this.systemCurveRegressionData = this.regressionEquationsService.calculateFanSystemCurveData(fanSystemCurve, this.xDomain.max, this.settings);
          this.createGraph();
        } else {
          this.systemCurveRegressionData = undefined;
        }
      });
    }
  }

  createGraph() {
    if (this.createGraphTimer != undefined) {
      clearTimeout(this.createGraphTimer);
    }
    this.createGraphTimer = setTimeout(() => {
      this.drawSystemCurve();
      this.drawEquipmentCurve();
      if (this.isSystemCurveShown && this.isEquipmentCurveShown && this.baselineEquipmentCurveDataPairs != undefined && this.systemCurveRegressionData != undefined) {
        this.addIntersectionPoints();
      } else {
        d3.select(this.ngChart.nativeElement).selectAll('#intersectBaseline').remove();
        d3.select(this.ngChart.nativeElement).selectAll('#intersectModification').remove();
      }
      this.updateMouseOverDriver();
    }, 100);
  }

  //setup
  setGraphSize() {
    let curveGraph = this.ngChartContainer.nativeElement;
    this.canvasWidth = curveGraph.clientWidth;
    let canvasHeight: number = this.canvasWidth * (3 / 5);
    //conditional sizing if graph is expanded/compressed
    if (this.expanded) {
      canvasHeight = curveGraph.clientHeight * 0.9;
    }

    if (this.canvasWidth < 400) {
      this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      if (!this.expanded) {
        this.margin = { top: 10, right: 50, bottom: 75, left: 120 };
      }
      else {
        this.margin = { top: 10, right: 120, bottom: 75, left: 120 };
      }
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = canvasHeight - this.margin.top - this.margin.bottom;
  }
  //setup
  createSVG() {
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
  }

  setAxisLabels() {
    let xAxisLabel: string = "Flow (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanFlowRate) + ")";
    let yAxisLabel: string = "Pressure (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanPressureMeasurement) + ")";
    if (this.equipmentType == 'pump') {
      xAxisLabel = "Flow (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.flowMeasurement) + ")";
      yAxisLabel = "Head (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.distanceMeasurement) + ")";
    }
    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, xAxisLabel);
    this.lineChartHelperService.setYAxisLabel(this.svg, this.width, this.height, -60, 0, yAxisLabel);
  }

  setAxis() {
    d3.select(this.ngChart.nativeElement).selectAll('.axis-label').remove();
    let domainAndRanges = this.systemAndEquipmentCurveGraphService.getGraphDomainAndRange(this.isEquipmentCurveShown, this.isSystemCurveShown, this.equipmentType, this.width, this.height, this.baselineEquipmentCurveDataPairs, this.modifiedEquipmentCurveDataPairs, this.pumpCurveData, this.fanCurveData);
    this.xDomain = domainAndRanges.xDomain;
    this.yDomain = domainAndRanges.yDomain;
    this.x = this.lineChartHelperService.setScale("linear", domainAndRanges.xRange, this.xDomain);
    this.systemAndEquipmentCurveGraphService.xRef = this.x;
    this.y = this.lineChartHelperService.setScale("linear", domainAndRanges.yRange, this.yDomain);
    this.systemAndEquipmentCurveGraphService.yRef = this.y;
    let tickFormat = d3.format("d")
    this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 5, null, null, null, tickFormat);
    this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 6, 0, 0, 15, null);
  }

  //equipment curves
  drawEquipmentCurve() {
    if (this.isEquipmentCurveShown == true) {
      if (this.baselineEquipmentCurveDataPairs != undefined && this.modifiedEquipmentCurveDataPairs != undefined) {
        this.drawBaselineEquipmentCurve(this.baselineEquipmentCurveDataPairs);
        if (this.isEquipmentModificationShown == true) {
          this.drawModificationEquipmentCurve(this.modifiedEquipmentCurveDataPairs);
        } else {
          d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
        }
      }
    } else if (this.ngChart) {
      d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
      d3.select(this.ngChart.nativeElement).selectAll('.baseline-equipment-curve').remove();
    }
  }


  drawBaselineEquipmentCurve(baselineData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('#focusBaselineEquipmentCurve').remove();
    d3.select(this.ngChart.nativeElement).selectAll('.baseline-equipment-curve').remove();
    this.baselineEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.baselineEquipmentLine = this.lineChartHelperService.drawLine(this.baselineEquipmentLine, this.x, this.y, baselineData, 'baseline-equipment-curve');
    this.focusBaselineEquipmentCurve = this.lineChartHelperService.appendFocus(this.svg, "focusBaselineEquipmentCurve");
  }

  drawModificationEquipmentCurve(modificationData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('#focusModificationEquipmentCurve').remove();
    d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
    this.modificationEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
    this.modificationEquipmentLine = this.lineChartHelperService.drawLine(this.modificationEquipmentLine, this.x, this.y, modificationData, 'modification-equipment-curve');
    this.focusModificationEquipmentCurve = this.lineChartHelperService.appendFocus(this.svg, "focusModificationEquipmentCurve");
  }

  //system curve
  drawSystemCurve() {
    d3.select(this.ngChart.nativeElement).selectAll('.system-curve').remove();
    if (this.isSystemCurveShown == true && this.systemCurveRegressionData != undefined) {
      this.systemCurveLine = this.lineChartHelperService.appendLine(this.svg, "red", "2px", "stroke-dasharray", "3, 3");
      this.systemCurveLine = this.lineChartHelperService.drawLine(this.systemCurveLine, this.x, this.y, this.systemCurveRegressionData, 'system-curve');
      this.focusSystemCurve = this.lineChartHelperService.appendFocus(this.svg, "focusSystemCurve");
    }
  }

  addIntersectionPoints() {
    d3.select(this.ngChart.nativeElement).selectAll('#intersectBaseline').remove();
    d3.select(this.ngChart.nativeElement).selectAll('#intersectModification').remove();
    let intersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.baselineEquipmentCurveDataPairs, this.systemCurveRegressionData);
    if (intersectionPoint != undefined) {
      this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.next(intersectionPoint);
    }
    if (this.isEquipmentModificationShown && this.modifiedEquipmentCurveDataPairs != undefined) {
      let intersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.modifiedEquipmentCurveDataPairs, this.systemCurveRegressionData);
      if (intersectionPoint != undefined) {
        this.systemAndEquipmentCurveGraphService.modificationIntersectionPoint.next(intersectionPoint);
      }
    }
  }

  initTooltipData() {
    this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    this.tooltipData = this.systemAndEquipmentCurveGraphService.initTooltipData(this.settings, this.equipmentType, this.isEquipmentCurveShown, this.isEquipmentModificationShown, this.isSystemCurveShown);
  }

  updateMouseOverDriver() {
    this.initTooltipData();
    //get all data
    let allData: Array<Array<any>> = new Array<Array<any>>();
    if (this.isEquipmentCurveShown && this.baselineEquipmentCurveDataPairs != undefined) {
      allData.push(this.baselineEquipmentCurveDataPairs)
      if (this.isEquipmentModificationShown && this.modifiedEquipmentCurveDataPairs != undefined) {
        allData.push(this.modifiedEquipmentCurveDataPairs);
      }
    }
    if (this.isSystemCurveShown) {
      if (this.equipmentType == 'pump' && this.systemCurveRegressionData != undefined) {
        allData.push(this.systemCurveRegressionData);
      } else if (this.equipmentType == 'fan' && this.systemCurveRegressionData != undefined) {
        allData.push(this.systemCurveRegressionData);
      }
    }
    let allD: Array<any> = new Array<any>();
    let allFocus: Array<d3.Selection<any>> = new Array<d3.Selection<any>>();
    if (this.focusBaselineEquipmentCurve != undefined) {
      allFocus.push(this.focusBaselineEquipmentCurve)
    }
    if (this.focusModificationEquipmentCurve != undefined) {
      allFocus.push(this.focusModificationEquipmentCurve)
    }
    if (this.focusSystemCurve != undefined) {
      allFocus.push(this.focusSystemCurve)
    }

    let detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
    let detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);
    let format = d3.format(",.2f");
    this.lineChartHelperService.mouseOverDriver(
      this.svg,
      detailBox,
      detailBoxPointer,
      this.margin,
      allD,
      allFocus,
      allData,
      this.x,
      this.y,
      format,
      format,
      this.tooltipData,
      this.canvasWidth,
      ["fluidPower"]
    );
  }

  buildTable() {
    let dArray: Array<any> = this.lineChartHelperService.getDArray();
    this.systemAndEquipmentCurveGraphService.selectedDataPoint.next(dArray);
  }
}


