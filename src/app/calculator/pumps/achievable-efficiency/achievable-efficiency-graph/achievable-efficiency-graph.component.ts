import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';

import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import * as d3 from 'd3';
@Component({
  selector: 'app-achievable-efficiency-graph',
  templateUrl: './achievable-efficiency-graph.component.html',
  styleUrls: ['./achievable-efficiency-graph.component.css']
})
export class AchievableEfficiencyGraphComponent implements OnInit {
  @Input()
  efficiencyForm: any;
  @Input()
  toggleCalculate: boolean;
  @Input()
  settings: Settings;

  @ViewChild("ngChart") ngChart: ElementRef;
  exportName: string;

  svg: any;
  x: any;
  y: any;
  xAxis: any;
  yAxis: any;
  width: any;
  height: any;
  maxLine: any;
  averageLine: any;
  maxValue: any;
  averageValue: any;
  margin: any;
  line: any;
  filter: any;
  detailBox: any;
  tooltipPointer: any;
  pointer: any;
  focusAvg: any;
  focusMax: any;

  avgPoint: any;
  maxPoint: any;

  firstChange: boolean = true;
  isGridToggled: boolean;

  results: any = {
    max: 0,
    average: 0
  };

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;
  fontSize: string;

  avgData: any;
  maxData: any;
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService, private windowRefService: WindowRefService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.isGridToggled = false;

