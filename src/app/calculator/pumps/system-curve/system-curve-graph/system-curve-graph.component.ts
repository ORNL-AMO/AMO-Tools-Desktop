import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import * as d3 from 'd3';
import { PsatService } from '../../../../psat/psat.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { SystemCurveService } from '../system-curve.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { LineChartHelperService } from '../../../../shared/line-chart-helper/line-chart-helper.service';
import { FormGroup } from '@angular/forms';

var headOrPressure: string;
var flowMeasurement: string;
var distanceMeasurement: string;
var powerMeasurement: string;

@Component({
  selector: 'app-system-curve-graph',
  templateUrl: './system-curve-graph.component.html',
  styleUrls: ['./system-curve-graph.component.css']
})
export class SystemCurveGraphComponent implements OnInit {
  @Input()
  curveConstants: { form: FormGroup };
  @Input()
  pointOne: any;
  @Input()
  pointTwo: any;
  @Input()
  staticHead: number;
  @Input()
  lossCoefficient: number;
  @Input()
  settings: Settings;
  @Input()
  isFan: boolean;
  @Input()
  inAssessment: boolean;

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
  width: number;
  height: number;
  margin: { top: number, right: number, bottom: number, left: number };
  line: d3.Selection<any>;
  filter: d3.Selection<any>;
  detailBox: d3.Selection<any>;
  detailBoxPointer: d3.Selection<any>;
  focus: d3.Selection<any>;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;
  isGridToggled: boolean;

  //dynamic table variables
  d: { x: number, y: number, fluidPower: number };
  focusD: Array<{ x: number, y: number, fluidPower: number }>;
  x: any;
  y: any;
  curveChanged: boolean = false;
  graphColors: Array<string>;
  tableData: Array<{ borderColor: string, fillColor: string, flowRate: string, headOrPressure: string, distance: string, fluidPower: string }>;
  tablePoints: Array<d3.Selection<any>>;

  //dynamic table - specific to system curve graph
  flowMeasurement: string;
  distanceMeasurement: string;
  powerMeasurement: string;
  deleteCount: number = 0;

  canvasWidth: number;
  canvasHeight: number;
  fontSize: string = "12px";

  //booleans for tooltip
  hoverBtnExport: boolean = false;
  displayExportTooltip: boolean = false;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;

  isFirstChange: boolean = true;
  expanded: boolean = false;

  //exportable table variables
  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  keyColors: Array<{ borderColor: string, fillColor: string }>;

  constructor(private systemCurveService: SystemCurveService, private lineChartHelperService: LineChartHelperService, private convertUnitsService: ConvertUnitsService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, headOrPressure: string, distance: string, fluidPower: string }>();
    this.tablePoints = new Array<d3.Selection<any>>();
    this.focusD = new Array<{ x: number, y: number, fluidPower: number }>();
    this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();

    if (!this.lossCoefficient) {
      this.lossCoefficient = 0;
    }
    if (!this.staticHead) {
      this.staticHead = 0;
    }

    this.isGridToggled = false;
    this.initTooltipData();

