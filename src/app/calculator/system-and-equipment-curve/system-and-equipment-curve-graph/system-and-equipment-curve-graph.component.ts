import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { LineChartHelperService } from '../../../shared/helper-services/line-chart-helper.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';


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
    // this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView
  }

  ngOnDestroy() {
    this.equipmentInputsSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
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
    //x and y scales are required for system curve data, need to check max x/y values from all lines
    // this.maxX = this.getXScaleMax(data, dataModification, this.pointOne.form.controls.flowRate.value, this.pointTwo.form.controls.flowRate.value);
    // this.maxY = this.getYScaleMax(data, dataModification, this.pointOne.form.controls.head.value, this.pointTwo.form.controls.head.value);
    // let paddingX = this.maxX.x * 0.1;
    // let paddingY = this.maxY.y * 0.1;
    //reset and init chart area
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
    // let maxX = this.getXScaleMax(data, dataModification, this.pointOne.form.controls.flowRate.value, this.pointTwo.form.controls.flowRate.value);
    // let maxY = this.getYScaleMax(data, dataModification, this.pointOne.form.controls.head.value, this.pointTwo.form.controls.head.value);
    
    // //create x and y graph scales
    // let xRange: { min: number, max: number } = { min: 0, max: this.width };
    // let xDomain: { min: number, max: number } = { min: 0, max: this.maxX.x + paddingX };
    // let yRange: { min: number, max: number } = { min: this.height, max: 0 };
    // let yDomain: { min: number, max: number } = { min: 0, max: this.maxY.y + paddingY };
    // this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);
    // this.y = this.lineChartHelperService.setScale("linear", yRange, yDomain);
    // this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 5, null, null, null, tickFormat);
    // this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 6, 0, 0, 15, null);
  }

  setScales() {

  }

  setColumnTitles() {
    this.columnTitles = this.systemAndEquipmentCurveGraphService.initColumnTitles(this.settings, this.equipmentType, this.isEquipmentCurveShown, this.isEquipmentModificationShown, this.isSystemCurveShown);
  }
}
