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
  x: any;
  y: any;
  staticHeadText: any;
  lossCoefficientText: any;


  constructor() {}

  ngOnInit() {
    this.makeSystemCurve();
  }

  makeSystemCurve(){

    //Remove  all previous graphs
    d3.select('app-system-curve-graph').selectAll('svg').remove();

    var curvePoints = [];

    //graph dimensions
    var margin = {top: 20, right: 20, bottom: 80, left: 120},
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    this.x = d3.scaleLinear()
      .range([0, width]);

    this.y = d3.scaleLinear()
      .range([height, 0]);

    var xAxis = d3.axisBottom()
      .scale(this.x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0);

    var yAxis = d3.axisLeft()
      .scale(this.y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(15);

    this.x.domain([0, 100]);
    this.y.domain([0, 100]);

    this.svg  = d3.select('app-system-curve-graph').append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
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
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)");

    var xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", "12px");

    var yAxis = this.svg.append('g')
      .attr("class", "y axis")
      .call(yAxis)
      .style("stroke-width", "0")
      .selectAll('text')
      .style("font-size", "12px");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (-60) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Head, ft");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (width/2) +","+(height-(-70))+")")  // centre below axis
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

    function makeCurve(){

      /*
       var line = d3.svg.line()
       .x(function(d) { return x(d.date); })
       .y(function(d) { return y(d.close); });
       */
    }

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



      console.log(this.pointOne.form.value.head);
      if (this.pointOne.form.value.head > this.pointTwo.form.value.head) {
        this.x.domain([0, 100]);
      }
      else{
        this.x.domain([0, 100]);
      }

      if(this.pointOne.form.value.flowRate > this.pointTwo.form.value.flowRate){
        this.y.domain([0, 100]);
      }
      else{
        this.y.domain([0, 100]);
      }

    }
  }

  changeValues(){

  }

  changeGraphs(){

  }

}