    d3.select('app-achievable-efficiency').selectAll('#gridToggleBtn')
      .on("click", () => {
        this.toggleGrid();
      });
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

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.window.onresize = () => { this.resizeGraph() };
    this.resizeGraph();
  }

  ngOnDestroy() {
    this.window.onresize = null;
  }

  resizeGraph() {
    let curveGraph = this.doc.getElementById('achievableEfficiencyGraph');

    this.canvasWidth = curveGraph.clientWidth;
    this.canvasHeight = this.canvasWidth * (3 / 5);

    if (this.canvasWidth < 400) {
      this.fontSize = '8px';

      //debug
      this.margin = { top: 10, right: 35, bottom: 50, left: 50 };
      
      //real version
      // this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      this.fontSize = '11px';

      //debug
      this.margin = { top: 20, right: 45, bottom: 75, left: 95 };      

      //real version
      // this.margin = { top: 20, right: 20, bottom: 75, left: 120 };
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;

    d3.select("app-achievable-efficiency").select("#gridToggle").style("top", (this.height + 100) + "px");

    this.makeGraph();
  }


  calculateYaverage(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.controls.pumpType.value,
        flow,
        this.settings
      );
      return tmpResults.average;
    } else { return 0 }
  }

  calculateYmax(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.controls.pumpType.value,
        flow,
        this.settings
      );
      return tmpResults.max;
    } else { return 0 }
  }


  checkForm() {
    if (
      this.efficiencyForm.controls.pumpType.status == 'VALID' &&
      this.efficiencyForm.controls.flowRate.status == 'VALID' &&
      this.efficiencyForm.controls.pumpType.value != 'Specified Optimal Efficiency'
    ) {
      return true;
    } else {
      return false;
    }
  }

  makeGraph() {

    //Remove  all previous graphs
    d3.select(this.ngChart.nativeElement).selectAll('svg').remove();
    var curvePoints = [];

    this.avgData = this.getAvgData();
    this.maxData = this.getMaxData();
    let tmpMax: any = _.maxBy(_.union(this.avgData, this.maxData), (val: { x: number, y: number }) => { return val.y; });
    let tmpMin: any = _.minBy(_.union(this.avgData, this.maxData), (val: { x: number, y: number }) => { return val.y; });
    let max = tmpMax.y;
    let min = tmpMin.y;

    this.svg = d3.select(this.ngChart.nativeElement).append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")

      //debug
      .attr("transform", "translate(" + (this.margin.left) + "," + this.margin.top + ")");
      
      //real version
      // .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

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

    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 5000]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([(min - 10), (max + 10)]);

    if (this.isGridToggled) {
      this.xAxis = d3.axisBottom()
        .scale(this.x)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(0)
        .tickSize(-this.height)
        .ticks(16);

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .tickSize(-this.width)
        .ticks(11);
    }
    else {
      this.xAxis = d3.axisBottom()
        .scale(this.x)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(0)
        .tickSize(0)
        .ticks(16);

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .tickSize(0)
        .ticks(11);
    }

    this.xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis)
      
      //debug
      .attr("class", "grid")    

      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", this.fontSize)
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", this.fontSize);

    this.yAxis = this.svg.append('g')
      .attr("class", "y axis")
      .call(this.yAxis)

      //debug
      .attr("class", "grid")
      
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("font-size", this.fontSize);

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (-60) + "," + (this.height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Achievable Efficiency (%)");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("Flow Rate (" + this.settings.flowMeasurement + ')');

    this.maxLine = this.svg.append("path")
      .attr("class", "line")
      .attr("id", "maxLine")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#145A32")
      .style('pointer-events', 'none');

    this.averageLine = this.svg.append("path")
      .attr("class", "line")
      .attr("id", "avgLine")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#3498DB")
      .style('pointer-events', 'none');

    this.maxPoint = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.maxPoint.append("circle")
      .attr("r", 6)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "2px");

    this.maxPoint.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    this.avgPoint = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.avgPoint.append("circle")
      .attr("r", 6)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "2px");

    this.avgPoint.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");


    this.maxValue = this.svg.append("text")
      .attr("x", 250)
      .attr("y", "20")
      .style("font-size", this.fontSize)
      .style("font-weight", "bold");

    this.averageValue = this.svg.append("text")
      .attr("x", 250)
      .attr("y", "50")
      .style("font-size", this.fontSize)
      .style("font-weight", "bold");

    // Define the div for the tooltip
    this.detailBox = d3.select(this.ngChart.nativeElement).append("div")
      .attr("id", "detailBox")
      .attr("class", "d3-tip")
      .style("opacity", 0)
      .style('pointer-events', 'none');

    //debug
    this.tooltipPointer = d3.select(this.ngChart.nativeElement).append("div")
      .attr("id", "tooltipPointer")
      .attr("class", "tooltip-pointer")
      .style("opacity", 0)
      .style('pointer-events', 'none');

    //debug
    const detailBoxWidth = 160;
    const detailBoxHeight = 120;

    //real version
    // const detailBoxWidth = 160;
    // const detailBoxHeight = 120;

    this.pointer = this.svg.append("polygon")
      .attr("id", "pointer")
      //.attr("points", "0,13, 14,13, 7,-2");
      .attr("points", "0,0, 0," + (detailBoxHeight - 2) + "," + detailBoxWidth + "," + (detailBoxHeight - 2) + "," + detailBoxWidth + ", 0," + ((detailBoxWidth / 2) + 12) + ",0," + (detailBoxWidth / 2) + ", -12, " + ((detailBoxWidth / 2) - 12) + ",0")
      .style("opacity", 0)
      .style('pointer-events', 'none');

    this.focusMax = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focusMax.append("circle")
      .attr("r", 8)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.focusMax.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    this.focusAvg = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focusAvg.append("circle")
      .attr("r", 8)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.focusAvg.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    this.drawMaxLine();
    this.drawAverageLine();
    this.updateValues();
    this.drawPoints();

    var format = d3.format(",.2f");
    var bisectDate = d3.bisector(function (d) { return d.x; }).left;
    this.svg.select('#graph')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", () => {

        this.focusAvg
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        this.focusMax
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        this.pointer
          .style("display", null)
          .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

        //debug
        this.tooltipPointer
          .style("display", null)
          .style('pointer-events', 'none');
      })
      .on("mousemove", () => {

        //debug
        this.focusAvg
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        this.focusMax
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        this.pointer
          // .style("display", null)
          .style('pointer-events', 'none');
        this.detailBox
          // .style("display", null)
          .style('pointer-events', 'none');
        this.tooltipPointer
          // .style("display", null)
          .style('pointer-events', 'none');

        //real version
        // this.focusAvg
        //   .style("display", null)
        //   .style("opacity", 1)
        //   .style('pointer-events', 'none');
        // this.focusMax
        //   .style("display", null)
        //   .style("opacity", 1)
        //   .style('pointer-events', 'none');
        // this.pointer
        //   .style("display", null)
        //   .style('pointer-events', 'none');
        // this.detailBox
        //   .style("display", null)
        //   .style('pointer-events', 'none');

        //maxpoint
        let maxX0 = this.x.invert(d3.mouse(d3.event.currentTarget)[0]);
        let maxI = bisectDate(this.maxData, maxX0, 1);
        if (maxI >= this.maxData.length) {
          maxI = this.maxData.length - 1
        }
        let maxD0 = this.maxData[maxI - 1];
        let maxD1 = this.maxData[maxI];
        let maxD = maxX0 - maxD0.x > maxD1.x - maxX0 ? maxD1 : maxD0;
        this.focusMax.attr("transform", "translate(" + this.x(maxD.x) + "," + this.y(maxD.y) + ")");

        //average point
        let avgX0 = this.x.invert(d3.mouse(d3.event.currentTarget)[0]);
        let avgI = bisectDate(this.avgData, avgX0, 1);
        if (avgI >= this.avgData.length) {
          avgI = this.avgData.length - 1
        }
        let avgD0 = this.avgData[avgI - 1];
        let avgD1 = this.avgData[avgI];
        let avgD = avgX0 - avgD0.x > avgD1.x - avgX0 ? avgD1 : avgD0;
        this.focusAvg.attr("transform", "translate(" + this.x(avgD.x) + "," + this.y(avgD.y) + ")");

        // this.pointer.transition()
        //   .style("opacity", 1);
        //debug
        this.tooltipPointer.transition()
          .style("opacity", 1);

        this.detailBox.transition()
          .style("opacity", 1);

        var detailBoxWidth = 160;
        var detailBoxHeight = 120;
        var tooltipPointerWidth = detailBoxWidth * 0.05;
        var tooltipPointerHeight = detailBoxHeight * 0.05;

        //real version
        // this.pointer
        //   .attr("transform", 'translate(' + (this.x(avgD.x) - (detailBoxWidth / 2)) + ',' + (this.y(avgD.y) + 27) + ')')
        //   .style("fill", "#ffffff")
        //   .style("filter", "url(#drop-shadow)");

        //debug 
        this.detailBox
          .style("padding-right", "10px")
          .style("padding-left", "10px")
          .html(
          "<div class='tooltip-pointer'></div><p><strong><div>Flow Rate: </div></strong><div>" + format(maxD.flowRate) + " " + this.settings.flowMeasurement + "</div>" +
          "<strong><div>Maximum: </div></strong><div>" + format(maxD.y) + " %</div>" +
          "<strong><div>Average: </div></strong><div>" + format(avgD.y) + " %</div></p>")

          // "<div style='float:left;'>Fluid Power: </div><div style='float: right;'>" + format(d.fluidPower) + " </div></strong></p>")
          .style("left", Math.min(((this.margin.left + this.x(avgD.x) - (detailBoxWidth / 2 - 17)) - 2), this.canvasWidth - detailBoxWidth) + "px")
          // .style("left", (this.margin.left + this.x(avgD.x) - (detailBoxWidth / 2 - 17)) - 2 + "px")
          .style("top", (this.margin.top + this.y(avgD.y) + 26) + "px")
          .style("position", "absolute")
          .style("width", detailBoxWidth + "px")
          .style("height", detailBoxHeight + "px")
          .style("padding-left", "10px")
          .style("padding-right", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        this.tooltipPointer
          .attr("class", "tooltip-pointer")
          .html("<div></div>")
          .style("left", (this.margin.left + this.x(avgD.x)) + 5 + "px")
          .style("top", (this.margin.top + this.y(avgD.y) + 16) + "px")
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

        this.focusAvg
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

        this.focusMax
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);
      });

    this.svg.selectAll("line").style("pointer-events", "none");
  }

  getAvgData() {
    let data = new Array();
    for (var i = 0; i < 5000; i = i + 10) {
      if (this.calculateYaverage(i) <= 100) {
        data.push({
          x: i,
          y: this.calculateYaverage(i),
          flowRate: i
        })
      }
    }
    return data;
  }

  getMaxData() {
    let data = new Array();
    for (var i = 0; i < 5000; i = i + 10) {
      if (this.calculateYmax(i) <= 100) {
        data.push({
          x: i,
          y: this.calculateYmax(i),
          flowRate: i
        })
      }
    }
    return data;
  }

  drawAverageLine() {
    var data = this.avgData;

    var currentLine = d3.line()
      .x((d) => { return this.x(d.x); })
      .y((d) => { return this.y(d.y); })
      .curve(d3.curveNatural);

    this.averageLine
      .data([data])
      .attr("d", currentLine);

  }

  drawMaxLine() {
    var data = this.maxData;

    var currentLine = d3.line()
      .x((d) => { return this.x(d.x); })
      .y((d) => { return this.y(d.y); })
      .curve(d3.curveNatural);

    this.maxLine
      .data([data])
      .attr("d", currentLine);

  }

  updateValues() {

    var format = d3.format(".3n");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "20")
      .text("Achievable Efficiency (max): " + format(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) + ' %')
      .style("font-size", this.fontSize)
      .style("font-weight", "bold")
      .style("fill", "#145A32");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "50")
      .text("Achievable Efficiency (average): " + format(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) + ' %')
      .style("font-size", this.fontSize)
      .style("font-weight", "bold")
      .style("fill", "#3498DB");

  }

  drawPoints() {
    this.maxPoint
      .attr("transform", () => {
        if (this.y(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return "translate(" + this.x(this.efficiencyForm.controls.flowRate.value) + "," + this.y(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) + ")";
        }
      })
      .style("display", () => {
        if (this.y(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return null;
        } else {
          return "none";
        }
      });

    this.avgPoint
      .attr("transform", () => {
        if (this.y(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return "translate(" + this.x(this.efficiencyForm.controls.flowRate.value) + "," + this.y(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) + ")";
        }
      })
      .style("display", () => {
        if (this.y(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return null;
        } else {
          return "none";
        }
      });
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
      this.exportName = "achievable-efficiency-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }



}
