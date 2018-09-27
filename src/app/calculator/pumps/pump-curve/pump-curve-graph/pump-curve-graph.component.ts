import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PumpCurveForm } from '../../../../shared/models/calculators';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { PumpCurveService } from '../pump-curve.service';
import { Settings } from '../../../../shared/models/settings';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SystemCurveService } from '../../system-curve/system-curve.service';
import { LineChartHelperService } from '../../../../shared/line-chart-helper/line-chart-helper.service';

@Component({
  selector: 'app-pump-curve-graph',
  templateUrl: './pump-curve-graph.component.html',
  styleUrls: ['./pump-curve-graph.component.css']
})
export class PumpCurveGraphComponent implements OnInit {
  @Input()
  pumpCurvePrimary: boolean;
  @Input()
  graphPumpCurve: boolean;
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
  x: any;
  y: any;
  maxX: any;
  maxY: any;
  width: number;
  height: number;
  margin: { top: number, right: number, bottom: number, left: number };

  detailBox: d3.Selection<any>;
  detailBoxPointer: d3.Selection<any>;
  tooltipPointer: any;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;



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

  isGridToggled: boolean;
  curveChanged: boolean = false;
  //add this boolean to keep track if graph has been expanded
  expanded: boolean = false;

  //exportable table variables
  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  keyColors: Array<{ borderColor: string, fillColor: string }>;

