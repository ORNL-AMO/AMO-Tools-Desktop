import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { LineChartHelperService } from '../../../shared/helper-services/line-chart-helper.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService, PumpSystemCurveData, FanSystemCurveData } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { EquipmentInputs } from '../equipment-curve/equipment-curve.service';

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

  baselineEquipmentLine: d3.Selection<any>;
  modificationEquipmentLine: d3.Selection<any>;
  systemCurveLine: d3.Selection<any>;
  x: any;
  y: any;
  isGridToggled: boolean = false;
  xDomain: { min: number, max: number };
  yDomain: { min: number, max: number }
  constructor(private lineChartHelperService: LineChartHelperService, private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    // this.systemAndEquipmentCurveService.byDataInputs
    // this.systemAndEquipmentCurveService.byEquationInputs
    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      if (val != undefined) {
        this.isEquipmentCurveShown = (val == 'open');
        this.setColumnTitles();
        this.setAxis();
        this.drawEquipmentCurve();
      }
    });
    this.equipmentInputsSub = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(val => {
      if (val != undefined) {
        this.isEquipmentModificationShown = (val.baselineMeasurement != val.modificationMeasurementOption);
        this.setColumnTitles();
        this.setAxis();
      }
    });
    // this.systemAndEquipmentCurveService.fanSystemCurveData
    // this.systemAndEquipmentCurveService.pumpSystemCurveData
    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      this.isSystemCurveShown = (val == 'open');
      this.setColumnTitles();
      this.setAxis();
    });
    this.baselineEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.subscribe(baselinePair => {
      if (baselinePair != undefined) {
        this.setAxis();
        this.drawEquipmentCurve();
      }
    });
    this.modificationEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.subscribe(modificationPairs => {
      if (modificationPairs != undefined) {
        this.setAxis();
        this.drawEquipmentCurve();
      }
    });
  }

  ngOnDestroy() {
    this.equipmentInputsSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.baselineEquipmentCurveDataPairsSub.unsubscribe();
    this.modificationEquipmentCurveDataPairsSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.setGraphSize();
    this.createSVG();
    this.setAxisLabels();
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
    let maxX: { x: number, y: number } = { x: 0, y: 0 };
    let maxY: { x: number, y: number } = { x: 0, y: 0 };
    d3.select(this.ngChart.nativeElement).selectAll('.axis-label').remove();

    if (this.isEquipmentCurveShown == true) {
      let baselineEquipmentData: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.getValue();
      let modificationEqupmentData: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.getValue();
      let combinedData: Array<{ x: number, y: number }> = baselineEquipmentData.concat(modificationEqupmentData);
      maxX = _.maxBy(combinedData, (data) => { return data.x });
      maxY = _.maxBy(combinedData, (data) => { return data.y });
    }

    if (this.isSystemCurveShown == true) {
      if (this.equipmentType == 'pump') {
        let pumpSystemCurveData: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue();
        let maxXValue: number = _.max([maxX.x, pumpSystemCurveData.pointOneFlowRate, pumpSystemCurveData.pointTwoFlowRate]);
        maxX.x = maxXValue;
        let maxYValue: number = _.max([maxY.y, pumpSystemCurveData.pointOneHead, pumpSystemCurveData.pointTwoHead]);
        maxY.y = maxYValue;
      } else if (this.equipmentType == 'fan') {
        let fanSystemCurveData: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.getValue();
        let maxXValue: number = _.max([maxX.x, fanSystemCurveData.pointOneFlowRate, fanSystemCurveData.pointTwoFlowRate]);
        maxX.x = maxXValue;
        let maxYValue: number = _.max([maxY.y, fanSystemCurveData.pointOnePressure, fanSystemCurveData.pointTwoPressure]);
        maxY.y = maxYValue;
      }
    }

    let paddingX = maxX.x * 0.1;
    let paddingY = maxY.y * 0.1;
    //create x and y graph scales
    let xRange: { min: number, max: number } = { min: 0, max: this.width };
    this.xDomain = { min: 0, max: maxX.x + paddingX };
    let yRange: { min: number, max: number } = { min: this.height, max: 0 };
    this.yDomain = { min: 0, max: maxY.y + paddingY };
    this.x = this.lineChartHelperService.setScale("linear", xRange, this.xDomain);
    this.y = this.lineChartHelperService.setScale("linear", yRange, this.yDomain);
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
          this.drawBaselineEquipmentCurve();
          if (this.isEquipmentCurveShown) {
            this.drawModificationEquipmentCurve();
          }
        }
      }
    } else if (this.ngChart) {
      d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
      d3.select(this.ngChart.nativeElement).selectAll('.baseline-equipment-curve').remove();
    }
  }


  drawBaselineEquipmentCurve() {
    d3.select(this.ngChart.nativeElement).selectAll('.baseline-equipment-curve').remove();
    let baselineData: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.getValue();
    this.baselineEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.baselineEquipmentLine = this.lineChartHelperService.drawLine(this.baselineEquipmentLine, this.x, this.y, baselineData, 'baseline-equipment-curve');
    // this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
  }

  drawModificationEquipmentCurve() {
    d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
    let modificationData: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.getValue();
    this.modificationEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
    this.modificationEquipmentLine = this.lineChartHelperService.drawLine(this.modificationEquipmentLine, this.x, this.y, modificationData, 'modification-equipment-curve');
    // this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
  }

  //system curves
  drawSystemCurve() {
    // d3.select(this.ngChart.nativeElement).selectAll('.system-curve').remove();
    // let systemCurveData: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.getValue();
    // this.systemCurveLine = this.lineChartHelperService.appendLine(this.svg, "red", "2px", "stroke-dasharray", "3, 3");
    // this.systemCurveLine = this.lineChartHelperService.drawLine(this.systemCurveLine, this.x, this.y, dataSystem);
    // this.focusSystem = this.lineChartHelperService.appendFocus(this.svg, "focusSystem");
  }
}
