import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { SvgToPngService } from '../../../../shared/helper-services/svg-to-png.service';
import * as d3 from 'd3';
import { FormGroup } from '@angular/forms';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { LineChartHelperService } from '../../../../shared/helper-services/line-chart-helper.service';

@Component({
  selector: 'app-motor-performance-graph',
  templateUrl: './motor-performance-graph.component.html',
  styleUrls: ['./motor-performance-graph.component.css']
})
export class MotorPerformanceGraphComponent implements OnInit {
  @Input()
  performanceForm: FormGroup;
  @Input()
  toggleCalculate: boolean;
  @Input()
  settings: Settings;

  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;
  @ViewChild('btnDownload', { static: false }) btnDownload: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }
  exportName: string;

  svg: d3.Selection<any>;
  xAxis: d3.Selection<any>;
  yAxis: d3.Selection<any>;
  filter: d3.Selection<any>;
  currentLine: d3.Selection<any>;
  powerLine: d3.Selection<any>;
  efficiencyLine: d3.Selection<any>;
  focusCurrent: d3.Selection<any>;
  focusPowerFactor: d3.Selection<any>;
  focusEfficiency: d3.Selection<any>;

  tablePointsEfficiency: Array<d3.Selection<any>>;
  tablePointsPower: Array<d3.Selection<any>>;
  tablePointsCurrent: Array<d3.Selection<any>>;

  dEfficiency: { x: number, y: number };
  dPower: { x: number, y: number };
  dCurrent: { x: number, y: number };
  focusDEfficiency: Array<{ x: number, y: number }>;
  focusDPower: Array<{ x: number, y: number }>;
  focusDCurrent: Array<{ x: number, y: number }>;

  currentData: Array<{ x: number, y: number }>;
  efficiencyData: Array<{ x: number, y: number }>;
  powerFactorData: Array<{ x: number, y: number }>;

  detailBox: d3.Selection<any>;
  detailBoxPointer: d3.Selection<any>;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;
  x: any;
  xShow: any;
  y: any;
  width: number;
  height: number;
  margin: { top: number, right: number, bottom: number, left: number };
  isGridToggled: boolean;

  //dynamic table variables
  curveChanged: boolean = false;
  graphColors: Array<string>;
  tableData: Array<{ borderColor: string, fillColor: string, motorShaftLoad: string, current: string, powerFactor: string, efficiency: string }>;

  motorShaftLoad: number;
  current: number;
  powerFactor: number;
  efficiency: number;
  tempMotorPower: number;
  tempRpm: number;
  tempEfficiencyClass: string;
  tempVoltage: number;
  tempAmps: number;
  tempLineFrequency: string;
  deleteCount: number = 0;
  deleteIndex: number;

  motorPerformanceResults: any = {
    efficiency: 0,
    motor_current: 0,
    motor_power_factor: 0
  };
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

  constructor(private psatService: PsatService, private lineChartHelperService: LineChartHelperService, private svgToPngService: SvgToPngService) { }


  //exportable table variables
  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  keyColors: Array<{ borderColor: string, fillColor: string }>;

  ngOnInit() {
    this.graphColors = graphColors;
    this.tableData = new Array<{ borderColor: string, fillColor: string, motorShaftLoad: string, current: string, powerFactor: string, efficiency: string }>();
    this.tablePointsEfficiency = new Array<d3.Selection<any>>();
    this.tablePointsPower = new Array<d3.Selection<any>>();
    this.tablePointsCurrent = new Array<d3.Selection<any>>();
    this.focusDEfficiency = new Array<{ x: number, y: number }>();
    this.focusDPower = new Array<{ x: number, y: number }>();
    this.focusDCurrent = new Array<{ x: number, y: number }>();
    this.tempMotorPower = this.performanceForm.controls.horsePower.value;
    this.tempEfficiencyClass = this.performanceForm.controls.efficiencyClass.value;
    this.tempRpm = this.performanceForm.controls.motorRPM.value;
    this.tempAmps = this.performanceForm.controls.fullLoadAmps.value;
    this.tempVoltage = this.performanceForm.controls.motorVoltage.value;
    this.tempLineFrequency = this.performanceForm.controls.frequency.value;
    this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    this.initTooltipData();

    this.isGridToggled = false;

    //init for exportable table
    this.columnTitles = new Array<string>();
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    this.initColumnTitles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleCalculate) {
        if (this.checkForm()) {
          this.makeGraph();
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  initTooltipData() {
    this.tooltipData.push({
      label: "Motor Shaft Load",
      value: null,
      unit: "",
      formatX: true
    });
    this.tooltipData.push({
      label: "Current",
      value: null,
      unit: "% FLC",
      formatX: false
    });
    this.tooltipData.push({
      label: "Power Factor",
      value: null,
      unit: "%",
      formatX: false
    });
    this.tooltipData.push({
      label: "Efficiency",
      value: null,
      unit: "%",
      formatX: false
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }

  initColumnTitles() {
    this.columnTitles = ['Motor Shaft Load (%)', 'Current (%)', 'Power Factor (%)', 'Efficiency (%)'];
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
  // ========== end tooltip functions ==========



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

  calculateEfficiency(loadFactor: number) {
    if (this.checkForm()) {
      // let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.controls.frequency.value,
        this.performanceForm.controls.efficiencyClass.value,
        this.performanceForm.controls.horsePower.value,
        this.performanceForm.controls.motorRPM.value,
        this.performanceForm.controls.efficiency.value,
        this.performanceForm.controls.motorVoltage.value,
        this.performanceForm.controls.fullLoadAmps.value,
        loadFactor,
        this.settings
      );
      return results.efficiency;
    }
  }

  calculateCurrent(loadFactor: number) {
    if (this.checkForm()) {
      // let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.controls.frequency.value,
        this.performanceForm.controls.efficiencyClass.value,
        this.performanceForm.controls.horsePower.value,
        this.performanceForm.controls.motorRPM.value,
        this.performanceForm.controls.efficiency.value,
        this.performanceForm.controls.motorVoltage.value,
        this.performanceForm.controls.fullLoadAmps.value,
        loadFactor,
        this.settings
      );
      return results.motor_current;
    } else {
      return 0;
    }
  }

  calculatePowerFactor(loadFactor: number) {
    if (this.checkForm()) {
      // let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.controls.frequency.value,
        this.performanceForm.controls.efficiencyClass.value,
        this.performanceForm.controls.horsePower.value,
        this.performanceForm.controls.motorRPM.value,
        this.performanceForm.controls.efficiency.value,
        this.performanceForm.controls.motorVoltage.value,
        this.performanceForm.controls.fullLoadAmps.value,
        loadFactor,
        this.settings
      );
      return results.motor_power_factor;
    } else {
      return 0;
    }
  }

  checkForm() {
    if (this.performanceForm.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  drawGraph() {
    this.motorPerformanceResults.efficiency = this.calculateEfficiency(1);
    this.motorPerformanceResults.motor_current = this.calculateCurrent(1);
    this.motorPerformanceResults.motor_power_factor = this.calculatePowerFactor(1);
  }

  makeGraph() {
    if (this.tempMotorPower !== this.performanceForm.controls.horsePower.value) {
      this.curveChanged = true;
      this.tempMotorPower = this.performanceForm.controls.horsePower.value;
    }
    if (this.tempEfficiencyClass !== this.performanceForm.controls.efficiencyClass.value) {
      this.curveChanged = true;
      this.tempEfficiencyClass = this.performanceForm.controls.efficiencyClass.value;
    }
    if (this.tempRpm !== this.performanceForm.controls.motorRPM.value) {
      this.curveChanged = true;
      this.tempRpm = this.performanceForm.controls.motorRPM.value;
    }
    if (this.tempAmps !== this.performanceForm.controls.fullLoadAmps.value) {
      this.curveChanged = true;
      this.tempRpm = this.performanceForm.controls.fullLoadAmps.value;
    }
    if (this.tempVoltage !== this.performanceForm.controls.motorVoltage.value) {
      this.curveChanged = true;
      this.tempVoltage = this.performanceForm.controls.motorVoltage.value;
    }
    if (this.tempLineFrequency !== this.performanceForm.controls.frequency.value) {
      this.curveChanged = true;
      this.tempLineFrequency = this.performanceForm.controls.frequency.value;
    }

    //Remove all previous graphs - 
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);

    let xRange: { min: number, max: number };
    xRange = {
      min: 0,
      max: this.width
    };
    let xDomain: { min: number, max: number };
    xDomain = {
      min: 0,
      max: 1.21
    };
    this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);

    xDomain = {
      min: 0,
      max: 120
    };
    this.xShow = this.lineChartHelperService.setScale('linear', xRange, xDomain);

    let yRange: { min: number, max: number };
    yRange = {
      min: this.height,
      max: 0
    };
    let yDomain: { min: number, max: number };
    yDomain = {
      min: 0,
      max: 120
    };
    this.y = this.lineChartHelperService.setScale('linear', yRange, yDomain);

    this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.xShow, this.height, this.isGridToggled, 13, 0, 0, 0);
    this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 13, 0, 0, 15);

    this.svg.append("path")
      .attr("id", "areaUnderCurve");
    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, "Motor Shaft Load (%)");
    this.lineChartHelperService.setYAxisLabel(this.svg, this.width, this.height, -60, 0, "Current (% FLA), Efficiency (%), PF (%)");

    // Define the div for the tooltip
    this.detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
    this.detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);

    ///////////////////////////////////////////////
    this.currentLine = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.powerLine = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
    this.efficiencyLine = this.lineChartHelperService.appendLine(this.svg, "#A569BD", "2px");
    this.focusCurrent = this.lineChartHelperService.appendFocus(this.svg, "focusCurrent");
    this.focusPowerFactor = this.lineChartHelperService.appendFocus(this.svg, "focusPowerFactor");
    this.focusEfficiency = this.lineChartHelperService.appendFocus(this.svg, "focusEfficiency");

    this.currentData = this.getCurrentData();
    this.powerFactorData = this.getPowerFactorData();
    this.efficiencyData = this.getEfficiencyData();

    this.currentLine = this.lineChartHelperService.drawLine(this.currentLine, this.x, this.y, this.currentData);
    this.powerLine = this.lineChartHelperService.drawLine(this.powerLine, this.x, this.y, this.powerFactorData);
    this.efficiencyLine = this.lineChartHelperService.drawLine(this.efficiencyLine, this.x, this.y, this.efficiencyData);
    let allData: Array<Array<{ x: number, y: number }>> = [this.currentData, this.powerFactorData, this.efficiencyData];
    let allD: Array<{ x: number, y: number }> = [this.dCurrent, this.dPower, this.dEfficiency];
    let allFocus: Array<d3.Selection<any>> = [this.focusCurrent, this.focusPowerFactor, this.focusEfficiency];
    var xFormat = d3.format(",.0%");
    let yFormat = d3.format(",.2f");
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
      xFormat,
      yFormat,
      this.tooltipData,
      this.canvasWidth
    );

    if (this.curveChanged) {
      this.resetTableData();
      this.curveChanged = false;
    }
    else {
      this.replaceFocusPoints();
    }
    d3.selectAll("line").style("pointer-events", "none");
    this.addLegend();
  }

  addLegend() {
    this.svg.append("line")
      .attr("x1", this.width - 25)
      .attr("y1", this.height + 47)
      .attr("x2", this.width - 5)
      .attr("y2", this.height + 47)
      .attr("stroke", "#145A32")
      .attr("stroke-width", 2);
    this.svg.append("text")
      .attr("x", this.width - 30)
      .attr("y", this.height + 49)
      .attr("text-anchor", "end")
      .attr("font-size", 8)
      .text("Current");
    this.svg.append("line")
      .attr("x1", this.width - 25)
      .attr("y1", this.height + 57)
      .attr("x2", this.width - 5)
      .attr("y2", this.height + 57)
      .attr("stroke", "#3498DB")
      .attr("stroke-width", 2);
    this.svg.append("text")
      .attr("x", this.width - 30)
      .attr("y", this.height + 59)
      .attr("text-anchor", "end")
      .attr("font-size", 8)
      .text("Power");
    this.svg.append("line")
      .attr("x1", this.width - 25)
      .attr("y1", this.height + 67)
      .attr("x2", this.width - 5)
      .attr("y2", this.height + 67)
      .attr("stroke", "#A569BD")
      .attr("stroke-width", 2);
    this.svg.append("text")
      .attr("x", this.width - 30)
      .attr("y", this.height + 69)
      .attr("text-anchor", "end")
      .attr("font-size", 8)
      .text("Efficiency");
  }


  getCurrentData(): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    let i = .001;
    for (i; i <= 1.2; i = i + 0.01) {
      let current = this.calculateCurrent(i);
      if (current >= 0 && current <= this.height) {
        data.push({
          x: i,
          y: this.psatService.roundVal(current, 3)
        });
      }
    }
    return data;
  }

  getEfficiencyData(): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    for (var i = .001; i <= 1.2; i = i + .01) {
      let efficiency = this.calculateEfficiency(i);
      if (efficiency >= 0 && efficiency <= 120) {
        data.push({
          x: i,
          y: this.psatService.roundVal(efficiency, 3)
        });
      }
    }
    return data;
  }

  getPowerFactorData(): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    for (var i = .001; i <= 1.2; i = i + .01) {
      let powerFactor = this.calculatePowerFactor(i);
      if (powerFactor >= 0 && powerFactor <= 120) {
        data.push({
          x: i,
          y: this.psatService.roundVal(powerFactor, 3)
        });
      }
    }
    return data;
  }


  //dynamic table
  buildTable() {
    let i = this.rowData.length + this.deleteCount;
    let borderColorIndex = Math.floor(i / this.graphColors.length);
    let dArray: Array<any> = this.lineChartHelperService.getDArray();
    this.dCurrent = dArray[0];
    this.dPower = dArray[1];
    this.dEfficiency = dArray[2];
    //current line
    let tableFocusCurrent: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointCurrent-" + this.tablePointsCurrent.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dCurrent.x), this.y(this.dCurrent.y));
    this.focusDCurrent.push(this.dCurrent);
    this.tablePointsCurrent.push(tableFocusCurrent);

    //Power Factor line
    let tableFocusPower: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPower-" + this.tablePointsPower.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dPower.x), this.y(this.dPower.y));
    this.focusDPower.push(this.dPower);
    this.tablePointsPower.push(tableFocusPower);

    //Efficiency line
    let tableFocusEfficiency: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointEfficiency-" + this.tablePointsEfficiency.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dEfficiency.x), this.y(this.dEfficiency.y));
    this.focusDEfficiency.push(this.dEfficiency);
    this.tablePointsEfficiency.push(tableFocusEfficiency);

    this.current = this.dCurrent.y;
    this.powerFactor = this.dPower.y;
    this.efficiency = this.dEfficiency.y;

    let dataPiece = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length],
      motorShaftLoad: Math.floor(this.dEfficiency.x * 100).toString(),
      current: this.current.toString(),
      powerFactor: this.powerFactor.toString(),
      efficiency: this.efficiency.toString()
    };
    this.tableData.push(dataPiece);
    let colors = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length]
    };
    this.keyColors.push(colors);
    let data = [Math.floor(this.dEfficiency.x * 100).toString(), this.current.toString(), this.powerFactor.toString(), this.efficiency.toString()];
    this.rowData.push(data);
  }

  //dynamic table
  resetTableData() {
    this.tableData = new Array<{ borderColor: string, fillColor: string, motorShaftLoad: string, current: string, powerFactor: string, efficiency: string }>();
    this.tablePointsCurrent = new Array<d3.Selection<any>>();
    this.tablePointsPower = new Array<d3.Selection<any>>();
    this.tablePointsEfficiency = new Array<d3.Selection<any>>();
    this.focusDCurrent = new Array<{ x: number, y: number }>();
    this.focusDPower = new Array<{ x: number, y: number }>();
    this.focusDEfficiency = new Array<{ x: number, y: number }>();
    this.rowData = new Array<Array<string>>();
    this.deleteCount = 0;
  }

  //dynamic table
  replaceFocusPoints() {
    this.svg.selectAll('.tablePoint').remove();
    for (let i = 0; i < this.rowData.length; i++) {
      let tableFocusCurrent: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointCurrent-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDCurrent[i].x), this.y(this.focusDCurrent[i].y));
      let tableFocusPower: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPower-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDPower[i].x), this.y(this.focusDPower[i].y));
      let tableFocusEfficiency: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointEfficiency-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDEfficiency[i].x), this.y(this.focusDEfficiency[i].y));
    }
  }

  deleteFromTable(i: number) {
    for (let j = i; j < this.tableData.length - 1; j++) {
      this.tableData[j] = this.tableData[j + 1];
      this.tablePointsCurrent[j] = this.tablePointsCurrent[j + 1];
      this.tablePointsEfficiency[j] = this.tablePointsEfficiency[j + 1];
      this.tablePointsPower[j] = this.tablePointsPower[j + 1];
      this.focusDCurrent[j] = this.focusDCurrent[j + 1];
      this.focusDEfficiency[j] = this.focusDEfficiency[j + 1];
      this.focusDPower[j] = this.focusDPower[j + 1];
      this.rowData[j] = this.rowData[j + 1];
      this.keyColors[j] = this.keyColors[j + 1];
    }
    if (i !== this.tableData.length - 1) {
      this.deleteCount += 1;
    }
    this.tableData.pop();
    this.tablePointsCurrent.pop();
    this.tablePointsEfficiency.pop();
    this.tablePointsPower.pop();
    this.focusDCurrent.pop();
    this.focusDEfficiency.pop();
    this.focusDPower.pop();
    this.rowData.pop();
    this.keyColors.pop();
    this.replaceFocusPoints();
  }

  highlightPoint(i: number) {
    let ids: Array<string> = ['#tablePointEfficiency-' + i, '#tablePointPower-' + i, '#tablePointCurrent-' + i];
    this.lineChartHelperService.tableHighlightPointHelper(this.svg, ids);
  }

  unhighlightPoint(i: number) {
    let ids: Array<string> = ['#tablePointEfficiency-' + i, '#tablePointPower-' + i, '#tablePointCurrent-' + i];
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
      this.exportName = "motor-performance-graph";
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