    //init for exportable table
    this.columnTitles = new Array<string>();
    // if (this.isFan && this.systemCurveService.fanTableData && !this.inAssessment) {
    //   this.rowData = this.systemCurveService.fanTableData;
    //   this.keyColors = this.systemCurveService.fanKeyColors;
    // } else if (!this.isFan && this.systemCurveService.pumpTableData && !this.inAssessment) {
    //   this.rowData = this.systemCurveService.pumpTableData;
    //   this.keyColors = this.systemCurveService.pumpKeyColors
    // }
    // else {
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    //}
    this.initColumnTitles();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100)
  }

  ngOnDestroy() {
    // if (this.isFan) {
    //   this.systemCurveService.fanTableData = this.rowData;
    //   this.systemCurveService.fanKeyColors = this.keyColors;
    // } else {
    //   this.systemCurveService.pumpTableData = this.rowData;
    //   this.systemCurveService.pumpKeyColors = this.keyColors;
    // }
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
    this.columnTitles = ['Flow Rate (' + flowMeasurement + ')', headOrPressure + ' (' + distanceMeasurement + ')', 'Fluid Power (' + powerMeasurement + ')'];
  }

  initTooltipData() {
    this.tooltipData.push({
      label: "Flow Rate",
      value: null,
      unit: " " + this.settings.flowMeasurement,
      formatX: true
    });
    this.tooltipData.push({
      label: "Head",
      value: null,
      unit: " " + this.settings.distanceMeasurement,
      formatX: false
    });
    this.tooltipData.push({
      label: "Fluid Power",
      value: null,
      unit: " " + this.settings.powerMeasurement,
      formatX: null
    });
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



  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange && (changes.lossCoefficient || changes.staticHead)) {
      this.curveChanged = true;   //dynamic table
      this.makeGraph();
    }
    else {
      this.isFirstChange = false;
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

  getXDomain(): { min: number, max: number } {
    let xDomain: { min: number, max: number };
    if (this.pointOne.form.controls.flowRate.value > this.pointTwo.form.controls.flowRate.value) {
      if (this.pointOne.form.controls.flowRate.value > 50 && this.pointOne.form.controls.flowRate.value < 25000) {
        xDomain = { min: 0, max: this.pointOne.form.controls.flowRate.value * 1.2 };
      } else if (this.pointOne.form.controls.flowRate.value > 50 && this.pointOne.form.controls.flowRate.value > 25000) {
        xDomain = { min: 0, max: this.pointOne.form.controls.flowRate.value * 1.2 };
      } else {
        xDomain = { min: 0, max: 50 };
      }
    }
    else {
      if (this.pointTwo.form.controls.flowRate.value > 50 && this.pointTwo.form.controls.flowRate.value < 25000) {
        xDomain = { min: 0, max: this.pointTwo.form.controls.flowRate.value * 1.2 };
      } else if (this.pointTwo.form.controls.flowRate.value > 50 && this.pointTwo.form.controls.flowRate.value > 25000) {
        xDomain = { min: 0, max: this.pointTwo.form.controls.flowRate.value * 1.2 };
      } else {
        xDomain = { min: 0, max: 50 };
      }
    }
    return xDomain;
  }

  getYDomain(): { min: number, max: number } {
    let yDomain: { min: number, max: number };
    //right now, domain is capped at 25000 even if value is > 25000
    if (this.pointOne.form.controls.head.value > this.pointTwo.form.controls.head.value) {
      let domainVal = this.pointOne.form.controls.head.value + (this.pointOne.form.controls.head.value / 10);
      if (domainVal > 50 && domainVal < 25000) {
        yDomain = { min: 0, max: domainVal * 1.2 };
        // y.domain([0, domainVal * 1.2]);
      } else if (domainVal > 50 && domainVal > 25000) {
        yDomain = { min: 0, max: domainVal * 1.2 };
        // y.domain([0, domainVal * 1.2]);
      } else {
        yDomain = { min: 0, max: 50 };
        // y.domain([0, 50]);
      }
    }
    else {
      let domainVal = this.pointTwo.form.controls.head.value + (this.pointTwo.form.controls.head.value / 10);
      if (domainVal > 50 && domainVal < 25000) {
        yDomain = { min: 0, max: domainVal * 1.2 };
        // y.domain([0, domainVal * 1.2]);
      } else if (domainVal > 50 && domainVal > 25000) {
        yDomain = { min: 0, max: domainVal * 1.2 };
        // y.domain([0, domainVal * 1.2]);
      } else {
        yDomain = { min: 0, max: 50 };
        // y.domain([0, 50]);
      }
    }
    return yDomain;
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
    this.makeGraph();
  }

  makeGraph() {

    //Remove  all previous graphs
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
    let yAxisLabel, xAxisLabel: string;
    if (this.isFan) {
      yAxisLabel = "Pressure (" + this.getDisplayUnit(this.settings.fanPressureMeasurement) + ")"
      xAxisLabel = "Flow Rate (" + this.getDisplayUnit(this.settings.fanFlowRate) + ")"
    } else {
      yAxisLabel = "Head (" + this.getDisplayUnit(this.settings.distanceMeasurement) + ")";
      xAxisLabel = "Flow Rate (" + this.getDisplayUnit(this.settings.flowMeasurement) + ")"
    }

    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, xAxisLabel);
    this.lineChartHelperService.setYAxisLabel(this.svg, this.width, this.height, -60, 0, yAxisLabel);
    let xRange: { min: number, max: number } = { min: 0, max: this.width };
    let xDomain = this.getXDomain();
    this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);
    let yRange: { min: number, max: number } = { min: this.height, max: 0 };
    let yDomain = this.getYDomain();
    this.y = this.lineChartHelperService.setScale("linear", yRange, yDomain);
    let xTickFormat = d3.format(".2s");
    let yTickFormat = d3.format(".2s");
    this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 5, 0, 0, 0, xTickFormat);
    this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 5, 0, 0, 15, yTickFormat);

    //Load data here
    let data: Array<{ x: number, y: number, fluidPower: number }>;
    if (this.x.domain()[1] < 500) {
      data = this.systemCurveService.getCurvePointData(this.settings, this.x, this.y, this.x.domain()[1] / 500, this.isFan, this.staticHead, this.lossCoefficient, this.curveConstants);
    }
    else {
      data = this.systemCurveService.getCurvePointData(this.settings, this.x, this.y, 1, this.isFan, this.staticHead, this.lossCoefficient, this.curveConstants);
    }

    let lineData: Array<{ x: number, y: number, fluidPower: number }> = new Array<{ x: number, y: number, fluidPower: number }>();
    for (let i = 0; i < data.length; i++) {
      let tmpData = { x: data[i].x, y: data[i].y, fluidPower: data[i].fluidPower };
      lineData.push(tmpData);
    }
    this.line = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.line = this.lineChartHelperService.drawLine(this.line, this.x, this.y, lineData);

    // Define the div for the tooltip
    this.detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
    this.detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);
    this.focus = this.lineChartHelperService.appendFocus(this.svg, "focusSystemCurve");
    let allData: Array<Array<{ x: number, y: number, fluidPower: number }>> = [lineData];
    let allD: Array<{ x: number, y: number, fluidPower: number }> = [this.d];
    let allFocus: Array<d3.Selection<any>> = [this.focus];
    let format: any = d3.format(",.2f");
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

    let staticLabel: string;
    let distanceMeasurement: string;
    if (this.isFan) {
      staticLabel = 'Calculated Static Pressure: ';
      distanceMeasurement = this.getDisplayUnit(this.settings.fanPressureMeasurement);
    } else {
      staticLabel = 'Calculated Static Head: ';
      distanceMeasurement = this.getDisplayUnit(this.settings.distanceMeasurement);
    }
    this.svg.append("text")
      .attr("id", "staticHeadText")
      .attr("x", 20)
      .attr("y", "20")
      .html(staticLabel + this.staticHead + ' ' + distanceMeasurement)
      .style("font-size", this.fontSize)
      .style("font-weight", "bold");
    this.svg.append("text")
      .attr("id", "lossCoefficientText")
      .attr("x", 20)
      .attr("y", "40")
      .text("Calculated K (loss coefficient): " + this.lossCoefficient.toExponential(3))
      .style("font-size", this.fontSize)
      .style("font-weight", "bold");
    d3.selectAll("line").style("pointer-events", "none");
  }

  //dynamic table
  buildTable() {
    let i = this.rowData.length + this.deleteCount;
    let borderColorIndex = Math.floor(i / this.graphColors.length);
    let dArray: Array<any> = this.lineChartHelperService.getDArray();
    this.d = dArray[0];
    let format: any = d3.format(",.2f");
    let tableFocus: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePoint-" + this.tablePoints.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.d.x), this.y(this.d.y));
    this.focusD.push(this.d);
    this.tablePoints.push(tableFocus);
    let dataPiece = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length],
      flowRate: format(this.d.x).toString(),
      headOrPressure: headOrPressure,
      distance: format(this.d.y).toString(),
      fluidPower: format(this.d.fluidPower).toString()
    }
    this.tableData.push(dataPiece);

    let colors = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length]
    };
    this.keyColors.push(colors);
    let data = [format(this.d.x).toString(), format(this.d.y).toString(), format(this.d.fluidPower).toString()];
    this.rowData.push(data);
  }

  //dynamic table
  resetTableData() {
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, headOrPressure: string, distance: string, fluidPower: string }>();
    this.tablePoints = new Array<d3.Selection<any>>();
    this.focusD = new Array<{ x: number, y: number, fluidPower: number }>();
    this.deleteCount = 0;
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
  }

  //dynamic table
  replaceFocusPoints() {
    this.svg.selectAll('.tablePoint').remove();
    for (let i = 0; i < this.tablePoints.length; i++) {
      let tableFocus: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePoint-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusD[i].x), this.y(this.focusD[i].y));
    }
  }

  deleteFromTable(i: number) {
    for (let j = i; j < this.tableData.length - 1; j++) {
      this.tableData[j] = this.tableData[j + 1];
      this.tablePoints[j] = this.tablePoints[j + 1];
      this.focusD[j] = this.focusD[j + 1];
      this.rowData[j] = this.rowData[j + 1];
      this.keyColors[j] = this.keyColors[j + 1];
    }
    if (i != this.tableData.length - 1) {
      this.deleteCount += 1;
    }
    this.tableData.pop();
    this.tablePoints.pop();
    this.focusD.pop();
    this.rowData.pop();
    this.keyColors.pop();
    this.replaceFocusPoints();
  }

  highlightPoint(i: number) {
    let ids: Array<string> = ["#tablePoint-" + i];
    this.lineChartHelperService.tableHighlightPointHelper(this.svg, ids);
  }

  unhighlightPoint(i: number) {
    let ids: Array<string> = ["#tablePoint-" + i];
    this.lineChartHelperService.tableUnhighlightPointHelper(this.svg, ids);
    this.replaceFocusPoints();
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
      this.exportName = "system-curve-graph";
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
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code == 'Escape') {
        this.contractChart();
      }
    }
  }
}
