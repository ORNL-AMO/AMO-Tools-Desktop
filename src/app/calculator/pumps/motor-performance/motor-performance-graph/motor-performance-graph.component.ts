import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';

declare const d3: any;

@Component({
  selector: 'app-motor-performance-graph',
  templateUrl: './motor-performance-graph.component.html',
  styleUrls: ['./motor-performance-graph.component.css']
})
export class MotorPerformanceGraphComponent implements OnInit {
  @Input()
  performanceForm: any;
  @Input()
  toggleCalculate: boolean;

  svg: any;
  xAxis: any;
  yAxis: any;
  x: any;
  y: any;
  width: any;
  height: any;
  staticHeadText: any;
  lossCoefficientText: any;
  margin: any;
  line: any;
  filter: any;
  detailBox: any;
  pointer: any;
  focus: any;


  motorPerformanceResults: any = {
    efficiency: 0,
    motor_current: 0,
    motor_power_factor: 0
  };
  firstChange: boolean = true;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.setUp();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (!this.firstChange) {
  //     if (changes.toggleCalculate) {
  //       this.drawGraph();
  //     }
  //   } else {
  //     this.firstChange = false;
  //   }
  // }

  calculateEfficiency(loadFactor: number) {
    if (this.checkForm()) {
      let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.value.frequency,
        this.performanceForm.value.efficiencyClass,
        this.performanceForm.value.horsePower,
        this.performanceForm.value.motorRPM,
        efficiency,
        this.performanceForm.value.motorVoltage,
        this.performanceForm.value.fullLoadAmps,
        loadFactor
      );
      return results.efficiency;
    }
  }

  calculateCurrent(loadFactor: number) {
    if (this.checkForm()) {
      let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.value.frequency,
        this.performanceForm.value.efficiencyClass,
        this.performanceForm.value.horsePower,
        this.performanceForm.value.motorRPM,
        efficiency,
        this.performanceForm.value.motorVoltage,
        this.performanceForm.value.fullLoadAmps,
        loadFactor
      );
      return results.motor_current;
    } else {
      return 0;
    }
  }

  calculatePowerFactor(loadFactor: number) {
    if (this.checkForm()) {
      let efficiency = this.psatService.getEfficiencyFromForm(this.performanceForm);
      let results = this.psatService.motorPerformance(
        this.performanceForm.value.frequency,
        this.performanceForm.value.efficiencyClass,
        this.performanceForm.value.horsePower,
        this.performanceForm.value.motorRPM,
        efficiency,
        this.performanceForm.value.motorVoltage,
        this.performanceForm.value.fullLoadAmps,
        loadFactor
      );
      return results.motor_power_factor;
    } else {
      return 0;
    }
  }

  checkForm() {
    if (this.performanceForm.controls.frequency.status == 'VALID' &&
      this.performanceForm.controls.horsePower.status == 'VALID' &&
      this.performanceForm.controls.motorRPM.status == 'VALID' &&
      this.performanceForm.controls.efficiencyClass.status == 'VALID' &&
      this.performanceForm.controls.motorVoltage.status == 'VALID' &&
      this.performanceForm.controls.fullLoadAmps.status == 'VALID'
    ) {
      if (this.performanceForm.value.efficiencyClass == 'Specified') {
        if (
          this.performanceForm.controls.efficiencyClassSpecified.status == 'VALID' &&
          this.performanceForm.controls.efficiencyClass.status == 'VALID'
        ) {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  drawGraph() {
    this.motorPerformanceResults.efficiency = this.calculateEfficiency(1);
    this.motorPerformanceResults.motor_current = this.calculateCurrent(1);
    this.motorPerformanceResults.motor_power_factor = this.calculatePowerFactor(1);
  }

  setUp(){

    //Remove  all previous graphs
    d3.select('app-motor-performance-graph').selectAll('svg').remove();

    var curvePoints = [];

    //graph dimensions
    this.margin = {top: 20, right: 120, bottom: 110, left: 120};
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 120]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 120]);

    this.xAxis = d3.axisBottom()
      .scale(this.x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0)
      .ticks(12);

    this.yAxis = d3.axisLeft()
      .scale(this.y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(15)
      .ticks(12);

    this.svg  = d3.select('app-motor-performance-graph').append('svg')
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
      .attr("transform", "translate("+ (this.width/2) +","+(this.height-(-70))+")")  // centre below axis
      .text("Motor Shaft Load(%)");

    // Define the div for the tooltip
    this.detailBox = d3.select("app-motor-preformance-graph").append("div")
      .attr("id", "detailBox")
      .attr("class", "d3-tip")
      .style("opacity", 0);

    const detailBoxWidth = 160;
    const detailBoxHeight = 80;

    this.pointer = this.svg.append("polygon")
      .attr("id", "pointer")
      //.attr("points", "0,13, 14,13, 7,-2");
      .attr("points", "0,0, 0," + (detailBoxHeight-2) +  "," + detailBoxWidth + "," +  (detailBoxHeight-2) + "," + detailBoxWidth + ", 0," + ((detailBoxWidth/2)+12) + ",0," + (detailBoxWidth/2) + ", -12, " + ((detailBoxWidth/2)- 12) + ",0")
      .style("opacity", 0);

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
  }

  ngOnChanges(changes: SimpleChanges) {

  }



}
