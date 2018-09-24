import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { PumpCurveForm, PumpCurveDataRow } from '../../../../shared/models/calculators';
//declare const d3: any;
import * as d3 from 'd3';
import * as regression from 'regression';
import * as _ from 'lodash';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { PumpCurveService } from '../pump-curve.service';
import { Settings } from '../../../../shared/models/settings';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SystemCurveService } from '../../system-curve/system-curve.service';
import { LineChartHelperService } from '../../../../shared/line-chart-helper/line-chart-helper.service';

var flowMeasurement: string;
var powerMeasurement: string;
var distanceMeasurement: string;
var headOrPressure: string;
var flowVal: number;
var distanceVal: number;
var powerVal: number;

@Component({
  selector: 'app-pump-curve-graph',
  templateUrl: './pump-curve-graph.component.html',
  styleUrls: ['./pump-curve-graph.component.css']
})
export class PumpCurveGraphComponent implements OnInit {
  // PumpCurveForm object holding data from form
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Input()
  selectedFormView: string;
  @Input()
  settings: Settings;
  @Input()
  isFan: boolean;

  //SystemCurve 
  @Input()
  curveConstants: any;
  @Input()
  pointOne: any;
  @Input()
  pointTwo: any;
  @Input()
  staticHead: number;
  @Input()
  lossCoefficient: number;
  @Input()
  graphSystemCurve: boolean;
  graphModificationCurve: boolean = false;

  greatestDomain: string = "base";

  @ViewChild("ngChartContainer") ngChartContainer: ElementRef;
  @ViewChild("ngChart") ngChart: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
  exportName: string;

  svg: d3.Selection<any>;
  xAxis: d3.Selection<any>;
  yAxis: d3.Selection<any>;
  linePump: d3.Selection<any>;
  linePumpMod: d3.Selection<any>;
  lineSystem: d3.Selection<any>;
  dPump: { x: number, y: number };
  dPumpMod: { x: number, y: number };
  dSystem: { x: number, y: number, fluidPower: number };
  focusPump: d3.Selection<any>;
  focusPumpMod: d3.Selection<any>;
  focusSystem: d3.Selection<any>;
  focusDPump: Array<{ x: number, y: number }>;
  focusDPumpMod: Array<{ x: number, y: number }>;
  focusDSystem: Array<{ x: number, y: number, fluidPower: number }>;
  filter: d3.Selection<any>;
  x: any;
  y: any;
  width: number;
  height: number;
  curveChanged: boolean = false;
  margin: { top: number, right: number, bottom: number, left: number };

  detailBox: d3.Selection<any>;
  detailBoxPointer: d3.Selection<any>;
  tooltipPointer: any;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;
  // pointer: any;
  calcPoint: any;
  focus: any;
  focusMod: any;
  focusSystemCurve: any;
  isGridToggled: boolean;

  graphColors: Array<string>;
  tableData: Array<{ borderColor: string, fillColor: string, flowRate: string, baseHeadOrPressure: string, modHeadOrPressure: string, systemHeadOrPressure: string, fluidPower: string }>;
  tablePointsPump: Array<d3.Selection<any>>;
  tablePointsPumpMod: Array<d3.Selection<any>>;
  tablePointsSystem: Array<d3.Selection<any>>;
  deleteCount: number = 0;

  firstChange: boolean = true;

  canvasWidth: number;
  canvasHeight: number;

  //booleans for tooltip
  hoverBtnExport: boolean = false;
  displayExportTooltip: boolean = false;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;

  //add this boolean to keep track if graph has been expanded
  expanded: boolean = false;

  //dynamic table - specific to system curve graph
  flowMeasurement: string;
  distanceMeasurement: string;
  powerMeasurement: string;

  systemCurveChanged: boolean = false;
  systemCurveMaxY: number;
  maxX: any;
  maxY: any;

  //exportable table variables
  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  keyColors: Array<{ borderColor: string, fillColor: string }>;