  @Input()
  toggleCalculate: boolean;
  tmpHeadFlow: any;
  constructor(private systemCurveService: SystemCurveService, private lineChartHelperService: LineChartHelperService, private convertUnitsService: ConvertUnitsService, private pumpCurveService: PumpCurveService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.isGridToggled = false;
    this.graphColors = graphColors;
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, baseHeadOrPressure: string, modHeadOrPressure: string, systemHeadOrPressure: string, fluidPower: string }>();
    this.tablePointsPump = new Array<d3.Selection<any>>();
    this.tablePointsPumpMod = new Array<d3.Selection<any>>();
    this.tablePointsSystem = new Array<d3.Selection<any>>();
    this.focusDPump = new Array<{ x: number, y: number }>();
    this.focusDPumpMod = new Array<{ x: number, y: number }>();
    this.focusDSystem = new Array<{ x: number, y: number, fluidPower: number }>();
    this.checkGraphModificationCurve();
    this.initTooltipData();
    //init for exportable table
    this.columnTitles = new Array<string>();
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100)
  }

  initColumnTitles() {
    this.columnTitles = new Array<string>();
    this.columnTitles = this.pumpCurveService.initColumnTitles(this.settings, this.isFan, this.graphPumpCurve, this.graphModificationCurve, this.graphSystemCurve);
  }

  initTooltipData() {
    this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    this.tooltipData = this.pumpCurveService.initTooltipData(this.settings, this.isFan, this.graphPumpCurve, this.graphModificationCurve, this.graphSystemCurve);
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
      if (changes.toggleCalculate || changes.lossCoefficient || changes.staticHead || changes.graphSystemCurve || changes.graphPumpCurve) {
        this.curveChanged = true;
        //if changes draw new graph
        if (this.checkForm() && this.margin) {
          this.checkGraphModificationCurve();
          this.initTooltipData();
          this.makeGraph();
          this.svg.style("display", null);
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  checkGraphModificationCurve() {
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      this.graphModificationCurve = true;
    }
    else {
      this.graphModificationCurve = false;
    }
  }

  checkForm() {
    if (this.pumpCurveForm.maxFlow > 0) {
      return true;
    } else { return false }
  }

  resizeGraph() {
    //need to update curveGraph to grab a new containing element 'panelChartContainer'
    //make sure to update html container in the graph component as well
    let curveGraph = this.ngChartContainer.nativeElement;
    //conditional sizing if graph is expanded/compressed
    if (!this.expanded) {
      this.canvasWidth = curveGraph.clientWidth;
      this.canvasHeight = this.canvasWidth * (3 / 5);
    } else {
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
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;
    if (this.checkForm()) {
      this.makeGraph();
    }
  }



  calculateY(formData: PumpCurveForm, flow: number): number {
    let result = 0;
    result = formData.headConstant + formData.headFlow * flow + formData.headFlow2 * Math.pow(flow, 2) + formData.headFlow3 * Math.pow(flow, 3) + formData.headFlow4 * Math.pow(flow, 4) + formData.headFlow5 * Math.pow(flow, 5) + formData.headFlow6 * Math.pow(flow, 6);
    return result;
  }

  getData(): Array<{ x: number, y: number }> {
    return this.pumpCurveService.getData(this.pumpCurveForm, this.selectedFormView);
  }

  getModifiedData(baseline: number, modified: number): Array<{ x: number, y: number }> {
    return this.pumpCurveService.getModifiedData(this.pumpCurveForm, this.selectedFormView, baseline, modified);
  }

  getXScaleMax(dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Flow: number, systemPoint2Flow: number) {
    return this.pumpCurveService.getXScaleMax(this.graphPumpCurve, this.graphModificationCurve, this.graphSystemCurve, dataBaseline, dataModification, systemPoint1Flow, systemPoint2Flow);
  }

  getYScaleMax(dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Head: number, systemPoint2Head: number) {
    return this.pumpCurveService.getYScaleMax(this.graphPumpCurve, this.graphModificationCurve, this.graphSystemCurve, dataBaseline, dataModification, systemPoint1Head, systemPoint2Head);
  }


  makeGraph() {
    //init arrays for baseline, mod, and system data
    let data = new Array<{ x: number, y: number }>();
    let dataModification = new Array<{ x: number, y: number }>();
    let dataSystem = new Array<{ x: number, y: number, fluidPower: number }>();
    //this array will be dummy data used to avoid visual bug with the scale-setting array
    let dataScale = new Array<{ x: number, y: number }>();
    //init arrays for mouseOverDriver
    let allData: Array<Array<any>> = new Array<Array<any>>();
    let allD: Array<any> = new Array<any>();
    let allFocus: Array<d3.Selection<any>> = new Array<d3.Selection<any>>();
    //populate baseline data array
    //check if difference for mod and populate mod array
    if (this.graphPumpCurve) {
      data = this.getData();
      if (this.graphModificationCurve) {
        dataModification = this.getModifiedData(this.pumpCurveForm.baselineMeasurement, this.pumpCurveForm.modifiedMeasurement);
      }
    }
    this.initColumnTitles();
    //x and y scales are required for system curve data, need to check max x/y values from all lines
    this.maxX = this.getXScaleMax(data, dataModification, this.pointOne.form.controls.flowRate.value, this.pointTwo.form.controls.flowRate.value);
    this.maxY = this.getYScaleMax(data, dataModification, this.pointOne.form.controls.head.value, this.pointTwo.form.controls.head.value);
    this.maxX.x = this.maxX.x + (this.maxX.x * 0.1);
    this.maxY.y = this.maxY.y + (this.maxY.y * 0.1);
    //reset and init chart area
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
    //create x and y graph scales
    let xRange: { min: number, max: number } = { min: 0, max: this.width };
    let xDomain: { min: number, max: number } = { min: 0, max: this.maxX.x };
    let yRange: { min: number, max: number } = { min: this.height, max: 0 };
    let yDomain: { min: number, max: number } = { min: 0, max: this.maxY.y };
    this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);
    this.y = this.lineChartHelperService.setScale("linear", yRange, yDomain);
    let tickFormat = d3.format("d");
    //append axis labels
    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, (this.isFan ? "Flow (" + this.pumpCurveService.getDisplayUnit(this.settings.fanFlowRate) + ")" : "Flow (" + this.pumpCurveService.getDisplayUnit(this.settings.flowMeasurement) + ")"));
    this.lineChartHelperService.setYAxisLabel(this.svg, this.width, this.height, -60, 0, (this.isFan ? "Pressure (" + this.pumpCurveService.getDisplayUnit(this.settings.fanPressureMeasurement) : "Head (" + this.pumpCurveService.getDisplayUnit(this.settings.distanceMeasurement) + ")"));
    //if system curve is active, populate data array
    if (this.graphSystemCurve) {
      dataSystem = this.systemCurveService.getCurvePointData(this.settings, this.x, this.y, 10, this.isFan, this.staticHead, this.lossCoefficient, this.curveConstants);
      dataSystem.shift();
    }
    //create axis
    this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 5, null, null, null, tickFormat)
    this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 6, 0, 0, 15, null);
    //append dummy curve
    if (this.graphPumpCurve) {
      //repair maxY bug
      data[0].y = this.pumpCurveForm.headConstant;
      data.pop();
      //append and draw baseline curve
      this.linePump = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
      this.linePump = this.lineChartHelperService.drawLine(this.linePump, this.x, this.y, data);
      this.focusPump = this.lineChartHelperService.appendFocus(this.svg, "focusPump");
      allData.push(data);
      allD.push(this.dPump);
      allFocus.push(this.focusPump);
      if (this.graphModificationCurve) {
        dataModification.pop();
        //if graphing modification, append and draw modification curve
        this.linePumpMod = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
        this.linePumpMod = this.lineChartHelperService.drawLine(this.linePumpMod, this.x, this.y, dataModification);
        this.focusPumpMod = this.lineChartHelperService.appendFocus(this.svg, "focusPumpMod");
        allData.push(dataModification);
        allD.push(this.dPumpMod);
        allFocus.push(this.focusPumpMod);
      }
    }
    //if graphing system curve, append and draw system curve
    if (this.graphSystemCurve) {
      this.lineSystem = this.lineChartHelperService.appendLine(this.svg, "red", "2px", "stroke-dasharray", "3, 3");
      this.lineSystem = this.lineChartHelperService.drawLine(this.lineSystem, this.x, this.y, dataSystem);
      this.focusSystem = this.lineChartHelperService.appendFocus(this.svg, "focusSystem");
      allData.push(dataSystem);
      allD.push(this.dSystem);
      allFocus.push(this.focusSystem);
    }
    this.detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
    this.detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);
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
    let format: any = d3.format(",.2f");
    let dArray: Array<any> = this.lineChartHelperService.getDArray();
    let dSystemIndex: number = 0;
    if (this.graphPumpCurve) {
      this.dPump = dArray[0];
      let tableFocusPump: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPump-" + this.tablePointsPump.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dPump.x), this.y(this.dPump.y));
      this.focusDPump.push(this.dPump);
      this.tablePointsPump.push(tableFocusPump);
      dSystemIndex++;
      if (this.graphModificationCurve) {
        this.dPumpMod = dArray[1];
        let tableFocusPumpMod: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPumpMod-" + this.tablePointsPumpMod.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dPumpMod.x), this.y(this.dPumpMod.y));
        this.focusDPumpMod.push(this.dPumpMod);
        this.tablePointsPumpMod.push(tableFocusPumpMod);
        dSystemIndex++;
      }
    }
    if (this.graphSystemCurve) {
      this.dSystem = dArray[dSystemIndex];
      let tableFocusSystem: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointSystem-" + this.tablePointsSystem.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dSystem.x), this.y(this.dSystem.y));
      this.focusDSystem.push(this.dSystem);
      this.tablePointsSystem.push(tableFocusSystem);
    }
    let maxX: number = dArray[0].x;
    for (let i = 0; i < dArray.length; i++) {
      maxX = Math.max(maxX, dArray[i].x);
    }
    let dataPiece: { borderColor: string, fillColor: string, flowRate: string, baseHeadOrPressure: string, modHeadOrPressure: string, systemHeadOrPressure: string, fluidPower: string };
    let borderColor = this.graphColors[borderColorIndex % this.graphColors.length];
    let fillColor = this.graphColors[i % this.graphColors.length];
    let flowRate = maxX.toString();
    let baseHeadOrPressure = "&mdash;";
    let modHeadOrPressure = "&mdash;";
    let systemHeadOrPressure = "&mdash;";
    let fluidPower = "&mdash;";
    let data: Array<string> = [flowRate];
    if (this.graphPumpCurve) {
      if (this.dPump.x > maxX - 10) {
        baseHeadOrPressure = format(this.dPump.y).toString();
      }
      data.push(baseHeadOrPressure);
      if (this.graphModificationCurve) {
        if (this.dPumpMod.x > maxX - 10) {
          modHeadOrPressure = format(this.dPumpMod.y).toString();
        }
        data.push(modHeadOrPressure);
      }
    }
    if (this.graphSystemCurve) {
      if (this.dSystem.x > maxX - 10) {
        systemHeadOrPressure = format(this.dSystem.y).toString();
        fluidPower = format(this.dSystem.fluidPower).toString();
      }
      data.push(systemHeadOrPressure);
      data.push(fluidPower);
    }
    dataPiece = {
      borderColor: borderColor,
      fillColor: fillColor,
      flowRate: flowRate,
      baseHeadOrPressure: baseHeadOrPressure,
      modHeadOrPressure: modHeadOrPressure,
      systemHeadOrPressure: systemHeadOrPressure,
      fluidPower: fluidPower
    };
    this.tableData.push(dataPiece);
    let colors = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length]
    };
    this.keyColors.push(colors);
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
    if (this.graphPumpCurve) {
      for (let i = 0; i < this.rowData.length; i++) {
        let tableFocusPump: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPump-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDPump[i].x), this.y(this.focusDPump[i].y));
      }
      if (this.graphModificationCurve) {
        for (let i = 0; i < this.rowData.length; i++) {
          let tableFocusPumpMod: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPumpMod-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDPumpMod[i].x), this.y(this.focusDPumpMod[i].y));
        }
      }
    }
    if (this.graphSystemCurve) {
      for (let i = 0; i < this.rowData.length; i++) {
        let tableFocusSystem: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointSystem-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDSystem[i].x), this.y(this.focusDSystem[i].y));
      }
    }
  }

  deleteFromTable(i: number) {
    for (let j = i; j < this.tableData.length - 1; j++) {
      this.tableData[j] = this.tableData[j + 1];
      if (this.graphPumpCurve) {
        this.tablePointsPump[j] = this.tablePointsPump[j + 1];
        this.focusDPump[j] = this.focusDPump[j + 1];
        if (this.graphModificationCurve) {
          this.tablePointsPumpMod[j] = this.tablePointsPumpMod[j + 1];
          this.focusDPumpMod[j] = this.focusDPumpMod[j + 1];
        }
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
    if (this.graphPumpCurve) {
      this.tablePointsPump.pop();
      this.focusDPump.pop();
      if (this.graphModificationCurve) {
        this.tablePointsPumpMod.pop();
        this.focusDPumpMod.pop();
      }
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
    let ids: Array<string> = new Array<string>();
    if (this.graphPumpCurve) {
      ids.push("#tablePointPump-" + i);
      if (this.graphModificationCurve) { ids.push("#tablePointPumpMod-" + i); }
    }
    if (this.graphSystemCurve) { ids.push("#tablePointSystem-" + i); }
    this.lineChartHelperService.tableHighlightPointHelper(this.svg, ids);
  }

  unhighlightPoint(i: number) {
    let ids: Array<string> = new Array<string>();
    if (this.graphPumpCurve) {
      ids.push("#tablePointPump-" + i);
      if (this.graphModificationCurve) { ids.push("#tablePointPumpMod-" + i); }
    }
    if (this.graphSystemCurve) { ids.push("#tablePointSystem-" + i); }
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
    if (this.graphPumpCurve) {
      this.svg.append("text")
        .attr("class", "legend")
        .attr("id", "legend-text-0")
        .attr("x", this.width - legendSpacing - this.margin.right - 20)
        .attr("y", ((legendSpacing * 0) * 2) + (this.margin.top))
        .style("fill", "#145A32")
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .text("Baseline");
      let item0 = d3.select("#legend-text-" + 0).node();
      let bb0 = item0.getBBox();
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
      if (this.graphModificationCurve) {
        this.svg.append("text")
          .attr("class", "legend")
          .attr("id", "legend-text-1")
          .attr("x", this.width - legendSpacing - this.margin.right - 20)
          .attr("y", ((legendSpacing * 1) * 2) + (this.margin.top))
          .style("fill", "#3498DB")
          .style("font-family", "sans-serif")
          .style("font-size", "10px")
          .text("Modification");
        let item1 = d3.select("#legend-text-" + 1).node();
        let bb1 = item1.getBBox();
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
      }
    }
    if (this.graphSystemCurve) {
      this.svg.append("text")
        .attr("class", "legend")
        .attr("id", "legend-text-2")
        .attr("x", this.width - legendSpacing - this.margin.right - 20)
        .attr("y", ((legendSpacing * 2) * 2) + (this.margin.top))
        .style("fill", "red")
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .text("System Curve");
      let item2 = d3.select("#legend-text-" + 2).node();
      let bb2 = item2.getBBox();
      this.svg.append("path")
        .attr("class", "legend")
        .attr("data-legend-key", 2)
        .attr("data-color", "red")
        .attr("d", "M" + (bb2.x - legendSpacing - legendRectWidth) + "," + (bb2.y + bb2.height / 2) + " L" + (bb2.x - legendSpacing) + "," + (bb2.y + bb2.height / 2))
        .style("stroke", "red")
        .style("stroke-width", "2px")
        .style("stroke-dasharray", ("3, 3"))
        .style("fill", "none")
        .attr("height", legendRectHeight)
        .attr("width", legendRectWidth);
    }
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