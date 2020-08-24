import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { LineChartHelperService } from '../../../shared/helper-services/line-chart-helper.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { RegressionEquationsService } from '../regression-equations.service';
import { EquipmentInputs, FanSystemCurveData, PumpSystemCurveData } from '../../../shared/models/system-and-equipment-curve';

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
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setGraphSize();
    this.createSVG();
    this.setAxisLabels();
    this.setAxis();
    this.createGraph();
  }

  expanded: boolean;
  width: number;
  height: number;
  margin: { top: number, right: number, bottom: number, left: number };
  isSystemCurveShown: boolean;
  isEquipmentCurveShown: boolean;
  isEquipmentModificationShown: boolean;

  //subs
  updateGraphSub: Subscription;

  baselineEquipmentLine: d3.Selection<any>;
  modificationEquipmentLine: d3.Selection<any>;
  systemCurveLine: d3.Selection<any>;

  isGridToggled: boolean = false;
  xDomain: { min: number, max: number };
  yDomain: { min: number, max: number };
  focusBaselineEquipmentCurve: d3.Selection<any>;
  focusModificationEquipmentCurve: d3.Selection<any>;
  focusSystemCurve: d3.Selection<any>;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;
  canvasWidth: number;

  createGraphTimer: any;
  hoverBtnExport: boolean = false;
  hoverBtnGridLines: boolean = false;
  hoverBtnExpand: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayExportTooltip: boolean = false;
  displayGridLinesTooltip: boolean = false;
  displayExpandTooltip: boolean = false;
  displayCollapseTooltip: boolean = false;
  constructor(private lineChartHelperService: LineChartHelperService, public systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.updateGraphSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.setGraphSize();
    this.updateGraphSub = this.systemAndEquipmentCurveService.updateGraph.subscribe(val => {
      if (val == true) {
        this.isSystemCurveShown = (this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'open');
        this.isEquipmentCurveShown = (this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open');
        this.isEquipmentModificationShown = (this.systemAndEquipmentCurveService.pumpModificationCollapsed.getValue() == 'open' || this.systemAndEquipmentCurveService.fanModificationCollapsed.getValue() == 'open');
        this.createSVG();
        this.setAxisLabels();
        this.setAxis();
        this.createGraph();
        this.systemAndEquipmentCurveService.updateGraph.next(false);
      }
    });
  }


  createGraph() {
    if (this.createGraphTimer != undefined) {
      clearTimeout(this.createGraphTimer);
    }
    this.createGraphTimer = setTimeout(() => {
      this.drawSystemCurve();
      this.drawEquipmentCurve();
      if (this.isSystemCurveShown && this.isEquipmentCurveShown && this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined && this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.length != 0 && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined && this.systemAndEquipmentCurveService.systemCurveRegressionData.length != 0) {
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
    this.canvasWidth = this.ngChartContainer.nativeElement.clientWidth;
    let canvasHeight: number = this.canvasWidth * (3 / 5);
    //conditional sizing if graph is expanded/compressed
    if (this.expanded) {
      canvasHeight = this.ngChartContainer.nativeElement.clientHeight * 0.9;
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
    this.systemAndEquipmentCurveGraphService.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.systemAndEquipmentCurveGraphService.svg = this.lineChartHelperService.applyFilter(this.systemAndEquipmentCurveGraphService.svg);
    this.systemAndEquipmentCurveGraphService.svg = this.lineChartHelperService.appendRect(this.systemAndEquipmentCurveGraphService.svg, this.width, this.height);
    this.cd.detectChanges();
  }

  setAxisLabels() {
    let xAxisLabel: string = "Flow (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanFlowRate) + ")";
    let yAxisLabel: string = "Pressure (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.fanPressureMeasurement) + ")";
    if (this.equipmentType == 'pump') {
      xAxisLabel = "Flow (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.flowMeasurement) + ")";
      yAxisLabel = "Head (" + this.systemAndEquipmentCurveGraphService.getDisplayUnit(this.settings.distanceMeasurement) + ")";
    }
    this.lineChartHelperService.setXAxisLabel(this.systemAndEquipmentCurveGraphService.svg, this.width, this.height, 0, 70, xAxisLabel);
    this.lineChartHelperService.setYAxisLabel(this.systemAndEquipmentCurveGraphService.svg, this.width, this.height, -60, 0, yAxisLabel);
  }

  setAxis() {
    d3.select(this.ngChart.nativeElement).selectAll('.axis-label').remove();
    let maxFlowRate: number = this.systemAndEquipmentCurveService.getMaxFlowRate(this.equipmentType);
    let domainAndRanges = this.systemAndEquipmentCurveGraphService.getGraphDomainAndRange(
      this.isEquipmentCurveShown,
      this.isSystemCurveShown,
      this.equipmentType,
      this.width,
      this.height,
      this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs,
      this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs,
      this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue(),
      this.systemAndEquipmentCurveService.fanSystemCurveData.getValue(),
      maxFlowRate
    );
    this.xDomain = domainAndRanges.xDomain;
    this.yDomain = domainAndRanges.yDomain;
    this.systemAndEquipmentCurveGraphService.xRef = this.lineChartHelperService.setScale("linear", domainAndRanges.xRange, this.xDomain);
    this.systemAndEquipmentCurveGraphService.yRef = this.lineChartHelperService.setScale("linear", domainAndRanges.yRange, this.yDomain);
    let tickFormat = d3.format("d")
    this.lineChartHelperService.setXAxis(this.systemAndEquipmentCurveGraphService.svg, this.systemAndEquipmentCurveGraphService.xRef, this.height, this.isGridToggled, 5, null, null, null, tickFormat);
    this.lineChartHelperService.setYAxis(this.systemAndEquipmentCurveGraphService.svg, this.systemAndEquipmentCurveGraphService.yRef, this.width, this.isGridToggled, 6, 0, 0, 15, null);
  }

  //equipment curves
  drawEquipmentCurve() {
    if (this.isEquipmentCurveShown == true) {
      if (this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
        this.drawBaselineEquipmentCurve(this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs);
        if (this.isEquipmentModificationShown == true) {
          this.drawModificationEquipmentCurve(this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs);
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
    this.baselineEquipmentLine = this.lineChartHelperService.appendLine(this.systemAndEquipmentCurveGraphService.svg, "#145A32", "2px");
    this.baselineEquipmentLine = this.lineChartHelperService.drawLine(this.baselineEquipmentLine, this.systemAndEquipmentCurveGraphService.xRef, this.systemAndEquipmentCurveGraphService.yRef, baselineData, 'baseline-equipment-curve');
    this.focusBaselineEquipmentCurve = this.lineChartHelperService.appendFocus(this.systemAndEquipmentCurveGraphService.svg, "focusBaselineEquipmentCurve");
  }

  drawModificationEquipmentCurve(modificationData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('#focusModificationEquipmentCurve').remove();
    d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
    this.modificationEquipmentLine = this.lineChartHelperService.appendLine(this.systemAndEquipmentCurveGraphService.svg, "#3498DB", "2px");
    this.modificationEquipmentLine = this.lineChartHelperService.drawLine(this.modificationEquipmentLine, this.systemAndEquipmentCurveGraphService.xRef, this.systemAndEquipmentCurveGraphService.yRef, modificationData, 'modification-equipment-curve');
    this.focusModificationEquipmentCurve = this.lineChartHelperService.appendFocus(this.systemAndEquipmentCurveGraphService.svg, "focusModificationEquipmentCurve");
  }

  //system curve
  drawSystemCurve() {
    d3.select(this.ngChart.nativeElement).selectAll('.system-curve').remove();
    if (this.isSystemCurveShown == true && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
      this.systemCurveLine = this.lineChartHelperService.appendLine(this.systemAndEquipmentCurveGraphService.svg, "red", "2px", "stroke-dasharray", "3, 3");
      this.systemCurveLine = this.lineChartHelperService.drawLine(this.systemCurveLine, this.systemAndEquipmentCurveGraphService.xRef, this.systemAndEquipmentCurveGraphService.yRef, this.systemAndEquipmentCurveService.systemCurveRegressionData, 'system-curve');
      this.focusSystemCurve = this.lineChartHelperService.appendFocus(this.systemAndEquipmentCurveGraphService.svg, "focusSystemCurve");
    }
  }

  addIntersectionPoints() {
    d3.select(this.ngChart.nativeElement).selectAll('#intersectBaseline').remove();
    d3.select(this.ngChart.nativeElement).selectAll('#intersectModification').remove();
    let baselineIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.settings, this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs);
    if (baselineIntersectionPoint != undefined) {
      this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.next(baselineIntersectionPoint);
    }
    if (this.isEquipmentModificationShown && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
      let modifiedIntersectionPoint: { x: number, y: number, fluidPower: number } = this.systemAndEquipmentCurveGraphService.getModifiedIntersectionPoint(baselineIntersectionPoint, this.settings, this.equipmentType, this.systemAndEquipmentCurveService.equipmentInputs.getValue());
      if (modifiedIntersectionPoint != undefined) {
        this.systemAndEquipmentCurveGraphService.modificationIntersectionPoint.next(modifiedIntersectionPoint);
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
    if (this.isEquipmentCurveShown && this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs != undefined) {
      allData.push(this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs)
      if (this.isEquipmentModificationShown && this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs != undefined) {
        allData.push(this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs);
      }
    }
    if (this.isSystemCurveShown) {
      if (this.equipmentType == 'pump' && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
        allData.push(this.systemAndEquipmentCurveService.systemCurveRegressionData);
      } else if (this.equipmentType == 'fan' && this.systemAndEquipmentCurveService.systemCurveRegressionData != undefined) {
        allData.push(this.systemAndEquipmentCurveService.systemCurveRegressionData);
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
      this.systemAndEquipmentCurveGraphService.svg,
      detailBox,
      detailBoxPointer,
      this.margin,
      allD,
      allFocus,
      allData,
      this.systemAndEquipmentCurveGraphService.xRef,
      this.systemAndEquipmentCurveGraphService.yRef,
      format,
      format,
      this.tooltipData,
      this.canvasWidth,
      ["fluidPower"]
    );
  }

  addDataPoint() {
    let dArray: Array<any> = this.lineChartHelperService.getDArray();
    this.systemAndEquipmentCurveGraphService.selectedDataPoint.next(dArray);
  }

  // ========== export/gridline tooltip functions ==========
  // if you get a large angular error, make sure to add SimpleTooltipComponent to the imports of the calculator's module
  // for example, check motor-performance-graph.module.ts
  initTooltip(btnType: string) {
    if (btnType === 'btnExportChart') {
      this.hoverBtnExport = true;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    else if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 700);
  }

  hideTooltip(btnType: string) {

    if (btnType === 'btnExportChart') {
      this.hoverBtnExport = false;
      this.displayExportTooltip = false;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
    else if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
  }

  checkHover(btnType: string) {
    if (btnType === 'btnExportChart') {
      if (this.hoverBtnExport) {
        this.displayExportTooltip = true;
      }
      else {
        this.displayExportTooltip = false;
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
    else if (btnType === 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
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


  downloadChart() {
    this.systemAndEquipmentCurveGraphService.downloadChart(this.ngChart, this.equipmentType);
  }

  toggleGrid() {
    this.isGridToggled = !this.isGridToggled;
    this.setAxis();
    this.createGraph();
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.setGraphSize();
      this.createSVG();
      this.setAxisLabels();
      this.setAxis();
      this.createGraph();
    }, 200);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.setGraphSize();
      this.createSVG();
      this.setAxisLabels();
      this.setAxis();
      this.createGraph();
    }, 200);
  }
  // ========== end tooltip functions ==========
}


