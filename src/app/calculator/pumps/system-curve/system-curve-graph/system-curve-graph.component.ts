import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import * as d3 from 'd3';
import { PsatService } from '../../../../psat/psat.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { SystemCurveService } from '../system-curve.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

var flowMeasurement: string;
var distanceMeasurement: string;
var powerMeasurement: string;
var headOrPressure: string;
var flowVal: number;
var distanceVal: number;
var powerVal: number;

@Component({
  selector: 'app-system-curve-graph',
  templateUrl: './system-curve-graph.component.html',
  styleUrls: ['./system-curve-graph.component.css']
})
export class SystemCurveGraphComponent implements OnInit {
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
  settings: Settings;
  @Input()
  isFan: boolean;

  @ViewChild("ngChartContainer") ngChartContainer: ElementRef;
  @ViewChild("ngChart") ngChart: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
  exportName: string;

  svg: any;
  xAxis: any;
  yAxis: any;
  width: any;
  height: any;
  margin: any;
  line: any;
  filter: any;
  detailBox: any;
  tooltipPointer: any;
  pointer: any;
  focus: any;
  isGridToggled: boolean;

  //dynamic table variables
  d: any;
  focusD: Array<any>;
  x: any;
  y: any;
  curveChanged: boolean = false;
  graphColors: Array<string>;
  tableData: Array<{ borderColor: string, fillColor: string, flowRate: string, headOrPressure: string, distance: string, fluidPower: string }>;
  tablePoints: Array<any>;

  //dynamic table - specific to system curve graph
  flowMeasurement: string;
  distanceMeasurement: string;
  powerMeasurement: string;
  deleteCount: number = 0;

  canvasWidth: number;
  canvasHeight: number;
  fontSize: string;

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
  constructor(private systemCurveService: SystemCurveService, private convertUnitsService: ConvertUnitsService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, headOrPressure: string, distance: string, fluidPower: string }>();
    this.tablePoints = new Array<any>();
    this.focusD = new Array<any>();

    if (!this.lossCoefficient) {
      this.lossCoefficient = 0;
    }
    if (!this.staticHead) {
      this.staticHead = 0;
    }

    this.isGridToggled = false;

