import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import * as d3 from 'd3';
import { FormGroup } from '@angular/forms';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { LineChartHelperService } from '../../../../shared/line-chart-helper/line-chart-helper.service';

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

  @ViewChild("ngChartContainer") ngChartContainer: ElementRef;
  @ViewChild("ngChart") ngChart: ElementRef;
  @ViewChild('btnDownload') btnDownload: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code == 'Escape') {
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
  // detailBox: any;
  // focus: any;

  // powerFactorData: any;
  // efficiencyData: any;
  // currentData: any;
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
    // d3.select("app-motor-performance").select("#gridToggle").style("top", (this.height + 100) + "px");

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
      return true
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

    if (this.tempMotorPower != this.performanceForm.controls.horsePower.value) {
      this.curveChanged = true;
      this.tempMotorPower = this.performanceForm.controls.horsePower.value;
    }
    if (this.tempEfficiencyClass != this.performanceForm.controls.efficiencyClass.value) {
      this.curveChanged = true;
      this.tempEfficiencyClass = this.performanceForm.controls.efficiencyClass.value;
    }
    if (this.tempRpm != this.performanceForm.controls.motorRPM.value) {
      this.curveChanged = true;
      this.tempRpm = this.performanceForm.controls.motorRPM.value
    }
    if (this.tempAmps != this.performanceForm.controls.fullLoadAmps.value) {
      this.curveChanged = true;
      this.tempRpm = this.performanceForm.controls.fullLoadAmps.value;
    }
    if (this.tempVoltage != this.performanceForm.controls.motorVoltage.value) {
      this.curveChanged = true;
      this.tempVoltage = this.performanceForm.controls.motorVoltage.value;
    }
    if (this.tempLineFrequency != this.performanceForm.controls.frequency.value) {
      this.curveChanged = true;
      this.tempLineFrequency = this.performanceForm.controls.frequency.value;
    }

    //Remove all previous graphs - 
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    // d3.select(this.ngChart.nativeElement).selectAll('svg').remove();

    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    // this.svg = d3.select(this.ngChart.nativeElement).append('svg')
    //   .attr("width", this.width + this.margin.left + this.margin.right)
    //   .attr("height", this.height + this.margin.top + this.margin.bottom)
    //   .append("g")
    //   .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    // filters go in defs element
    // var defs = this.svg.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    // this.filter = defs.append("filter")
    //   .attr("id", "drop-shadow")
    //   .attr("height", "130%");

    // // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // // convolve that with a Gaussian with standard deviation 3 and store result
    // // in blur
    // this.filter.append("feGaussianBlur")
    //   .attr("in", "SourceAlpha")
    //   .attr("stdDeviation", 3)
    //   .attr("result", "blur");

    // // translate output of Gaussian blur to the right and downwards with 2px
    // // store result in offsetBlur
    // this.filter.append("feOffset")
    //   .attr("in", "blur")
    //   .attr("dx", 0)
    //   .attr("dy", 0)
    //   .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    // var feMerge = this.filter.append("feMerge");

    // feMerge.append("feMergeNode")
    //   .attr("in", "offsetBlur");
    // feMerge.append("feMergeNode")
    //   .attr("in", "SourceGraphic");


    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
    // this.svg.append('rect')
    //   .attr("id", "graph")
    //   .attr("width", this.width)
    //   .attr("height", this.height)
    //   .style("fill", "#F8F9F9")
    //   .style("filter", "url(#drop-shadow)");

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
    // this.x = d3.scaleLinear()
    //   .range([0, this.width])
    //   .domain([0, 1.21]);

    xDomain = {
      min: 0,
      max: 120
    };
    this.xShow = this.lineChartHelperService.setScale('linear', xRange, xDomain);
    // this.xShow = d3.scaleLinear()
    //   .range([0, this.width])
    //   .domain([0, 120]);

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
    // this.y = d3.scaleLinear()
    //   .range([this.height, 0])
    //   .domain([0, 120]);


    this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.xShow, this.height, this.isGridToggled, 13, 0, 0, 0);
    this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 13, 0, 0, 15);

    // if (this.isGridToggled) {
    //   this.xAxis = d3.axisBottom()
    //     .scale(this.xShow)
    //     .tickSizeInner(0)
    //     .tickSizeOuter(0)
    //     .tickPadding(0)
    //     .tickSize(-this.height)
    //     .ticks(13);

    //   this.yAxis = d3.axisLeft()
    //     .scale(this.y)
    //     .tickSizeInner(0)
    //     .tickSizeOuter(0)
    //     .tickPadding(15)
    //     .tickSize(-this.width)
    //     .ticks(13);
    // }
    // else {
    //   this.xAxis = d3.axisBottom()
    //     .scale(this.xShow)
    //     .tickSizeInner(0)
    //     .tickSizeOuter(0)
    //     .tickPadding(0)
    //     .tickSize(0)
    //     .ticks(13);

    //   this.yAxis = d3.axisLeft()
    //     .scale(this.y)
    //     .tickSizeInner(0)
    //     .tickSizeOuter(0)
    //     .tickPadding(15)
    //     .tickSize(0)
    //     .ticks(13);
    // }

    // this.xAxis = this.svg.append('g')
    //   .attr("class", "x axis")
    //   .attr("transform", "translate(0," + this.height + ")")
    //   .call(this.xAxis)
    //   .style("stroke-width", ".5px")
    //   .selectAll('text')
    //   .style("text-anchor", "end")
    //   .style("font-size", "13px")
    //   .attr("transform", "rotate(-65) translate(-15, 0)")
    //   .attr("dy", "12px");


    // this.yAxis = this.svg.append('g')
    //   .attr("class", "y axis")
    //   .call(this.yAxis)
    //   .style("stroke-width", ".5px")
    //   .selectAll('text')
    //   .style("font-size", "13px");

    this.svg.append("path")
      .attr("id", "areaUnderCurve");


    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, "Motor Shaft Load (%)");
    // this.svg.append("text")
    //   .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
    //   .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
    //   .text("Motor Shaft Load (%)");

    // Define the div for the tooltip

    // const detailBoxWidth = 160;
    // const detailBoxHeight = 80;
    this.detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
    // this.detailBox = d3.select("app-motor-preformance-graph").append("div")
    //   .attr("id", "detailBox")
    //   .attr("class", "d3-tip")
    //   .style("opacity", 0);

    this.detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);
    // this.pointer = this.svg.append("polygon")
    //   .attr("id", "pointer")
    //   .attr("points", "0,0, 0," + (detailBoxHeight - 2) + "," + detailBoxWidth + "," + (detailBoxHeight - 2) + "," + detailBoxWidth + ", 0," + ((detailBoxWidth / 2) + 12) + ",0," + (detailBoxWidth / 2) + ", -12, " + ((detailBoxWidth / 2) - 12) + ",0")
    //   .style("opacity", 0);


    ///////////////////////////////////////////////
    this.currentLine = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    // this.currentLine = this.svg.append("path")
    //   .attr("class", "line")
    //   .style("stroke-width", 10)
    //   .style("stroke-width", "2px")
    //   .style("fill", "none")
    //   .style("stroke", "#145A32")
    //   .style("display", "none")
    //   .style('pointer-events', 'none');

    this.powerLine = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
    // this.powerLine = this.svg.append("path")
    //   .attr("class", "line")
    //   .style("stroke-width", 10)
    //   .style("stroke-width", "2px")
    //   .style("fill", "none")
    //   .style("stroke", "#3498DB")
    //   .style("display", "none")
    //   .style('pointer-events', 'none');

    this.efficiencyLine = this.lineChartHelperService.appendLine(this.svg, "#A569BD", "2px");
    // this.efficiencyLine = this.svg.append("path")
    //   .attr("class", "line")
    //   .style("stroke-width", 10)
    //   .style("stroke-width", "2px")
    //   .style("fill", "none")
    //   .style("stroke", "#A569BD")
    //   .style("display", "none")
    //   .style('pointer-events', 'none');


    this.focusCurrent = this.lineChartHelperService.appendFocus(this.svg, "focusCurrent");
    // this.focusCurrent = this.svg.append("g")
    //   .attr('id', 'focusCurrent')
    //   .attr("class", "focus")
    //   .style("display", "none")
    //   .style('pointer-events', 'none');

    // console.log('focusCurrent = ');
    // console.log(this.focusCurrent);

    // this.focusCurrent.append("circle")
    //   .attr("r", 6)
    //   .style("fill", "none")
    //   .style("stroke", "#000000")
    //   .style("stroke-width", "3px");

    // this.focusCurrent.append("text")
    //   .attr("x", 9)
    //   .attr("dy", ".35em");

    this.focusPowerFactor = this.lineChartHelperService.appendFocus(this.svg, "focusPowerFactor");
    // this.focusPowerFactor = this.svg.append("g")
    //   .attr('id', 'focusPowerFactor')
    //   .attr("class", "focus")
    //   .style("display", "none")
    //   .style('pointer-events', 'none');

    // this.focusPowerFactor.append("circle")
    //   .attr("r", 6)
    //   .style("fill", "none")
    //   .style("stroke", "#000000")
    //   .style("stroke-width", "3px");

    // this.focusPowerFactor.append("text")
    //   .attr("x", 9)
    //   .attr("dy", ".35em");

    this.focusEfficiency = this.lineChartHelperService.appendFocus(this.svg, "focusEfficiency");
    // this.focusEfficiency = this.svg.append("g")
    //   .attr('id', 'focusEfficiency')
    //   .attr("class", "focus")
    //   .style("display", "none")
    //   .style('pointer-events', 'none');

    // this.focusEfficiency.append("circle")
    //   .attr("r", 6)
    //   .style("fill", "none")
    //   .style("stroke", "#000000")
    //   .style("stroke-width", "3px");

    // this.focusEfficiency.append("text")
    //   .attr("x", 9)
    //   .attr("dy", ".35em");


    this.currentData = this.getCurrentData();
    this.powerFactorData = this.getPowerFactorData();
    this.efficiencyData = this.getEfficiencyData();

    this.currentLine = this.lineChartHelperService.drawLine(this.currentLine, this.x, this.y, this.currentData);
    // this.drawCurrentLine(this.x, this.y, this.currentData);

    this.powerLine = this.lineChartHelperService.drawLine(this.powerLine, this.x, this.y, this.powerFactorData);
    // this.drawPowerFactorLine(this.x, this.y, this.powerFactorData);

    this.efficiencyLine = this.lineChartHelperService.drawLine(this.efficiencyLine, this.x, this.y, this.efficiencyData);
    // this.drawEfficiencyLine(this.x, this.y, this.efficiencyData);


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
    // this.initFocusCircles(this.powerFactorData, this.efficiencyData, this.currentData, this.x, this.y);

    if (this.curveChanged) {
      this.resetTableData();
      this.curveChanged = false;
    }
    else {
      this.replaceFocusPoints();
    }
    d3.selectAll("line").style("pointer-events", "none");
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
        })
      }
    }
    return data;
  }

  getEfficiencyData(): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    for (var i = .001; i <= 1.2; i = i + .01) {
      let efficiency = this.calculateEfficiency(i)
      if (efficiency >= 0 && efficiency <= 120) {
        data.push({
          x: i,
          y: this.psatService.roundVal(efficiency, 3)
        })
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
        })
      }
    }
    return data;
  }

  // drawCurrentLine(x, y, data) {
  //   var currentLi = d3.line()
  //     .x(function (d) { return x(d.x); })
  //     .y(function (d) { return y(d.y); })
  //     .curve(d3.curveNatural);
  //   console.log('currentLi = ');
  //   console.log(currentLi);

  //   this.currentLine
  //     .data([data])
  //     .attr("d", currentLi)
  //     .style("display", null);
  //   console.log('this.currentLine = ');
  //   console.log(this.currentLine);
  // }

  // drawPowerFactorLine(x: any, y: any, data) {
  //   var powerFactorLine = d3.line()
  //     .x(function (d) { return x(d.x); })
  //     .y(function (d) { return y(d.y); })
  //     .curve(d3.curveNatural);

  //   this.powerLine
  //     .data([data])
  //     .attr("d", powerFactorLine)
  //     .style("display", null);
  // }

  // drawEfficiencyLine(x, y, data) {
  //   var efficiencyLi = d3.line()
  //     .x(function (d) { return x(d.x); })
  //     .y(function (d) { return y(d.y); })
  //     .curve(d3.curveNatural);

  //   this.efficiencyLine
  //     .data([data])
  //     .attr("d", efficiencyLi)
  //     .style("display", null);
  // }

  // initFocusCircles(powerFactorData, efficiencyData, currentData, x, y) {
  //   var format = d3.format(",.2f");
  //   var bisectDate = d3.bisector(function (d) { return d.x; }).left;
  //   this.svg.select('#graph')
  //     .attr("width", this.width)
  //     .attr("height", this.height)
  //     .attr("class", "overlay")
  //     .attr("fill", "#ffffff")
  //     .style("filter", "url(#drop-shadow)")
  //     .on("mouseover", () => {

  //       this.focusCurrent
  //         .style("display", null)
  //         .style("opacity", 1)
  //         .style('pointer-events', 'none');

  //       this.focusEfficiency
  //         .style("display", null)
  //         .style("opacity", 1)
  //         .style('pointer-events', 'none');

  //       this.focusPowerFactor
  //         .style("display", null)
  //         .style("opacity", 1)
  //         .style('pointer-events', 'none');

  //     })
  //     .on("mousemove", () => {

  //       this.focusCurrent
  //         .style("display", null)
  //         .style("opacity", 1)
  //         .style('pointer-events', 'none');

  //       this.focusEfficiency
  //         .style("display", null)
  //         .style("opacity", 1)
  //         .style('pointer-events', 'none');

  //       this.focusPowerFactor
  //         .style("display", null)
  //         .style("opacity", 1)
  //         .style('pointer-events', 'none');

  //       //current
  //       let currentX0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
  //       let currentI = bisectDate(currentData, currentX0, 1);
  //       if (currentI >= currentData.length) {
  //         currentI = currentData.length - 1
  //       }
  //       let currentD0 = currentData[currentI - 1];
  //       let currentD1 = currentData[currentI];
  //       this.dCurrent = currentX0 - currentD0.x > currentD1.x - currentX0 ? currentD1 : currentD0;
  //       this.current = format(this.dCurrent.y);
  //       this.focusCurrent.attr("transform", "translate(" + this.x(this.dCurrent.x) + "," + this.y(this.dCurrent.y) + ")");

  //       this.svg.select("#currentText").remove();
  //       this.svg.append("text")
  //         .attr("id", "currentText")
  //         .attr("x", 20)
  //         .attr("y", "20")
  //         .text("Current: " + this.dCurrent.y + "% FLC")
  //         .style("font-size", "13px")
  //         .style("font-weight", "bold")
  //         .style("fill", "#145A32");

  //       //power factor
  //       if (powerFactorData.length != 0) {
  //         let powerX0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
  //         let powerI = bisectDate(powerFactorData, powerX0, 1);
  //         if (powerI >= powerFactorData.length) {
  //           powerI = powerFactorData.length - 1
  //         }
  //         let powerD0 = powerFactorData[powerI - 1];
  //         let powerD1 = powerFactorData[powerI];
  //         let powerD = powerX0 - powerD0.x > powerD1.x - powerX0 ? powerD1 : powerD0;
  //         this.dPower = powerD;
  //         this.powerFactor = format(this.dPower.y);
  //         this.focusPowerFactor.attr("transform", "translate(" + x(powerD.x) + "," + y(powerD.y) + ")");

  //         this.svg.select("#powerFactorText").remove();
  //         this.svg.append("text")
  //           .attr("id", "powerFactorText")
  //           .attr("x", 180)
  //           .attr("y", "20")
  //           .text("Power Factor: " + powerD.y + "%")
  //           .style("font-size", "13px")
  //           .style("font-weight", "bold")
  //           .style("fill", "#3498DB");
  //       } else {
  //         this.svg.select("#powerFactorText").remove();
  //         this.svg.select("#focusPowerFactor").remove();
  //       }

  //       //efficiency
  //       let efficiencyX0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
  //       let efficiencyI = bisectDate(efficiencyData, efficiencyX0, 1);
  //       if (efficiencyI >= efficiencyData.length) {
  //         efficiencyI = efficiencyData.length - 1
  //       }
  //       let efficiencyD0 = efficiencyData[efficiencyI - 1];
  //       let efficiencyD1 = efficiencyData[efficiencyI];
  //       let efficiencyD = efficiencyX0 - efficiencyD0.x > efficiencyD1.x - efficiencyX0 ? efficiencyD1 : efficiencyD0;
  //       this.dEfficiency = efficiencyD;
  //       this.efficiency = format(this.dEfficiency.y);
  //       this.focusEfficiency.attr("transform", "translate(" + x(efficiencyD.x) + "," + y(efficiencyD.y) + ")");

  //       this.svg.select("#efficiencyText").remove();
  //       this.svg.select("#i").remove();
  //       this.svg.append("text")
  //         .attr("id", "efficiencyText")
  //         .attr("x", 350)
  //         .attr("y", "20")
  //         .text("Efficiency: " + efficiencyD.y + "%")
  //         .style("font-size", "13px")
  //         .style("font-weight", "bold")
  //         .style("fill", "#A569BD");

  //       var percentFormat = d3.format(",.0%");
  //       this.motorShaftLoad = Math.floor(this.dEfficiency.x * 100);

  //       this.svg.append("text")
  //         .attr("id", "i")
  //         .attr("x", 20)
  //         .attr("y", "50")
  //         .text("Motor Shaft Load: " + percentFormat(efficiencyD.x))
  //         .style("font-size", "13px")
  //         .style("font-weight", "bold")
  //         .style("fill", "#000000");
  //     })
  //     .on("mouseout", () => {

  //       this.focusCurrent
  //         .transition()
  //         .delay(100)
  //         .duration(600)
  //         .style("opacity", 0);

  //       this.focusEfficiency
  //         .transition()
  //         .delay(100)
  //         .duration(600)
  //         .style("opacity", 0);

  //       this.focusPowerFactor
  //         .transition()
  //         .delay(100)
  //         .duration(600)
  //         .style("opacity", 0);

  //     });
  // }


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
    // let tableFocusCurrent = this.svg.append("g")
    //   .attr("class", "tablePoint")
    //   .style("display", null)
    //   .style("opacity", 1)
    //   .style('pointer-events', 'none');
    // tableFocusCurrent.append("circle")
    //   .attr("r", 6)
    //   .attr("id", "tablePointCurrent-" + this.tablePointsCurrent.length)
    //   .style("fill", this.graphColors[i % this.graphColors.length])
    //   .style("stroke", this.graphColors[borderColorIndex % this.graphColors.length])
    //   .style("stroke-width", "3px")
    //   .style('pointer-events', 'none');
    // console.log('dArray = ' + this.dArray)
    this.focusDCurrent.push(this.dCurrent);
    // tableFocusCurrent.attr("transform", "translate(" + this.x(this.dCurrent.x) + "," + this.y(this.dCurrent.y) + ")");
    this.tablePointsCurrent.push(tableFocusCurrent);

    //Power Factor line
    let tableFocusPower: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPower-" + this.tablePointsPower.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dPower.x), this.y(this.dPower.y));
    // let tableFocusPower = this.svg.append("g")
    //   .attr("class", "tablePoint")
    //   .style("display", null)
    //   .style("opacity", 1)
    //   .style('pointer-events', 'none');
    // tableFocusPower.append("circle")
    //   .attr("r", 6)
    //   .attr("id", "tablePointPower-" + this.tablePointsPower.length)
    //   .style("fill", this.graphColors[i % this.graphColors.length])
    //   .style("stroke", this.graphColors[borderColorIndex % this.graphColors.length])
    //   .style("stroke-width", "3px")
    //   .style('pointer-events', 'none');
    this.focusDPower.push(this.dPower);
    // tableFocusPower.attr("transform", "translate(" + this.x(this.dPower.x) + "," + this.y(this.dPower.y) + ")");
    this.tablePointsPower.push(tableFocusPower);

    //Efficiency line
    let tableFocusEfficiency: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointEfficiency-" + this.tablePointsEfficiency.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.dEfficiency.x), this.y(this.dEfficiency.y));
    // let tableFocusEfficiency = this.svg.append("g")
    //   .attr("class", "tablePoint")
    //   .style("display", null)
    //   .style("opacity", 1)
    //   .style('pointer-events', 'none');
    // tableFocusEfficiency.append("circle")
    //   .attr("r", 6)
    //   .attr("id", "tablePointEfficiency-" + (this.tablePointsEfficiency.length))
    //   .style("fill", this.graphColors[i % this.graphColors.length])
    //   .style("stroke", this.graphColors[borderColorIndex % this.graphColors.length])
    //   .style("stroke-width", "3px")
    //   .style('pointer-events', 'none');
    this.focusDEfficiency.push(this.dEfficiency);
    // tableFocusEfficiency.attr("transform", "translate(" + this.x(this.dEfficiency.x) + "," + this.y(this.dEfficiency.y) + ")");
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
      // let tableFocusCurrent = this.svg.append("g")
      //   .attr("class", "tablePoint")
      //   .style("display", null)
      //   .style("opacity", 1)
      //   .style('pointer-events', 'none');
      // tableFocusCurrent.append("circle")
      //   .attr("r", 6)
      //   .attr("id", "tablePointCurrent-" + i)
      //   .style("fill", this.tableData[i].fillColor)
      //   .style("stroke", this.tableData[i].borderColor)
      //   .style("stroke-width", "3px")
      //   .style('pointer-events', 'none');
      // tableFocusCurrent.attr("transform", "translate(" + this.x(this.focusDCurrent[i].x) + "," + this.y(this.focusDCurrent[i].y) + ")");

      let tableFocusPower: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointPower-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDPower[i].x), this.y(this.focusDPower[i].y));
      // let tableFocusPower = this.svg.append("g")
      //   .attr("class", "tablePoint")
      //   .style("display", null)
      //   .style("opacity", 1)
      //   .style('pointer-events', 'none');
      // tableFocusPower.append("circle")
      //   .attr("r", 6)
      //   .attr("id", "tablePointPower-" + i)
      //   .style("fill", this.tableData[i].fillColor)
      //   .style("stroke", this.tableData[i].borderColor)
      //   .style("stroke-width", "3px")
      //   .style('pointer-events', 'none');
      // tableFocusPower.attr("transform", "translate(" + this.x(this.focusDPower[i].x) + "," + this.y(this.focusDPower[i].y) + ")");

      let tableFocusEfficiency: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointEfficiency-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDEfficiency[i].x), this.y(this.focusDEfficiency[i].y));
      // let tableFocusEfficiency = this.svg.append("g")
      //   .attr("class", "tablePoint")
      //   .attr("id", "tablePointEfficiencyG-" + i)
      //   .style("display", null)
      //   .style("opacity", 1)
      //   .style('pointer-events', 'none');
      // tableFocusEfficiency.append("circle")
      //   .attr("r", 6)
      //   .attr("id", "tablePointEfficiency-" + i)
      //   .style("fill", this.tableData[i].fillColor)
      //   .style("stroke", this.tableData[i].borderColor)
      //   .style("stroke-width", "3px")
      //   .style('pointer-events', 'none');
      // tableFocusEfficiency.attr("transform", "translate(" + this.x(this.focusDEfficiency[i].x) + "," + this.y(this.focusDEfficiency[i].y) + ")");
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
    if (i != this.tableData.length - 1) {
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


    // var highlightedEfficiency = this.svg.select('#tablePointEfficiency-' + i)
    //   .attr('r', 8);
    // var highlightedPower = this.svg.select('#tablePointPower-' + i)
    //   .attr('r', 8);
    // var highlightedCurrent = this.svg.select('#tablePointCurrent-' + i)
    //   .attr('r', 8);

    // repeat();

    // function repeat() {
    //   let tempXPos = (Math.random() * (2 - (0)) + (0)) - 1;
    //   let tempYPos = (Math.random() * (2 - (0)) + (0)) - 1;

    //   highlightedEfficiency.transition()
    //     .ease(d3.easeBounce)
    //     .duration(50)
    //     .attr("transform", "translate(" + tempXPos + "," + tempYPos + ")")
    //     .on('end', repeat);
    //   highlightedPower.transition()
    //     .ease(d3.easeBounce)
    //     .duration(50)
    //     .attr("transform", "translate(" + tempXPos + "," + tempYPos + ")")
    //     .on('end', repeat);
    //   highlightedCurrent.transition()
    //     .ease(d3.easeBounce)
    //     .duration(50)
    //     .attr("transform", "translate(" + tempXPos + "," + tempYPos + ")")
    //     .on('end', repeat);
    // }
  }

  unhighlightPoint(i: number) {
    let ids: Array<string> = ['#tablePointEfficiency-' + i, '#tablePointPower-' + i, '#tablePointCurrent-' + i];
    this.lineChartHelperService.tableUnhighlightPointHelper(this.svg, ids);
    // this.svg.select('#tablePointEfficiency-' + i).interrupt().attr('r', 6);
    // this.svg.select('#tablePointPower-' + i).interrupt().attr('r', 6);
    // this.svg.select('#tablePointCurrent-' + i).interrupt().attr('r', 6);
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