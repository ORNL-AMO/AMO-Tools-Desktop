import { Component, OnInit, Input, SimpleChange } from '@angular/core';

declare const d3: any;

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

  svg: any;
  xAxis: any;
  yAxis: any;
  width: any;
  height: any;
  staticHeadText: any;
  lossCoefficientText: any;

  line: any;


  constructor() {}

  ngOnInit() {
    this.makeSystemCurve();
  }

  makeSystemCurve(){

    //Remove  all previous graphs
    d3.select('app-system-curve-graph').selectAll('svg').remove();

    var curvePoints = [];

    //graph dimensions
    var margin = {top: 20, right: 20, bottom: 80, left: 120};
      this.width = 800 - margin.left - margin.right;
      this.height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 100]);

    var y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 100]);

    this.xAxis = d3.axisBottom()
      .scale(x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0)
      .ticks(11);

    this.yAxis = d3.axisLeft()
      .scale(y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(15)
      .ticks(11);

    this.svg  = d3.select('app-system-curve-graph').append('svg')
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .style("background-color", "#f5f3e9")
      .style("border", "1px solid black")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // filters go in defs element
    var defs = this.svg.append("defs");

// create filter with id #drop-shadow
// height=130% so that the shadow is not clipped
    var filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

// SourceAlpha refers to opacity of graphic that this filter will be applied to
// convolve that with a Gaussian with standard deviation 3 and store result
// in blur
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");

// translate output of Gaussian blur to the right and downwards with 2px
// store result in offsetBlur
    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("result", "offsetBlur");

// overlay original SourceGraphic over translated blurred opacity by using
// feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    this.svg.append('rect')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)");

    ////////////////////////////////////////////////////

    var data = [];

    var systemCurve = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

    var line = this.svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", systemCurve)
      .style("stroke-width", "1px")
      .style("fill", "none")
      .style("stroke", "steelblue");

    ////////////////////////////////////////////////////

    this.xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", "12px");

    this.yAxis = this.svg.append('g')
      .attr("class", "y axis")
      .call(this.yAxis)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("font-size", "12px");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (-60) +","+(this.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Head, ft");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (this.width/2) +","+(this.height-(-70))+")")  // centre below axis
      .text("Flow Rate, gpm");


    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "20")
      .text("Calculated Static Head ")
      .style("font-size", "12px")
      .style("font-weight", "bold");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "50")
      .text( "Calculated K (loss of coefficient)")
      .style("font-size", "12px")
      .style("font-weight", "bold");

    this.staticHeadText = this.svg.append("text")
      .attr("x", 240)
      .attr("y", "20")
      .text(this.staticHead)
      .style("font-size", "12px")
      .style("font-weight", "bold");

    this.lossCoefficientText = this.svg.append("text")
      .attr("x", 240)
      .attr("y", "50")
      .text(this.lossCoefficient)
      .style("font-size", "12px")
      .style("font-weight", "bold");

  }

  ngOnChanges(changes: SimpleChange) {
    if (!changes.isFirstChange && this.staticHead && this.lossCoefficient) {

      this.staticHeadText
        .attr("x", 240)
        .attr("y", "20")
        .text(this.staticHead)
        .style("font-size", "12px")
        .style("font-weight", "bold");

      this.lossCoefficientText
        .attr("x", 240)
        .attr("y", "50")
        .text(this.lossCoefficient)
        .style("font-size", "12px")
        .style("font-weight", "bold");


      var x = d3.scaleLinear()
        .range([0, this.width]);

      var y = d3.scaleLinear()
        .range([this.height, 0]);

      if(this.pointOne.form.value.flowRate > this.pointTwo.form.value.flowRate){
        x.domain([0, this.pointOne.form.value.flowRate]);
      }
      else{
        x.domain([0, this.pointTwo.form.value.flowRate]);
      }

      if (this.pointOne.form.value.head > this.pointTwo.form.value.head) {
        y.domain([0, (this.pointOne.form.value.head+(this.pointOne.form.value.head/10))]);
      }
      else{
        y.domain([0, (this.pointTwo.form.value.head+(this.pointTwo.form.value.head/10))]);
      }


      this.xAxis.remove();
      this.yAxis.remove();

      this.xAxis = d3.axisBottom()
        .scale(x)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(0)
        .ticks(11);

      this.yAxis = d3.axisLeft()
        .scale(y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .ticks(11);

      this.xAxis = this.svg.append('g')
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis)
        .style("stroke-width", "0")
        .selectAll('text')
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .attr("transform", "rotate(-65) translate(-15, 0)")
        .attr("dy", "12px");

      this.yAxis = this.svg.append('g')
        .attr("class", "y axis")
        .call(this.yAxis)
        .style("stroke-width", "0")
        .selectAll('text')
        .style("font-size", "12px");


      console.log("called");
      this.makeCurve(x, y);

    }
  }

  makeCurve(x , y){

    var data = [];

    console.log("width: " + x.domain()[1]);
    for(var i = 0; i < x.domain()[1]; i++){
      data.push({x:i, y:this.staticHead+this.lossCoefficient*Math.pow(i, this.curveConstants.form.value.systemLossExponent)});
      console.log("data: " + i + " " + (this.staticHead+this.lossCoefficient*Math.pow(i, this.curveConstants.form.value.systemLossExponent)));
    }


    var line = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

    this.svg.select("path")
      .data([data])
      .attr("class", "line")
      .attr("d", line)
      .style("stroke-width", 10);
  }

}