    d3.select('app-system-curve').selectAll('#gridToggleBtn')
      .on("click", () => {
        this.toggleGrid();
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

  ngAfterViewInit() {
    this.resizeGraph();
  }

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
      this.fontSize = '8px';
      this.margin = { top: 10, right: 35, bottom: 50, left: 50 };
    } else {
      this.fontSize = '12px';
      this.margin = { top: 20, right: 45, bottom: 75, left: 95 };
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;
    d3.select("app-system-curve").select("#gridToggle").style("top", (this.height + 100) + "px");
    this.makeGraph();
  }

  makeGraph() {

    //Remove  all previous graphs
    d3.select(this.ngChart.nativeElement).selectAll('svg').remove();

    this.svg = d3.select(this.ngChart.nativeElement).append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // filters go in defs element
    var defs = this.svg.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    this.filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    this.filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    this.filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = this.filter.append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    var data = [];

    this.svg.append('rect')
      .attr("id", "graph")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("fill", "#F8F9F9")
      .style("filter", "url(#drop-shadow)");


    let yAxisLabel, xAxisLabel: string;
    if (this.isFan) {
      yAxisLabel = "Pressure (" + this.getDisplayUnit(this.settings.fanPressureMeasurement) + ")"
      xAxisLabel = "Flow Rate (" + this.getDisplayUnit(this.settings.fanFlowRate) + ")"
    } else {
      yAxisLabel = "Head (" + this.getDisplayUnit(this.settings.distanceMeasurement) + ")";
      xAxisLabel = "Flow Rate (" + this.getDisplayUnit(this.settings.flowMeasurement) + ")"
    }

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (-60) + "," + (this.height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .html(yAxisLabel);

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .html(xAxisLabel);

    var x = d3.scaleLinear()
      .range([0, this.width]);
    this.x = x;

    var y = d3.scaleLinear()
      .range([this.height, 0]);
    this.y = y;

    if (this.pointOne.form.controls.flowRate.value > this.pointTwo.form.controls.flowRate.value) {
      if (this.pointOne.form.controls.flowRate.value > 50 && this.pointOne.form.controls.flowRate.value < 25000) {
        x.domain([0, this.pointOne.form.controls.flowRate.value * 1.2]);
      } else if (this.pointOne.form.controls.flowRate.value > 50 && this.pointOne.form.controls.flowRate.value > 25000) {
        x.domain([0, this.pointOne.form.controls.flowRate.value * 1.2]);
      } else {
        x.domain([0, 50]);
      }
    }
    else {
      if (this.pointTwo.form.controls.flowRate.value > 50 && this.pointTwo.form.controls.flowRate.value < 25000) {
        x.domain([0, this.pointTwo.form.controls.flowRate.value * 1.2]);
      } else if (this.pointTwo.form.controls.flowRate.value > 50 && this.pointTwo.form.controls.flowRate.value > 25000) {
        x.domain([0, this.pointTwo.form.controls.flowRate.value * 1.2]);
      } else {
        x.domain([0, 50]);
      }
    }


    //right now, domain is capped at 25000 even if value is > 25000
    if (this.pointOne.form.controls.head.value > this.pointTwo.form.controls.head.value) {
      let domainVal = this.pointOne.form.controls.head.value + (this.pointOne.form.controls.head.value / 10);
      if (domainVal > 50 && domainVal < 25000) {
        y.domain([0, domainVal * 1.2]);
      } else if (domainVal > 50 && domainVal > 25000) {
        y.domain([0, domainVal * 1.2]);
      } else {
        y.domain([0, 50]);
      }
    }
    else {
      let domainVal = this.pointTwo.form.controls.head.value + (this.pointTwo.form.controls.head.value / 10);
      if (domainVal > 50 && domainVal < 25000) {
        y.domain([0, domainVal * 1.2]);
      } else if (domainVal > 50 && domainVal > 25000) {
        y.domain([0, domainVal * 1.2]);
      } else {
        y.domain([0, 50]);
      }
    }

    if (this.isGridToggled) {
      this.xAxis = d3.axisBottom()
        .scale(x)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(0)
        .ticks(5)
        .tickSize(-this.height)
        // .attr("class", "grid-line")
        .tickFormat(d3.format(".2s"));

      this.yAxis = d3.axisLeft()
        .scale(y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .ticks(5)
        .tickSize(-this.width)
        .tickFormat(d3.format(".2s"));
    }
    else {
      this.xAxis = d3.axisBottom()
        .scale(x)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(0)
        .ticks(5)
        .tickSize(0)
        .tickFormat(d3.format(".2s"));

      this.yAxis = d3.axisLeft()
        .scale(y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .ticks(5)
        .tickSize(0)
        .tickFormat(d3.format(".2s"));
    }

    this.xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis)
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", this.fontSize)
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", this.fontSize)
      .style('pointer-events', 'none');

    this.yAxis = this.svg.append('g')
      .attr("class", "y axis")
      .call(this.yAxis)
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("font-size", this.fontSize)
      .style('pointer-events', 'none');

    //Load data here
    if (x.domain()[1] < 500) {
      data = this.findPointValues(x, y, (x.domain()[1] / 500));
    }
    else {
      data = this.findPointValues(x, y, 1);
    }

    this.makeCurve(x, y, data);

    // Define the div for the tooltip
    this.detailBox = d3.select(this.ngChart.nativeElement).append("div")
      .attr("id", "detailBox")
      .attr("class", "d3-tip")
      .style("opacity", 0)
      .style('pointer-events', 'none');

    this.tooltipPointer = d3.select(this.ngChart.nativeElement).append("div")
      .attr("id", "tooltipPointer")
      .attr("class", "tooltip-pointer")
      .style("opacity", 1)
      .style('pointer-events', 'none');

    this.focus = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focus.append("circle")
      .attr("r", 8)
      .attr("id", "ring")
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px")
      .style('pointer-events', 'none');

    this.focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    var bisectDate = d3.bisector(function (d) { return d.x; }).left;

    var format = d3.format(",.2f");

    this.svg.select('#graph')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", () => {

        this.focus
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

        this.tooltipPointer
          .style("display", null)
          .style('pointer-events', 'none');

      })
      .on("mousemove", () => {

        this.focus
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

        this.tooltipPointer
          .style("display", null)
          .style('pointer-events', 'none');

        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i];
        this.d = x0 - d0.x > d1.x - x0 ? d1 : d0;   //dynamic table
        this.focus.attr("transform", "translate(" + x(this.d.x) + "," + y(this.d.y) + ")");   //dynaic table

        this.detailBox.transition()
          .style("opacity", 1);

        this.tooltipPointer.transition()
          .style("opacity", 1);

        var detailBoxWidth = 200;
        var detailBoxHeight = 80;

        //dynamic table
        flowVal = format(this.d.x);
        distanceVal = format(this.d.y);
        powerVal = format(this.d.fluidPower);

        //dynamic table
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
        this.flowMeasurement = flowMeasurement;
        this.distanceMeasurement = distanceMeasurement;
        this.powerMeasurement = powerMeasurement;

        this.detailBox
          .style("padding-top", "10px")
          .style("padding-right", "10px")
          .style("padding-bottom", "10px")
          .style("padding-left", "10px")
          .html(
            "<p><strong><div style='float:left; position: relative; top: -10px;'>Flow Rate: </div><div style='float:right; position: relative; top: -10px;'>" + format(this.d.x) + " " + flowMeasurement + "</div><br>" +             //dynamic table

            "<div style='float:left; position: relative; top: -10px;'>" + headOrPressure + ": </div><div style='float: right; position: relative; top: -10px;'>" + format(this.d.y) + " " + distanceMeasurement + "</div><br>" +      //dynamic table

            "<div style='float:left; position: relative; top: -10px;'>Fluid Power: </div><div style='float: right; position: relative; top: -10px;'>" + format(this.d.fluidPower) + " " + powerMeasurement + "</div></strong></p>")   //dynamic table

          .style("left", Math.min(((this.margin.left + x(this.d.x) - (detailBoxWidth / 2 - 17)) - 2), this.canvasWidth - detailBoxWidth) + "px")      //dynamic table
          .style("top", (this.margin.top + y(this.d.y) + 26) + "px")      //dynamic table
          .style("position", "absolute")
          .style("width", detailBoxWidth + "px")
          .style("height", detailBoxHeight + "px")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        this.tooltipPointer
          .attr("class", "tooltip-pointer")
          .html("<div></div>")
          .style("left", (this.margin.left + x(this.d.x)) + 5 + "px") //dynamic table
          .style("top", (this.margin.top + y(this.d.y) + 16) + "px")  //dynamic table
          .style("position", "absolute")
          .style("width", "0px")
          .style("height", "0px")
          .style("border-left", "10px solid transparent")
          .style("border-right", "10px solid transparent")
          .style("border-bottom", "10px solid white")
          .style('pointer-events', 'none');

      })
      .on("mouseout", () => {
        this.detailBox
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

        this.tooltipPointer
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

        this.focus
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);
      });

