import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { LineChartHelperService } from '../../../shared/helper-services/line-chart-helper.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
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
  x: any;
  y: any;
  isGridToggled: boolean = false;
  constructor(private lineChartHelperService: LineChartHelperService, private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    // this.systemAndEquipmentCurveService.byDataInputs
    // this.systemAndEquipmentCurveService.byEquationInputs
    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      this.isEquipmentCurveShown == (val == 'open');
      this.setColumnTitles();
    });
    this.equipmentInputsSub = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(val => {
      if (val) {
        this.isEquipmentModificationShown = (val.baselineMeasurement != val.modificationMeasurementOption);
        this.setColumnTitles();
      }
    });
    // this.systemAndEquipmentCurveService.fanSystemCurveData
    // this.systemAndEquipmentCurveService.pumpSystemCurveData
    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      this.isSystemCurveShown = (val == 'open');
      this.setColumnTitles();
    })
    this.baselineEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.subscribe(baselinePair => {
      if (baselinePair != undefined) {
        let modificationPairs: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.getValue();
        if (modificationPairs != undefined) {
          this.setAxis(baselinePair, modificationPairs);
          this.drawBaselineEquipmentCurve(baselinePair);
        }
      }
    });
    this.modificationEquipmentCurveDataPairsSub = this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.subscribe(modificationPairs => {
      if (modificationPairs != undefined) {
        let baselinePairs: Array<{ x: number, y: number }> = this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.getValue();
        if (baselinePairs != undefined) {
          this.setAxis(baselinePairs, modificationPairs);
          let equipmentInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
          if (equipmentInputs != undefined && equipmentInputs.baselineMeasurement != equipmentInputs.modifiedMeasurement) {
            this.drawModificationEquipmentCurve(modificationPairs);
          } else {
            d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
          }
        }
      }
    });

  }

  ngOnDestroy() {
    this.equipmentInputsSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.baselineEquipmentCurveDataPairsSub.unsubscribe();
    // this.modificationEquipmentCurveDataPairsSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.setGraphSize();
    this.createSVG();
    this.setAxisLabels();
  }

  setGraphSize() {
    //need to update curveGraph to grab a new containing element 'panelChartContainer'
    //make sure to update html container in the graph component as well
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

  setAxis(baselineEquipmentData: Array<{ x: number, y: number }>, modificationEqupmentData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('.axis-label').remove();
    let combinedData: Array<{ x: number, y: number }> = baselineEquipmentData.concat(modificationEqupmentData);
    let maxX: { x: number, y: number } = _.maxBy(combinedData, (data) => { return data.x });
    let maxY: { x: number, y: number } = _.maxBy(combinedData, (data) => { return data.y });
    // let maxX = this.getXScaleMax(data, dataModification, this.pointOne.form.controls.flowRate.value, this.pointTwo.form.controls.flowRate.value);
    // let maxY = this.getYScaleMax(data, dataModification, this.pointOne.form.controls.head.value, this.pointTwo.form.controls.head.value);
    let paddingX = maxX.x * 0.1;
    let paddingY = maxY.y * 0.1;
    //create x and y graph scales
    let xRange: { min: number, max: number } = { min: 0, max: this.width };
    let xDomain: { min: number, max: number } = { min: 0, max: maxX.x + paddingX };
    let yRange: { min: number, max: number } = { min: this.height, max: 0 };
    let yDomain: { min: number, max: number } = { min: 0, max: maxY.y + paddingY };
    this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);
    this.y = this.lineChartHelperService.setScale("linear", yRange, yDomain);
    let tickFormat = d3.format("d")
    this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 5, null, null, null, tickFormat);
    this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 6, 0, 0, 15, null);
  }

  setScales() {

  }

  setColumnTitles() {
    this.columnTitles = this.systemAndEquipmentCurveGraphService.initColumnTitles(this.settings, this.equipmentType, this.isEquipmentCurveShown, this.isEquipmentModificationShown, this.isSystemCurveShown);
  }

  drawBaselineEquipmentCurve(baselineData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('.baseline-equipment-curve').remove();
    this.baselineEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.baselineEquipmentLine = this.lineChartHelperService.drawLine(this.baselineEquipmentLine, this.x, this.y, baselineData, 'baseline-equipment-curve');
    // this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
  }

  drawModificationEquipmentCurve(baselineData: Array<{ x: number, y: number }>) {
    d3.select(this.ngChart.nativeElement).selectAll('.modification-equipment-curve').remove();
    this.modificationEquipmentLine = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
    this.modificationEquipmentLine = this.lineChartHelperService.drawLine(this.modificationEquipmentLine, this.x, this.y, baselineData, 'modification-equipment-curve');
    // this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
  }
}
