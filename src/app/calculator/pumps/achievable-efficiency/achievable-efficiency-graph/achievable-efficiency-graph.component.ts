import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';

declare const d3: any;

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
  pointer: any;
  focus: any;

  firstChange: boolean = true;

  results: any = {
    max: 0,
    average: 0
  }
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.setUp();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleCalculate) {
        if (this.checkForm()) {
          this.onChanges();
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  calculateYaverage(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.value.pumpType,
        flow
      );
      return tmpResults.average;
    } else { return 0 }
  }

  calculateYmax(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.value.pumpType,
        flow
      );
      return tmpResults.max;
    } else { return 0 }
  }

  drawGraph() {
    if (this.checkForm()) {
      this.results.max = this.calculateYmax(this.efficiencyForm.value.flowRate);
      this.results.average = this.calculateYaverage(this.efficiencyForm.value.flowRate);
    }
  }

  checkForm() {
    if (
      this.efficiencyForm.controls.pumpType.status == 'VALID' &&
      this.efficiencyForm.controls.flowRate.status == 'VALID'
    ) {
      return true;
    } else {
      return false;
    }
  }

  setUp() {

    //Remove  all previous graphs
    d3.select('app-achievable-efficiency-graph').selectAll('svg').remove();

    var curvePoints = [];

    //graph dimensions
    this.margin = { top: 20, right: 120, bottom: 110, left: 120 };
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 5000]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 100]);

    this.xAxis = d3.axisBottom()
      .scale(this.x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0)
      .ticks(16);

    this.yAxis = d3.axisLeft()
      .scale(this.y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(15)
      .ticks(11);

    this.svg = d3.select('app-achievable-efficiency-graph').append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .style("background-color", "#f5f3e9")
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
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)");

    this.svg.append("path")
      .attr("id", "areaUnderCurve");

    this.xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", "13px")
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", "12px");

    this.yAxis = this.svg.append('g')
      .attr("class", "y axis")
      .call(this.yAxis)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("font-size", "13px");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (-60) + "," + (this.height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Achievable Efficiency (%)");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("Flow Rate, gpm");

    this.maxLine = this.svg.append("path")
      .attr("class", "line")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#f53e3d");

    this.averageLine = this.svg.append("path")
        .attr("class", "line")
        .style("stroke-width", 10)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .style("stroke", "#fecb00");

    this.focus = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    this.focus.append("circle")
      .attr("r", 10)
      .style("fill", "none")
      .style("stroke", "#007536")
      .style("stroke-width", "3px");

    this.focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "20")
      .text("Achievable Efficiency (max): ")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", "#f53e3d");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "50")
      .text("Achievable Efficiency (average): ")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", "#fecb00");

   this.maxValue = this.svg.append("text")
      .attr("x", 250)
      .attr("y", "20")
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.averageValue = this.svg.append("text")
      .attr("x", 250)
      .attr("y", "50")
      .style("font-size", "13px")
      .style("font-weight", "bold");

  }

  onChanges() {
    this.drawMaxLine();
    this.drawAverageLine();
    this.updateValues();
  }

  drawAverageLine() {
    var data = [];

    for (var i = 2; i < 5000; i++) {
       if(this.calculateYaverage(i) <= 100) {
         data.push({
           x: i,
           y: this.calculateYaverage(i)
         })
       }
    }

    var currentLine = d3.line()
      .x((d) => { return this.x(d.x); })
      .y((d) => { return this.y(d.y); })
      .curve(d3.curveNatural);

    this.averageLine
      .data([data])
      .attr("d", currentLine);

  }

  drawMaxLine() {
    var data = [];

    for (var i = 2; i < 5000; i++) {
      if(this.calculateYmax(i) <= 100) {
        data.push({
          x: i,
          y: this.calculateYmax(i)
        })
      }
    }

    var currentLine = d3.line()
      .x((d) => { return this.x(d.x); })
      .y((d) => { return this.y(d.y); })
      .curve(d3.curveNatural);

    this.maxLine
      .data([data])
      .attr("d", currentLine);

  }

  updateValues(){

    var format = d3.format(".3n");

    this.maxValue
      .text(format(this.calculateYmax(this.efficiencyForm.value.flowRate)));

    this.averageValue
      .text(format(this.calculateYaverage(this.efficiencyForm.value.flowRate)));
  }

}