  @Input()
  toggleCalculate: boolean;
  // flow: number = 0;
  // efficiencyCorrection: number = 0;
  tmpHeadFlow: any;
  constructor(private systemCurveService: SystemCurveService, private lineChartHelperService: LineChartHelperService, private convertUnitsService: ConvertUnitsService, private pumpCurveService: PumpCurveService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, baseHeadOrPressure: string, modHeadOrPressure: string, systemHeadOrPressure: string, fluidPower: string }>();
    // this.tablePoints = new Array<d3.Selection<any>>();
    this.tablePointsPump = new Array<d3.Selection<any>>();
    this.tablePointsPumpMod = new Array<d3.Selection<any>>();
    this.tablePointsSystem = new Array<d3.Selection<any>>();
    this.focusDPump = new Array<{ x: number, y: number }>();
    this.focusDPumpMod = new Array<{ x: number, y: number }>();
    this.focusDSystem = new Array<{ x: number, y: number, fluidPower: number }>();
    this.isGridToggled = false;

    this.initTooltipData();

    //init for exportable table
    this.columnTitles = new Array<string>();
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    this.initColumnTitles();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100)
  }

  initColumnTitles() {
    if (this.isFan) {
      flowMeasurement = this.getDisplayUnit(this.settings.fanFlowRate);
      distanceMeasurement = this.getDisplayUnit(this.settings.fanPressureMeasurement);
      powerMeasurement = this.getDisplayUnit(this.settings.fanPowerMeasurement);
      headOrPressure = 'Pressure';
    } else {
      flowMeasurement = this.getDisplayUnit(this.settings.flowMeasurement);
      distanceMeasurement = this.getDisplayUnit(this.settings.distanceMeasurement);
      powerMeasurement = this.getDisplayUnit(this.settings.powerMeasurement);
      headOrPressure = 'Head'
    }
    this.columnTitles = ['Flow Rate (' + flowMeasurement + ')', 'Base ' + headOrPressure + ' (' + distanceMeasurement + ')', 'Mod ' + headOrPressure + ' (' + distanceMeasurement + ')', 'System ' + headOrPressure + ' (' + distanceMeasurement + ')', 'Fluid Power (' + powerMeasurement + ')'];
  }

  initTooltipData() {
    this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    let flowMeasurement: string;
    let distanceMeasurement: string;
    let headOrPressure: string;
    let powerMeasurement: string;
    if (this.isFan) {
      headOrPressure = "Pressure";
      distanceMeasurement = this.getDisplayUnit(this.settings.fanPressureMeasurement);
      flowMeasurement = this.getDisplayUnit(this.settings.fanFlowRate);
      powerMeasurement = this.settings.fanPowerMeasurement;
    } else {
      headOrPressure = "Head";
      distanceMeasurement = this.settings.distanceMeasurement;
      flowMeasurement = this.settings.flowMeasurement;
      powerMeasurement = this.settings.powerMeasurement;
    }
    this.tooltipData.push({
      label: "Flow",
      value: null,
      unit: " " + flowMeasurement,
      formatX: true
    });
    this.tooltipData.push({
      label: "Base " + headOrPressure,
      value: null,
      unit: " " + distanceMeasurement,
      formatX: false
    });
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      this.tooltipData.push({
        label: "Mod " + headOrPressure,
        value: null,
        unit: " " + distanceMeasurement,
        formatX: false
      });
    }
    if (this.graphSystemCurve) {
      this.tooltipData.push({
        label: "Sys. Curve " + headOrPressure,
        value: null,
        unit: " " + distanceMeasurement,
        formatX: false
      });
      this.tooltipData.push({
        label: "Fluid Power",
        value: null,
        unit: " " + powerMeasurement,
        formatX: null
      });
    }
  }

  // ========== export/gridline tooltip functions ==========
  // if you get a large angular error, make sure to add SimpleTooltipComponent to the imports of the calculator's module
  // for example, check motor-performance-graph.module.ts
  initTooltip(btnType: string) {
    if (btnType == 'btnExportChart') {
      this.hoverBtnExport = true;
    }
    else if (btnType == 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    else if (btnType == 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType == 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 700);
  }

  hideTooltip(btnType: string) {

    if (btnType == 'btnExportChart') {
      this.hoverBtnExport = false;
      this.displayExportTooltip = false;
    }
    else if (btnType == 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
    else if (btnType == 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType == 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
  }

  checkHover(btnType: string) {
    if (btnType == 'btnExportChart') {
      if (this.hoverBtnExport) {
        this.displayExportTooltip = true;
      }
      else {
        this.displayExportTooltip = false;
      }
    }
    else if (btnType == 'btnGridLines') {
      if (this.hoverBtnGridLines) {
        this.displayGridLinesTooltip = true;
      }
      else {
        this.displayGridLinesTooltip = false;
      }
    }
    else if (btnType == 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
      }
    }
    else if (btnType == 'btnCollapseChart') {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      }
      else {
        this.displayCollapseTooltip = false;
      }
    }
  }
  // ========== end tooltip functions ==========


  //merge system curve
  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      //pump-curve.component toggles the toggleCalculate value when calculating
      //check for changes to toggleCalculate
      if (changes.toggleCalculate || changes.lossCoefficient || changes.staticHead || changes.graphSystemCurve) {
        //if changes draw new graph
        if (this.checkForm() && this.margin) {
          this.initTooltipData();
          this.makeGraph();
          this.svg.style("display", null);
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  resizeGraph() {

    //need to update curveGraph to grab a new containing element 'panelChartContainer'
    //make sure to update html container in the graph component as well
    let curveGraph = this.ngChartContainer.nativeElement;

    //conditional sizing if graph is expanded/compressed
    if (!this.expanded) {
      this.canvasWidth = curveGraph.clientWidth;
      this.canvasHeight = this.canvasWidth * (3 / 5);
    }
    else {
      this.canvasWidth = curveGraph.clientWidth;
      this.canvasHeight = curveGraph.clientHeight * 0.9;
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
    this.height = this.canvasHeight - (this.margin.top * 2) - this.margin.bottom;

    if (this.checkForm()) {
      this.makeGraph();
      // this.addLegend();
    }
  }

  checkForm() {
    if (this.pumpCurveForm.maxFlow > 0) {
      return true;
    } else { return false }
  }


  calculateY(formData: PumpCurveForm, flow: number): number {
    let result = 0;
    result = formData.headConstant + formData.headFlow * flow + formData.headFlow2 * Math.pow(flow, 2) + formData.headFlow3 * Math.pow(flow, 3) + formData.headFlow4 * Math.pow(flow, 4) + formData.headFlow5 * Math.pow(flow, 5) + formData.headFlow6 * Math.pow(flow, 6);
    return result;
  }

  getData(): Array<{ x: number, y: number }> {
    // let data = new Array<{ x: number, y: number }>();
    let data = new Array<any>();
    if (this.selectedFormView == 'Data') {
      let maxDataFlow = _.maxBy(this.pumpCurveForm.dataRows, (val) => { return val.flow });
      let tmpArr = new Array<any>();
      this.pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.dataOrder, precision: 10 });
      this.pumpCurveService.regEquation.next(results.string);
      for (let i = 10; i <= maxDataFlow.flow; i = i + 10) {
        let yVal = results.predict(i);
        if (yVal[1] > 0) {
          data.push({
            x: i,
            y: yVal[1]
          })
        }
      }
    } else if (this.selectedFormView == 'Equation') {
      this.pumpCurveService.regEquation.next(null);
      data.push({
        x: 10,
        y: this.calculateY(this.pumpCurveForm, 10)
      });
      for (let i = 20; i <= this.pumpCurveForm.maxFlow + 10; i = i + 10) {
        let yVal = this.calculateY(this.pumpCurveForm, i);
        if (yVal > 0) {
          data.push({
            x: i,
            y: yVal
          });
        }
      }
    }
    // data.pop();
    // data.shift();
    return data;
  }

  getModifiedData(baseline: number, modified: number): Array<{ x: number, y: number }> {
    let data = new Array<any>();
    // let ratio = baseline / modified;
    let ratio = modified / baseline;
    if (this.selectedFormView == 'Data') {
      let maxDataFlow = _.maxBy(this.pumpCurveForm.dataRows, (val) => { return val.flow });
      let tmpArr = new Array<any>();
      this.pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.dataOrder, precision: 10 });
      for (let i = 10; i <= maxDataFlow.flow; i = i + 10) {
        let yVal = results.predict(i);
        if (yVal[1] > 0) {
          data.push({
            x: i * ratio,
            y: yVal[1] * Math.pow(ratio, 2)
          })
        }
      }
    } else if (this.selectedFormView == 'Equation') {
      data.push({
        x: 10 * ratio,
        y: this.calculateY(this.pumpCurveForm, 10) * Math.pow(ratio, 2)
      });
      for (let i = 20; i <= this.pumpCurveForm.maxFlow + 10; i = i + 10) {
        let yVal = this.calculateY(this.pumpCurveForm, i);
        if (yVal > 0) {
          data.push({
            x: i * ratio,
            y: yVal * Math.pow(ratio, 2)
          })
        }
      }
    }
    return data;
  }

  // getXAxisMax(data: Array<{ x: number, y: number }>): { x: number, y: number } {
  //   let max: { x: number, y: number };
  //   let modifiedData = new Array<{ x: number, y: number }>();
  //   let maxX = _.maxBy(data, (val) => { return val.x });
  //   if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
  //     modifiedData = this.getModifiedData(this.pumpCurveForm.baselineMeasurement, this.pumpCurveForm.modifiedMeasurement);
  //     let modMaxX = _.maxBy(modifiedData, (val) => { return val.x });
  //     if (maxX.x < modMaxX.x) {
  //       maxX = modMaxX;
  //     }
  //   }
  //   if (this.graphSystemCurve) {
  //     if (this.pointOne.form.controls.flowRate.value > this.pointTwo.form.controls.flowRate.value) {
  //       if (this.pointOne.form.controls.flowRate.value > maxX.x) {
  //         maxX.x = this.pointOne.form.controls.flowRate.value;
  //         console.log('ponitOne');
  //         console.log('data[data.length - 1] = ');
  //         console.log(data[data.length - 1]);
  //       }
  //     }
  //     else {
  //       if (this.pointTwo.form.controls.flowRate.value > maxX.x) {
  //         maxX.x = this.pointTwo.form.controls.flowRate.value;
  //       }
  //     }
  //   }
  //   // maxX.x = maxX.x + 200;
  //   max = maxX;
  //   console.log('xAxisMax = ');
  //   console.log(max);
  //   return max;
  // }

  // getYAxisMax(data: Array<{ x: number, y: number }>): { x: number, y: number } {
  //   let max: { x: number, y: number };
  //   let modifiedData = new Array<{ x: number, y: number }>();
  //   let maxY = _.maxBy(data, (val) => { return val.y });
  //   if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
  //     modifiedData = this.getModifiedData(this.pumpCurveForm.baselineMeasurement, this.pumpCurveForm.modifiedMeasurement);
  //     let modMaxY = _.maxBy(modifiedData, (val) => { return val.y });
  //     if (maxY.y < modMaxY.y) {
  //       maxY = modMaxY;
  //     }
  //   }
  //   if (this.graphSystemCurve) {
  //     if (this.pointOne.form.controls.head.value > this.pointTwo.form.controls.head.value) {
  //       if (this.pointOne.form.controls.head.value > maxY.y) {
  //         maxY.y = this.pointOne.form.controls.head.value;
  //       }
  //     }
  //     else {
  //       if (this.pointTwo.form.controls.head.value > maxY.y) {
  //         maxY.y = this.pointTwo.form.controls.head.value;
  //       }
  //     }
  //   }
  //   // maxY.y = maxY.y + 100;
  //   max = maxY;
  //   console.log('yAxisMax = ');
  //   console.log(max);
  //   return max;
  // }

  getXScaleMax(dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Flow: number, systemPoint2Flow: number) {
    let max: { x: number, y: number };
    let maxX = _.maxBy(dataBaseline, (val) => { return val.x });
    this.greatestDomain = "base";
    if (this.graphModificationCurve) {
      let modMaxX = _.maxBy(dataModification, (val) => { return val.x });
      if (maxX.x < modMaxX.x) {
        maxX = modMaxX;
        this.greatestDomain = "mod";
      }
    }
    if (this.graphSystemCurve) {
      if (systemPoint1Flow > systemPoint2Flow) {
        if (systemPoint1Flow > maxX.x) {
          maxX.x = systemPoint1Flow;
          this.greatestDomain = "system";
        }
      }
      else {
        if (systemPoint2Flow > maxX.x) {
          maxX.x = systemPoint2Flow;
          this.greatestDomain = "system";
        }
      }
    }
    max = maxX;
    return max;
  }

  getYScaleMax(dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Head: number, systemPoint2Head: number) {
    let max: { x: number, y: number };
    let maxY = _.maxBy(dataBaseline, (val) => { return val.y });
    if (this.graphModificationCurve) {
      let modMaxY = _.maxBy(dataModification, (val) => { return val.y });
      if (maxY.y < modMaxY.y) {
        maxY = modMaxY;
      }
    }
    if (this.graphSystemCurve) {
      if (systemPoint1Head > systemPoint2Head) {
        if (systemPoint1Head > maxY.y) {
          maxY.y = systemPoint1Head;
        }
      }
      else {
        if (systemPoint2Head > maxY.y) {
          maxY.y = systemPoint2Head;
        }
      }
    }
    max = maxY;
    return max;
  }


  makeGraph() {
    //reset graphModificationCurve
    this.graphModificationCurve = false;
    //init arrays for baseline, mod, and system data
    let data = new Array<{ x: number, y: number }>();
    let dataModification = new Array<{ x: number, y: number }>();
    let dataSystem = new Array<{ x: number, y: number, fluidPower: number }>();
    //this array will be dummy data used to avoid visual bug with the scale-setting array
    let dataScale = new Array<{ x: number, y: number }>();
    //populate baseline data array
    data = this.getData();
    //check if difference for mod and populate mod array
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      this.graphModificationCurve = true;
      dataModification = this.getModifiedData(this.pumpCurveForm.baselineMeasurement, this.pumpCurveForm.modifiedMeasurement);
    }

    //x and y scales are required for system curve data, need to check max x/y values from all lines
    this.maxX = this.getXScaleMax(data, dataModification, this.pointOne.form.controls.flowRate.value, this.pointTwo.form.controls.flowRate.value);
    this.maxY = this.getYScaleMax(data, dataModification, this.pointOne.form.controls.head.value, this.pointTwo.form.controls.head.value);

    // this.maxX = this.getXScaleMax(data, dataModification, this.pointOne.form.controls.flowRate.value, this.pointTwo.form.controls.flowRate.value);
    // this.maxY = this.getYScaleMax(data, dataModification, this.pointOne.form.controls.head.value, this.pointTwo.form.controls.head.value);

    //reset and init chart area
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
    //create x and y graph scales
    let xRange: { min: number, max: number } = {
      min: 0,
      max: this.width
    };
    let xDomain: { min: number, max: number } = {
      min: 0,
      max: this.maxX.x + 200
    };
    let yRange: { min: number, max: number } = {
      min: this.height,
      max: 0
    };
    let yDomain: { min: number, max: number } = {
      min: 0,
      max: this.maxY.y + (this.maxY.y * 0.1)
    }
    this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);
    this.y = this.lineChartHelperService.setScale("linear", yRange, yDomain);

    let tickFormat = d3.format("d");
    //create axis
    this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 3, null, null, null, tickFormat)
    this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 6, 0, 0, 15, null);
    //append axis labels
    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, (this.isFan ? "Flow (" + this.getDisplayUnit(this.settings.fanFlowRate) + ")" : "Flow (" + this.getDisplayUnit(this.settings.flowMeasurement) + ")"));
    this.lineChartHelperService.setYAxisLabel(this.svg, this.width, this.height, -60, 0, (this.isFan ? "Pressure (" + this.getDisplayUnit(this.settings.fanPressureMeasurement) : "Head (" + this.getDisplayUnit(this.settings.distanceMeasurement) + ")"));
    //if system curve is active, populate data array
    if (this.graphSystemCurve) {
      dataSystem = this.systemCurveService.getCurvePointData(this.settings, this.x, this.y, 10, this.isFan, this.staticHead, this.lossCoefficient, this.curveConstants);
    }
    //append dummy curve
    if (this.graphSystemCurve) {
      let lineDummy = this.lineChartHelperService.appendLine(this.svg, null, "0px");
      lineDummy = this.lineChartHelperService.drawLine(lineDummy, this.x, this.y, data);
      data.pop();
      if (this.graphSystemCurve && this.graphModificationCurve) {
        dataModification.pop();
      }
    }

    //append and draw baseline curve
    this.linePump = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.linePump = this.lineChartHelperService.drawLine(this.linePump, this.x, this.y, data);

    //if graphing modification, append and draw modification curve
    if (this.graphModificationCurve) {
      // dataMod = this.getModifiedData(this.pumpCurveForm.baselineMeasurement, this.pumpCurveForm.modifiedMeasurement);
      this.linePumpMod = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
      this.linePumpMod = this.lineChartHelperService.drawLine(this.linePumpMod, this.x, this.y, dataModification);
    }
    //if graphing system curve, append and draw system curve
    if (this.graphSystemCurve) {
      this.lineSystem = this.lineChartHelperService.appendLine(this.svg, "red", "2px", "stroke-dasharray", "3, 3");
      this.lineSystem = this.lineChartHelperService.drawLine(this.lineSystem, this.x, this.y, dataSystem);
    }

    this.detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
    this.detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);
    this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      this.focusPumpMod = this.lineChartHelperService.appendFocus(this.svg, "focusPumpMod");
    }
    if (this.graphSystemCurve) {
      this.focusSystem = this.lineChartHelperService.appendFocus(this.svg, "focusSystem");
    }

    let allData: Array<Array<any>> = [data];
    let allD: Array<any> = [this.dPump];
    let allFocus: Array<d3.Selection<any>> = [this.focusPump];
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      allData.push(dataModification);
      allD.push(this.dPumpMod);
      allFocus.push(this.focusPumpMod);
    }
    if (this.graphSystemCurve) {
      allData.push(dataSystem);
      allD.push(this.dSystem);
      allFocus.push(this.focusSystem);
    }
    let format = d3.format(",.2f");
    this.lineChartHelperService.mouseOverDriver(
      this.svg,
      this.detailBox,
      this.detailBoxPointer,
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

    //dynamic table
    if (!this.curveChanged) {
      this.replaceFocusPoints();
    }
    else {
      this.resetTableData();
    }
    this.curveChanged = false;

    this.addLegend();
  }


  //dynamic table
  buildTable() {
    let i = this.rowData.length + this.deleteCount;
    let borderColorIndex = Math.floor(i / this.graphColors.length);
    let dArray: Array<any> = this.lineChartHelperService.getDArray();
    this.dPump = dArray[0];
    let format: any = d3.format(",.2f");
    let tableFocusPump: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPump-" + this.tablePointsPump.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dPump.x), this.y(this.dPump.y));
    this.focusDPump.push(this.dPump);
    this.tablePointsPump.push(tableFocusPump);
    let dataPiece: { borderColor: string, fillColor: string, flowRate: string, baseHeadOrPressure: string, modHeadOrPressure: string, systemHeadOrPressure: string, fluidPower: string };
    dataPiece = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length],
      flowRate: format(this.dPump.x).toString(),
      baseHeadOrPressure: format(this.dPump.y).toString(),
      modHeadOrPressure: "&mdash;",
      systemHeadOrPressure: "&mdash;",
      fluidPower: "&mdash;"
    };

    if (this.graphModificationCurve) {
      this.dPumpMod = dArray[1];
      this.focusDPumpMod.push(this.dPumpMod);
      let tableFocusPumpMod: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPumpMod-" + this.tablePointsPumpMod.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dPumpMod.x), this.y(this.dPumpMod.y));
      this.tablePointsPumpMod.push(tableFocusPumpMod);
      dataPiece.modHeadOrPressure = format(this.dPumpMod.y).toString();
    }

    if (this.graphSystemCurve) {
      let dArrayIndex: number;
      if (this.graphModificationCurve) {
        dArrayIndex = 2;
      }
      else {
        dArrayIndex = 1;
      }
      this.dSystem = dArray[dArrayIndex];
      this.focusDSystem.push(this.dSystem);
      let tableFocusSystem: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointSystem-" + this.tablePointsSystem.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dSystem.x), this.y(this.dSystem.y));
      this.tablePointsSystem.push(tableFocusSystem);
      dataPiece.systemHeadOrPressure = format(this.dSystem.y).toString();
      dataPiece.fluidPower = format(this.dSystem.fluidPower).toString();
    }

    // this.dPumpMod = dArray[1];
    // this.dSystem = dArray[2];
    // this.tablePoints.push(tableFocus);
    // let dataPiece = {
    //   borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
    //   fillColor: this.graphColors[i % this.graphColors.length],
    //   flowRate: format(this.d.x).toString(),
    //   headOrPressure: headOrPressure,
    //   distance: format(this.d.y).toString(),
    //   fluidPower: format(this.d.fluidPower).toString()
    // }
    this.tableData.push(dataPiece);

    let colors = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length]
    };
    this.keyColors.push(colors);
    // let data = [format(this.d.x).toString(), format(this.d.y).toString(), format(this.d.fluidPower).toString()];
    let data = [dataPiece.flowRate, dataPiece.baseHeadOrPressure, dataPiece.modHeadOrPressure, dataPiece.systemHeadOrPressure, dataPiece.fluidPower];
    this.rowData.push(data);
  }

  //dynamic table
  resetTableData() {
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, baseHeadOrPressure: string, modHeadOrPressure: string, systemHeadOrPressure: string, fluidPower: string }>();
    this.tablePointsPump = new Array<d3.Selection<any>>();
    this.tablePointsPumpMod = new Array<d3.Selection<any>>();
    this.tablePointsSystem = new Array<d3.Selection<any>>();
    this.focusDPump = new Array<{ x: number, y: number }>();
    this.focusDPumpMod = new Array<{ x: number, y: number }>();
    this.focusDSystem = new Array<{ x: number, y: number, fluidPower: number }>();
    this.rowData = new Array<Array<string>>();
    this.deleteCount = 0;
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
  }

  //dynamic table
  replaceFocusPoints() {
    this.svg.selectAll('.tablePoint').remove();
    for (let i = 0; i < this.rowData.length; i++) {
      let tableFocusPump: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPump-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDPump[i].x), this.y(this.focusDPump[i].y));
      if (this.graphModificationCurve) {
        let tableFocusPumpMod: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPumpMod-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDPumpMod[i].x), this.y(this.focusDPumpMod[i].y));
      }
      if (this.graphSystemCurve) {
        let tableFocusSystem: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointSystem-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDSystem[i].x), this.y(this.focusDSystem[i].y));
      }
    }
  }

  deleteFromTable(i: number) {
    for (let j = i; j < this.tableData.length - 1; j++) {
      this.tableData[j] = this.tableData[j + 1];
      this.tablePointsPump[j] = this.tablePointsPump[j + 1];
      this.focusDPump[j] = this.focusDPump[j + 1];
      if (this.graphModificationCurve) {
        this.tablePointsPumpMod[j] = this.tablePointsPumpMod[j + 1];
        this.focusDPumpMod[j] = this.focusDPumpMod[j + 1];
      }
      if (this.graphSystemCurve) {
        this.tablePointsSystem[j] = this.tablePointsSystem[j + 1];
        this.focusDSystem[j] = this.focusDSystem[j + 1];
      }
      this.rowData[j] = this.rowData[j + 1];
      this.keyColors[j] = this.keyColors[j + 1];
    }
    if (i != this.tableData.length - 1) {
      this.deleteCount += 1;
    }
    this.tableData.pop();
    this.tablePointsPump.pop();
    this.focusDPump.pop();
    if (this.graphModificationCurve) {
      this.tablePointsPumpMod.pop();
      this.focusDPumpMod.pop();
    }
    if (this.graphSystemCurve) {
      this.tablePointsSystem.pop();
      this.focusDSystem.pop();
    }
    this.rowData.pop();
    this.keyColors.pop();
    this.replaceFocusPoints();
  }

  highlightPoint(i: number) {
    let ids: Array<string> = ["#tablePointPump-" + i];
    if (this.graphModificationCurve) { ids.push("#tablePointPumpMod-" + i); }
    if (this.graphSystemCurve) { ids.push("#tablePointsSystem-" + i); }
    this.lineChartHelperService.tableHighlightPointHelper(this.svg, ids);
  }

  unhighlightPoint(i: number) {
    let ids: Array<string> = ["#tablePointPump-" + i];
    if (this.graphModificationCurve) { ids.push("#tablePointPumpMod-" + i); }
    if (this.graphSystemCurve) { ids.push("#tablePointsSystem-" + i); }
    this.lineChartHelperService.tableUnhighlightPointHelper(this.svg, ids);
    this.replaceFocusPoints();
  }


  addLegend() {
    // define legend box size and space
    let legendRectHeight = 1;
    let legendRectWidth = 30;
    let legendSpacing = 5;

    // width of lines
    let pathStrokeWidth = "2px";

    this.svg.append("text")
      .attr("class", "legend")
      .attr("id", "legend-text-0")
      .attr("x", this.width - legendSpacing - this.margin.right - 20)
      .attr("y", ((legendSpacing * 0) * 2) + (this.margin.top))
      .style("fill", "#145A32")
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .text("Baseline");

    this.svg.append("text")
      .attr("class", "legend")
      .attr("id", "legend-text-1")
      .attr("x", this.width - legendSpacing - this.margin.right - 20)
      .attr("y", ((legendSpacing * 1) * 2) + (this.margin.top))
      .style("fill", "#3498DB")
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .text("Modification");

    this.svg.append("text")
      .attr("class", "legend")
      .attr("id", "legend-text-2")
      .attr("x", this.width - legendSpacing - this.margin.right - 20)
      .attr("y", ((legendSpacing * 2) * 2) + (this.margin.top))
      .style("fill", "red")
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .text("System Curve");


    // adds line in the same color as used in the graph
    let item0 = d3.select("#legend-text-" + 0).node();
    let bb0 = item0.getBBox();
    let item1 = d3.select("#legend-text-" + 1).node();
    let bb1 = item1.getBBox();
    let item2 = d3.select("#legend-text-" + 2).node();
    let bb2 = item2.getBBox();

    this.svg.append("path")
      .attr("class", "legend")
      .attr("data-legend-key", 0)
      .attr("data-color", "#145A32")
      .attr("d", "M" + (bb0.x - legendSpacing - legendRectWidth) + "," + (bb0.y + bb0.height / 2) + " L" + (bb0.x - legendSpacing) + "," + (bb0.y + bb0.height / 2))
      .style("stroke", "#145A32")
      .style("stroke-width", "2px")
      .style("fill", "none")
      .attr("height", legendRectHeight)
      .attr("width", legendRectWidth);

    this.svg.append("path")
      .attr("class", "legend")
      .attr("data-legend-key", 1)
      .attr("data-color", "#3498DB")
      .attr("d", "M" + (bb1.x - legendSpacing - legendRectWidth) + "," + (bb1.y + bb1.height / 2) + " L" + (bb1.x - legendSpacing) + "," + (bb1.y + bb1.height / 2))
      .style("stroke", "#3498DB")
      .style("stroke-width", "2px")
      .style("fill", "none")
      .attr("height", legendRectHeight)
      .attr("width", legendRectWidth);

    this.svg.append("path")
      .attr("class", "legend")
      .attr("data-legend-key", 2)
      .attr("data-color", "red")
      .attr("d", "M" + (bb2.x - legendSpacing - legendRectWidth) + "," + (bb2.y + bb2.height / 2) + " L" + (bb2.x - legendSpacing) + "," + (bb2.y + bb0.height / 2))
      .style("stroke", "red")
      .style("stroke-width", "2px")
      .style("stroke-dasharray", ("3, 3"))
      .style("fill", "none")
      .attr("height", legendRectHeight)
      .attr("width", legendRectWidth);
  }

  toggleGrid() {
    if (this.isGridToggled) {
      this.isGridToggled = false;
      this.makeGraph();
    }
    else {
      this.isGridToggled = true;
      this.makeGraph();
    }
  }

  downloadChart() {
    if (!this.exportName) {
      if (this.isFan) {
        this.exportName = "fan-curve-graph";
      } else {
        this.exportName = "pump-curve-graph";
      }
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }

  //========= chart resize functions ==========
  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 200);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 200);
  }
  //========== end chart resize functions ==========
}