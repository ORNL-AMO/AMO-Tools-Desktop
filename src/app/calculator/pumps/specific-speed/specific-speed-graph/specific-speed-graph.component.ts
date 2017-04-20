import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';

declare const d3: any;

@Component({
  selector: 'app-specific-speed-graph',
  templateUrl: './specific-speed-graph.component.html',
  styleUrls: ['./specific-speed-graph.component.css']
})
export class SpecificSpeedGraphComponent implements OnInit {
  @Input()
  speedForm: any;


  svg: any;
  xAxis0: any;
  xAxis1: any;
  xAxis2: any;
  yAxis: any;
  x0: any;
  x1: any;
  x2: any;
  y: any;
  width: any;
  height: any;
  specificSpeedText: any;
  efficiencyCorrectionText: any;
  margin: any;
  line: any;
  filter: any;
  detailBox: any;
  pointer: any;
  focus: any;


  // @Input()
  // toggleCalculate: boolean;
  // specificSpeed: number = 0;
  // efficiencyCorrection: number = 0;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.setUp();
  }

  ngAfterViewInit() {
    //this.setUp();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleCalculate) {
  //     this.getValues();
  //   }
  // }

  // getValues(specificSpeed?: number) {
  //   if (this.checkForm()) {
  //     this.efficiencyCorrection = this.psatService.achievableEfficiency(this.speedForm.value.pumpType, this.getSpecificSpeed(this.speedForm));
  //   }
  // }

  getEfficiencyCorrection() {
    if (this.checkForm()) {
      return this.psatService.achievableEfficiency(this.speedForm.value.pumpType, this.getSpecificSpeed());
    } else {
      return 0;
    }
  }

  getSpecificSpeed(): number {
    if (this.checkForm()) {
      return this.speedForm.value.pumpRPM * Math.pow(this.speedForm.value.flowRate, 0.5) / Math.pow(this.speedForm.value.head, .75);
    } else {
      return 0;
    }
  }

  checkForm() {
    if (
      this.speedForm.controls.pumpType.status == 'VALID' &&
      this.speedForm.controls.flowRate.status == 'VALID' &&
      this.speedForm.controls.head.status == 'VALID' &&
      this.speedForm.controls.pumpRPM.status == 'VALID' &&
      this.speedForm.value.pumpType != 'Specified Optimal Efficiency'
    ) {
      return true;
    } else {
      return false;
    }
  }

  setUp(){

    //Remove  all previous graphs
    d3.select('app-system-curve-graph').selectAll('svg').remove();

    var curvePoints = [];

    //graph dimensions
    this.margin = {top: 20, right: 120, bottom: 110, left: 120};
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

    this.x0 = d3.scaleLinear()
      .range([0, (this.width*(1/3))])
      .domain([100, 1000]);

    this.x1 = d3.scaleLinear()
      .range([(this.width*(1/3)), (this.width*(2/3))])
      .domain([1000, 10000]);

    this.x2 = d3.scaleLinear()
      .range([(this.width*(2/3)), this.width])
      .domain([10000, 100000]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 6]);

    this.xAxis0 = d3.axisBottom()
      .scale(this.x0)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0)
      .ticks(1);

    this.xAxis1 = d3.axisBottom()
      .scale(this.x1)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0)
      .ticks(1);

    this.xAxis2 = d3.axisBottom()
      .scale(this.x2)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0)
      .ticks(1);

    this.yAxis = d3.axisLeft()
      .scale(this.y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(15)
      .ticks(6);

    this.svg  = d3.select('app-specific-speed-graph').append('svg')
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

    this.xAxis0 = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis0)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", "13px")
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", "12px");

    this.xAxis1 = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis1)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", "13px")
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", "12px");

    this.xAxis2 = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis2)
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
      .attr("transform", "translate("+ (-60) +","+(this.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Efficiency Correction (%)");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (this.width/2) +","+(this.height-(-70))+")")  // centre below axis
      .text("Specific Speed (U.S.)");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "20")
      .text("Specific Speed: ")
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "50")
      .text( "Efficiency Correction:")
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.specificSpeedText = this.svg.append("text")
      .attr("x", 200)
      .attr("y", "20")
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.efficiencyCorrectionText = this.svg.append("text")
      .attr("x", 200)
      .attr("y", "50")
      .style("font-size", "13px")
      .style("font-weight", "bold");

    // Define the div for the tooltip
    this.detailBox = d3.select("app-system-curve-graph").append("div")
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

    this.drawGuideCurve(this.svg, this.x0, this.x1,  this.y, this.psatService, 'API Double Suction');
  }

  drawGuideCurve(svg, x0, x1, y, psatService, type){

    var data = [];
    for(var  i = 100; i < 1000; i++){
      var efficiencyCorrection = psatService.achievableEfficiency(type, i);
      if(efficiencyCorrection <= 6) {
        data.push({
          x: i,
          y: efficiencyCorrection
        });
      }
    }

    var guideLine = d3.line()
      .x(function(d) { return x0(d.x); })
      .y(function(d) { return y(d.y); })
      .curve(d3.curveNatural);

    svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", guideLine)
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#fecb00");

    data = [];
    for(var  i = 1000; i < 7000; i++){
      data.push({
        x: i,
        y: psatService.achievableEfficiency(type, i)
      });
    }

    var guideLine = d3.line()
      .x(function(d) { return x1(d.x); })
      .y(function(d) { return y(d.y); })
      .curve(d3.curveNatural);

    svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", guideLine)
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
      .style("stroke", "#6277f5")
      .style("stroke-width", "3px");

  }

  onChanges(){

    var specificSpeed = this.getSpecificSpeed();
    var efficiencyCorrection = this.psatService.achievableEfficiency(this.speedForm.value.pumpType, specificSpeed);

    this.focus
      .style("display", null)
      .attr("transform", () => {
        if(specificSpeed < 1000) {
          return "translate(" + this.x0(specificSpeed) + "," + this.y(efficiencyCorrection) + ")";
        }
        else{
          return "translate(" + this.x1(specificSpeed) + "," + this.y(efficiencyCorrection) + ")";
        }
      });

    this.specificSpeedText = this.svg.append("text")
      .text(specificSpeed);

    this.efficiencyCorrectionText = this.svg.append("text")
      .text(efficiencyCorrection);

  }

}
