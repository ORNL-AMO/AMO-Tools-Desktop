import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
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
  @Input()
  settings: Settings;

  svg: any;
  xAxis: any;
  yAxis: any;
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

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;


  isFirstChange: boolean = true;
  constructor(private windowRefService: WindowRefService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.window.onresize = () => { this.resize() };
    this.resize();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange && (changes.lossCoefficient || changes.staticHead)) {
      this.onChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  resize() {
    let curveGraph = this.doc.getElementById('systemCurveGraph');
    this.height = curveGraph.clientHeight;
    this.width = curveGraph.clientWidth;
    debugger;

    //his.setUp();
  }

  setUp(winHeight: number, winWidth: number) {

    //Remove  all previous graphs
    d3.select('app-system-curve-graph').selectAll('svg').remove();

    var curvePoints = [];

    //graph dimensions
    this.margin = { top: 20, right: 120, bottom: 110, left: 120 };
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

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

    this.svg = d3.select('app-system-curve-graph').append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .style("background-color", "#fff")
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
      .text("Head (" + this.settings.distanceMeasurement + ")");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("Flow Rate (" + this.settings.flowMeasurement + ")");


    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "20")
      .text("Calculated Static Head ")
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "50")
      .text("Calculated K (loss of coefficient)")
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.staticHeadText = this.svg.append("text")
      .attr("x", 240)
      .attr("y", "20")
      .text(this.staticHead)
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.lossCoefficientText = this.svg.append("text")
      .attr("x", 240)
      .attr("y", "50")
      .text(this.lossCoefficient)
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
      .attr("points", "0,0, 0," + (detailBoxHeight - 2) + "," + detailBoxWidth + "," + (detailBoxHeight - 2) + "," + detailBoxWidth + ", 0," + ((detailBoxWidth / 2) + 12) + ",0," + (detailBoxWidth / 2) + ", -12, " + ((detailBoxWidth / 2) - 12) + ",0")
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

    this.svg.style("display", "none");
  }

  onChanges() {
    this.svg.style("display", null);

    this.staticHeadText
      .attr("x", 240)
      .attr("y", "20")
      .text(this.staticHead)
      .style("font-size", "13px")
      .style("font-weight", "bold");

    this.lossCoefficientText
      .attr("x", 240)
      .attr("y", "50")
      .text(this.lossCoefficient)
      .style("font-size", "13px")
      .style("font-weight", "bold");


    var x = d3.scaleLinear()
      .range([0, this.width]);

    var y = d3.scaleLinear()
      .range([this.height, 0]);

    if (this.pointOne.form.value.flowRate > this.pointTwo.form.value.flowRate) {
      x.domain([0, this.pointOne.form.value.flowRate]);
    }
    else {
      x.domain([0, this.pointTwo.form.value.flowRate]);
    }

    if (this.pointOne.form.value.head > this.pointTwo.form.value.head) {
      y.domain([0, (this.pointOne.form.value.head + (this.pointOne.form.value.head / 10))]);
    }
    else {
      y.domain([0, (this.pointTwo.form.value.head + (this.pointTwo.form.value.head / 10))]);
    }

    var bisectDate = d3.bisector(function (d) { return d.x; }).left;

    //Load data here
    if (x.domain()[1] < 500) {
      var data = this.findPointValues(x, y, (x.domain()[1] / 500));
    }
    else {
      var data = this.findPointValues(x, y, 1);
    }

    var format = d3.format(",.2f");

    this.svg.select('#graph')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", () => { this.focus.style("display", null); })
      .on("mouseout", () => {
        this.detailBox.on("mouseout", () => {
          this.focus.style("display", "none");
          this.detailBox.transition()
            .style("opacity", 0);
          this.pointer.transition()
            .style("opacity", 0);
        })
      })
      .on("mousemove", () => {
        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        this.focus.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");

        this.pointer.transition()
          .style("opacity", 1);

        this.detailBox.transition()
          .style("opacity", 1);

        var detailBoxWidth = 160;
        var detailBoxHeight = 80;

        this.pointer
          .attr("transform", 'translate(' + (x(d.x) - (detailBoxWidth / 2)) + ',' + (y(d.y) + 27) + ')')
          .style("fill", "#ffffff")
          .style("filter", "url(#drop-shadow)");


        this.detailBox
          .style("padding-top", "10px")
          .style("padding-right", "10px")
          .style("padding-bottom", "10px")
          .style("padding-left", "10px")
          .html("<strong style='font-size: 15px;'>" + format(d.x) + "</strong>" +
          "<p><strong><div style='float: left;'>Head, ft.</div>           <div style='float: right;'>" + format(d.y) + "</div><br>" +
          "<div style='float: left;'>Fluid Power, hp</div>     <div style='float: right;'>" + format(d.fluidPower) + "</div></strong></p>")
          .style("left", (this.margin.left + x(d.x) - (detailBoxWidth / 2 - 15)) + "px")
          .style("top", (this.margin.top + y(d.y) + 25) + "px")
          .style("position", "absolute")
          .style("width", detailBoxWidth + "px")
          .style("height", detailBoxHeight + "px")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("pointer-events", "none");
      });

    this.xAxis.remove();
    this.yAxis.remove();

    this.xAxis = d3.axisBottom()
      .scale(x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(0)
      .ticks(11)
      .tickFormat(d3.format(".2s"));

    this.yAxis = d3.axisLeft()
      .scale(y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(15)
      .ticks(11)
      .tickFormat(d3.format(".2s"));

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

    this.makeCurve(x, y, data, bisectDate, format);
  }

  findPointValues(x, y, increment) {

    //Load data here
    var data = [];

    var head = this.staticHead + this.lossCoefficient * Math.pow(x.domain()[1], this.curveConstants.form.value.systemLossExponent);

    if (head >= 0) {
      data.push({
        x: 0,
        y: this.staticHead + this.lossCoefficient * Math.pow(0, this.curveConstants.form.value.systemLossExponent),
        fluidPower: (this.staticHead * 0 * this.curveConstants.form.value.specificGravity) / 3960
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

      //if(this.lossCoefficient * Math.pow(i, this.curveConstants.form.value.systemLossExponent) > 0 && this.lossCoefficient * Math.pow(i, this.curveConstants.form.value.systemLossExponent) < y.domain()[1]) {

      var head = this.staticHead + this.lossCoefficient * Math.pow(i, this.curveConstants.form.value.systemLossExponent);

      if (head > y.domain()[1]) {
        y.domain([0, (head + (head / 9))]);
      }

      if (head >= 0) {
        data.push({
          x: i,
          y: head,
          fluidPower: (this.staticHead * i * this.curveConstants.form.value.specificGravity) / 3960
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

    head = this.staticHead + this.lossCoefficient * Math.pow(x.domain()[1], this.curveConstants.form.value.systemLossExponent);

    if (head >= 0) {
      data.push({
        x: x.domain()[1],
        y: this.staticHead + this.lossCoefficient * Math.pow(x.domain()[1], this.curveConstants.form.value.systemLossExponent),
        fluidPower: (this.staticHead * x.domain()[1] * this.curveConstants.form.value.specificGravity) / 3960
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


  makeCurve(x, y, data, bisectDate, format) {

    var line = d3.line()
      .x(function (d) { return x(d.x); })
      .y(function (d) { return y(d.y); })
      .curve(d3.curveNatural);

    this.svg.select("path")
      .data([data])
      .attr("class", "line")
      .attr("d", line)
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#6277f5");

    /*
    // define the area
    var area = d3.area()
      .x(function(d) { return x(d.x); })
      .y0(this.height)
      .y1(function(d) { return y(d.y); })
      .curve(d3.curveNatural);

    // add the area
    this.svg.select("#areaUnderCurve")
      .data([data])
      .attr("class", "area")
      .attr("d", area)
      .style("fill", "#bfbeb9")
      .on("mouseover", () =>  { this.focus.style("display", null); })
      .on("mouseout", () =>  {
        this.focus.style("display", "none");
        this.detailBox.transition()
          .style("opacity", 0);
        this.pointer.transition()
          .style("opacity", 0);
      })


      .on("mousemove", () => {
        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        this.focus.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");

        this.pointer.transition()
          .style("opacity", 1);

        this.detailBox.transition()
          .style("opacity", 1);

        var detailBoxWidth = 160;
        var detailBoxHeight = 80;

        this.pointer
          .attr("transform", 'translate(' + (x(d.x) - (detailBoxWidth/2)) + ',' + (y(d.y) + 27) + ')')
          .style("fill", "#ffffff")
          .style("filter", "url(#drop-shadow)");

        this.detailBox
          .style("padding-top", "10px")
          .style("padding-right", "10px")
          .style("padding-bottom", "10px")
          .style("padding-left", "10px")
          .html("<strong style='font-size: 15px;'>" + format(d.x) + "</strong>" +
            "<p><strong><div style='float: left;'>Head, ft.</div>           <div style='float: right;'>" + format(d.y) + "</div><br>" +
            "<div style='float: left;'>Fluid Power, hp</div>     <div style='float: right;'>" + format(d.fluidPower) + "</div></strong></p>")
          .style("left", (this.margin.left + x(d.x) - (detailBoxWidth/2 - 15)) + "px")
          .style("top", (this.margin.top + y(d.y) + 25) + "px")
          .style("position", "absolute")
          .style("width", detailBoxWidth + "px")
          .style("height", detailBoxHeight + "px")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("pointer-events", "none");
        //.style("box-shadow", "1px 1px 4px grey");

      });
     */
  }

}
