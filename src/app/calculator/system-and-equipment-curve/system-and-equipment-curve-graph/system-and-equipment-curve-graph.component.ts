import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { LineChartHelperService } from '../../../shared/helper-services/line-chart-helper.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService, PumpSystemCurveData, FanSystemCurveData } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { EquipmentInputs } from '../equipment-curve/equipment-curve.service';
import { RegressionEquationsService } from '../regression-equations/regression-equations.service';

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
  columnTitles: Array<string>;
  isSystemCurveShown: boolean;
  isEquipmentCurveShown: boolean;
  isEquipmentModificationShown: boolean;

  equipmentCurveCollapsedSub: Subscription;
  systemCurveCollapsedSub: Subscription;
  equipmentInputsSub: Subscription;
  baselineEquipmentCurveDataPairsSub: Subscription;
  modificationEquipmentCurveDataPairsSub: Subscription;
  curveDataSubscription: Subscription;

  baselineEquipmentLine: d3.Selection<any>;
  modificationEquipmentLine: d3.Selection<any>;
  systemCurveLine: d3.Selection<any>;
  x: any;
  y: any;
  isGridToggled: boolean = false;
  xDomain: { min: number, max: number };
  yDomain: { min: number, max: number }
  constructor(private lineChartHelperService: LineChartHelperService, private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.equipmentInputsSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.baselineEquipmentCurveDataPairsSub.unsubscribe();
    this.modificationEquipmentCurveDataPairsSub.unsubscribe();
    this.curveDataSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.setGraphSize();
    this.createSVG();
    this.setAxisLabels();
    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      if (val != undefined) {
        this.isEquipmentCurveShown = (val == 'open');
        this.setColumnTitles();
        this.createGraph();
      }
    });
    this.equipmentInputsSub = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(val => {
      if (val != undefined) {
        this.isEquipmentModificationShown = (val.baselineMeasurement != val.modificationMeasurementOption);
        this.setColumnTitles();
        this.createGraph();
      }
    });
    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      if (val != undefined) {
        this.isSystemCurveShown = (val == 'open');
        this.setColumnTitles();
        this.createGraph();
      }
    });
    this.baselineEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.subscribe(baselinePair => {
      if (baselinePair != undefined) {
        this.createGraph();
      }
    });
    this.modificationEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.subscribe(modificationPairs => {
      if (modificationPairs != undefined) {
        this.createGraph();
      }
    });

    if (this.equipmentType == 'pump') {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.pumpSystemCurveData.subscribe(pumpSystemCurve => {
        if (pumpSystemCurve != undefined) {
          this.createGraph();
        }
      });
    } else {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.fanSystemCurveData.subscribe(fanSystemCurve => {
        if (fanSystemCurve != undefined) {
          this.createGraph();
        }
      });
    }
  }

  createGraph() {
    this.setAxis();
    this.drawSystemCurve();
    this.drawEquipmentCurve();
    if (this.isSystemCurveShown && this.isEquipmentCurveShown) {
      this.addIntersectionPoints();
    } else {
      d3.select(this.ngChart.nativeElement).selectAll('#intersectBaseline').remove();
      d3.select(this.ngChart.nativeElement).selectAll('#intersectModification').remove();
    }
  }

  //setup
  setGraphSize() {
    let curveGraph = this.ngChartContainer.nativeElement;
    let canvasWidth: number = curveGraph.clientWidth;
    let canvasHeight: number = canvasWidth * (3 / 5);
    //conditional sizing if graph is expanded/compressed
    if (this.expanded) {
      canvasHeight = curveGraph.clientHeight * 0.9;
    }

    if (canvasWidth < 400) {
      this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      if (!this.expanded) {
        this.margin = { top: 10, right: 50, bottom: 75, left: 120 };
      }
      else {
        this.margin = { top: 10, right: 120, bottom: 75, left: 120 };
      }
    }
    this.width = canvasWidth - this.margin.left - this.margin.right;
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
    let domainAndRanges = this.systemAndEquipmentCurveGraphService.getGraphDomainAndRange(this.isEquipmentCurveShown, this.isSystemCurveShown, this.equipmentType, this.width, this.height);
    this.xDomain = domainAndRanges.xDomain;
    this.yDomain = domainAndRanges.yDomain;
    this.x = this.lineChartHelperService.setScale("linear", domainAndRanges.xRange, this.xDomain);
    this.y = this.lineChartHelperService.setScale("linear", domainAndRanges.yRange, this.yDomain);
    let tickFormat = d3.format("d")
    this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 5, null, null, null, tickFormat);
    this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 6, 0, 0, 15, null);
  }

  setColumnTitles() {
    this.columnTitles = this.systemAndEquipmentCurveGraphService.initColumnTitles(this.settings, this.equipmentType, this.isEquipmentCurveShown, this.isEquipmentModificationShown, this.isSystemCurveShown);
  }

  //equipment curves
  drawEquipmentCurve() {
    if (this.isEquipmentCurveShown == true) {
      let baselinePair: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.getValue();
      if (baselinePair != undefined) {
        let modificationPairs: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.getValue();
        if (modificationPairs != undefined) {
          this.setAxis();
          this.drawBaselineEquipmentCurve(baselinePair);
          let equipmentInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
          if (equipmentInputs && (equipmentInputs.baselineMeasurement != equipmentInputs.modifiedMeasurement)) {
            this.drawModificationEquipmentCurve(modificationPairs);
          } else {
            d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
          }
        }
      }
    } else if (this.ngChart) {
      d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
      d3.select(this.ngChart.nativeElement).selectAll('.baseline-equipment-curve').remove();
    }
  }


  drawBaselineEquipmentCurve(baselineData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('.baseline-equipment-curve').remove();
    this.baselineEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.baselineEquipmentLine = this.lineChartHelperService.drawLine(this.baselineEquipmentLine, this.x, this.y, baselineData, 'baseline-equipment-curve');
    // this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
  }

  drawModificationEquipmentCurve(modificationData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
    this.modificationEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
    this.modificationEquipmentLine = this.lineChartHelperService.drawLine(this.modificationEquipmentLine, this.x, this.y, modificationData, 'modification-equipment-curve');
    // this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
  }

  //system curve
  drawSystemCurve() {
    d3.select(this.ngChart.nativeElement).selectAll('.system-curve').remove();
    if (this.equipmentType == 'pump' && this.isSystemCurveShown == true) {
      let pumpSystemCurveData: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue();
      if (pumpSystemCurveData != undefined) {
        this.drawPumpSystemCurve(pumpSystemCurveData);
      }
    } else if (this.equipmentType == 'fan' && this.isSystemCurveShown == true) {
      let fanSystemCurveData: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.getValue();
      if (fanSystemCurveData != undefined) {
        this.drawFanSystemCurve(fanSystemCurveData);
      }
    }
  }

  drawPumpSystemCurve(pumpSystemCurveData: PumpSystemCurveData) {
    let pumpSystemCurveRegressionData = this.regressionEquationsService.calculatePumpSystemCurveData(pumpSystemCurveData, this.xDomain.max, this.settings);
    this.systemCurveLine = this.lineChartHelperService.appendLine(this.svg, "red", "2px", "stroke-dasharray", "3, 3");
    this.systemCurveLine = this.lineChartHelperService.drawLine(this.systemCurveLine, this.x, this.y, pumpSystemCurveRegressionData, 'system-curve');
    // this.focusSystem = this.lineChartHelperService.appendFocus(this.svg, "focusSystem");
  }

  drawFanSystemCurve(fanSystemCurveData: FanSystemCurveData) {
    let fanSystemCurveRegressionData = this.regressionEquationsService.calculateFanSystemCurveData(fanSystemCurveData, this.xDomain.max, this.settings);
    this.systemCurveLine = this.lineChartHelperService.appendLine(this.svg, "red", "2px", "stroke-dasharray", "3, 3");
    this.systemCurveLine = this.lineChartHelperService.drawLine(this.systemCurveLine, this.x, this.y, fanSystemCurveRegressionData, 'system-curve');
    // this.focusSystem = this.lineChartHelperService.appendFocus(this.svg, "focusSystem");
  }

  addIntersectionPoints() {
    d3.select(this.ngChart.nativeElement).selectAll('#intersectBaseline').remove();
    d3.select(this.ngChart.nativeElement).selectAll('#intersectModification').remove();
    let baselineEquipmentCurveDataPairs: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.getValue();
    let intersectionPoint: { x: number, y: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.xDomain, this.settings, baselineEquipmentCurveDataPairs);
    if (intersectionPoint != undefined) {
      this.lineChartHelperService.tableFocusHelper(this.svg, "intersectBaseline", "#000", "#000", this.x(intersectionPoint.x), this.y(intersectionPoint.y), 'OP1');
    }
    let equipementInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
    if (equipementInputs.baselineMeasurement != equipementInputs.modifiedMeasurement) {
      let modificaitionEquipmentCurvePairs: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.getValue();
      let intersectionPoint: { x: number, y: number } = this.systemAndEquipmentCurveGraphService.getIntersectionPoint(this.equipmentType, this.xDomain, this.settings, modificaitionEquipmentCurvePairs);
      if (intersectionPoint != undefined) {
        this.lineChartHelperService.tableFocusHelper(this.svg, "intersectModification", "#000", "#000", this.x(intersectionPoint.x), this.y(intersectionPoint.y), 'OP2');
      }
    }

  }
}