    //dynamic table
    if (!this.curveChanged) {
      this.replaceFocusPoints();
    }
    else {
      this.resetTableData();
    }
    this.curveChanged = false;

    var staticLabel: string;
    var distanceMeasurement: string;
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
    let i = this.tableData.length + this.deleteCount;
    let borderColorIndex = Math.floor(i / this.graphColors.length);

    let tableFocus = this.svg.append("g")
      .attr("class", "tablePoint")
      .style("display", null)
      .style("opacity", 1)
      .style('pointer-events', 'none');

    tableFocus.append("circle")
      .attr("r", 6)
      .attr("id", "tablePoint-" + this.tablePoints.length)
      .style("fill", this.graphColors[i % this.graphColors.length])
      .style("stroke", this.graphColors[borderColorIndex % this.graphColors.length])
      .style("stroke-width", "3px")
      .style('pointer-events', 'none');

    this.focusD.push(this.d);
    tableFocus.attr("transform", "translate(" + this.x(this.d.x) + "," + this.y(this.d.y) + ")");

    this.tablePoints.push(tableFocus);

    let dataPiece = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length],
      flowRate: flowVal.toString(),
      headOrPressure: headOrPressure,
      distance: distanceVal.toString(),
      fluidPower: powerVal.toString()
    }

    this.tableData.push(dataPiece);
  }

  //dynamic table
  resetTableData() {
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, headOrPressure: string, distance: string, fluidPower: string }>();
    this.tablePoints = new Array<any>();
    this.focusD = new Array<any>();
    this.deleteCount = 0;
  }

  //dynamic table
  replaceFocusPoints() {

    this.svg.selectAll('.tablePoint').remove();

    for (let i = 0; i < this.tablePoints.length; i++) {

      let tableFocus = this.svg.append("g")
        .attr("class", "tablePoint")
        .style("display", null)
        .style("opacity", 1)
        .style('pointer-events', 'none');

      tableFocus.append("circle")
        .attr("r", 6)
        .attr("id", "tablePoint-" + i)
        .style("fill",  this.tableData[i].fillColor)
        .style("stroke", this.tableData[i].borderColor)
        .style("stroke-width", "3px")
        .style('pointer-events', 'none');

      tableFocus.attr("transform", "translate(" + this.x(this.focusD[i].x) + "," + this.y(this.focusD[i].y) + ")");
    }
  }

  deleteFromTable(i: number) {

    for (let j = i; j < this.tableData.length - 1; j++) {
      this.tableData[j] = this.tableData[j + 1];
      this.tablePoints[j] = this.tablePoints[j + 1];
      this.focusD[j] = this.focusD[j + 1];
    }

    if (i != this.tableData.length - 1) {
      this.deleteCount += 1;
    }

    this.tableData.pop();
    this.tablePoints.pop();
    this.focusD.pop();
    this.replaceFocusPoints();
  }

  highlightPoint(i: number) {
    let x = this.x;
    let y = this.y;
    var highlightedPoint = this.svg.select('#tablePoint-' + i)
      .attr('r', 8);

    repeat();

    function repeat() {
      let tempXPos = (Math.random() * (2 - (0)) + (0)) - 1;
      let tempYPos = (Math.random() * (2 - (0)) + (0)) - 1;

      highlightedPoint.transition()
        .ease(d3.easeBounce)
        .duration(50)
        .attr("transform", "translate(" + tempXPos + "," + tempYPos + ")")
        .on('end', repeat);
    }
  }

  unhighlightPoint(i: number) {
    this.svg.select('#tablePoint-' + i).interrupt().attr('r', 6);
    this.replaceFocusPoints();
  }

  findPointValues(x, y, increment) {

    var powerMeasurement: string;
    if (this.isFan) {
      powerMeasurement = this.settings.fanPowerMeasurement;
    } else {
      powerMeasurement = this.settings.powerMeasurement;
    }

    //Load data here
    var data = [];

    var head = this.staticHead + this.lossCoefficient * Math.pow(x.domain()[1], this.curveConstants.form.controls.systemLossExponent.value);

    if (head >= 0) {
      let tmpFluidPower;
      if (this.isFan) {
        tmpFluidPower = this.systemCurveService.getFanFluidPower(this.staticHead, 0, this.curveConstants.form.controls.specificGravity.value);
      } else {
        tmpFluidPower = this.systemCurveService.getPumpFluidPower(this.staticHead, 0, this.curveConstants.form.controls.specificGravity.value);
      }
      if (powerMeasurement != 'hp' && tmpFluidPower != 0) {
        tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(powerMeasurement);
      }
      data.push({
        x: 0,
        y: this.staticHead + this.lossCoefficient * Math.pow(0, this.curveConstants.form.controls.systemLossExponent.value),
        fluidPower: tmpFluidPower
      });
    }
    else {
      data.push({
        x: 0,
        y: 0,
        fluidPower: 0
      });
    }


    for (var i = 0; i <= x.domain()[1]; i += increment) {
      var head = this.staticHead + this.lossCoefficient * Math.pow(i, this.curveConstants.form.controls.systemLossExponent.value);
      if (head > y.domain()[1]) {
        y.domain([0, (head + (head / 9))]);
      }

      if (head >= 0) {
        let tmpFluidPower: number;
        if (this.isFan) {
          tmpFluidPower = this.systemCurveService.getFanFluidPower(this.staticHead, i, this.curveConstants.form.controls.specificGravity.value);
        } else {
          tmpFluidPower = this.systemCurveService.getPumpFluidPower(this.staticHead, i, this.curveConstants.form.controls.specificGravity.value);;
        }
        if (powerMeasurement != 'hp' && tmpFluidPower != 0) {
          tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(powerMeasurement);
        }
        data.push({
          x: i,
          y: head,
          fluidPower: tmpFluidPower
        });
      }
      else {
        data.push({
          x: i,
          y: 0,
          fluidPower: 0
        });
      }
    }

    head = this.staticHead + this.lossCoefficient * Math.pow(x.domain()[1], this.curveConstants.form.controls.systemLossExponent.value);

    if (head >= 0) {
      let tmpFluidPower: number;
      if (this.isFan) {
        tmpFluidPower = this.systemCurveService.getFanFluidPower(this.staticHead, x.domain()[1], this.curveConstants.form.controls.specificGravity.value);
      } else {
        tmpFluidPower = this.systemCurveService.getPumpFluidPower(this.staticHead, x.domain()[1], this.curveConstants.form.controls.specificGravity.value);;
      }
      if (powerMeasurement != 'hp' && tmpFluidPower != 0) {
        tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(powerMeasurement);
      }
      data.push({
        x: x.domain()[1],
        y: this.staticHead + this.lossCoefficient * Math.pow(x.domain()[1], this.curveConstants.form.controls.systemLossExponent.value),
        fluidPower: tmpFluidPower
      });
    }
    else {
      data.push({
        x: x.domain()[1],
        y: 0,
        fluidPower: 0
      });

    }

    return data;
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

  makeCurve(x, y, data) {

    var line = d3.line()
      .x(function (d) { return x(d.x); })
      .y(function (d) { return y(d.y); })
      .curve(d3.curveNatural);

    this.svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", line)
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#145A32")
      .style('pointer-events', 'none');

    d3.select("path.domain").attr("d", "");
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

}
