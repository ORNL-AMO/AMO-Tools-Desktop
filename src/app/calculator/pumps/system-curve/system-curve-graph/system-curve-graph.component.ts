import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import * as d3 from 'd3';
import { PsatService } from '../../../../psat/psat.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';

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

  @ViewChild("ngChart") ngChart: ElementRef;
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

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;
  fontSize: string;

  isFirstChange: boolean = true;
  constructor(private windowRefService: WindowRefService, private convertUnitsService: ConvertUnitsService, private psatService: PsatService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
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

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.window.onresize = () => { this.resizeGraph() };
    this.resizeGraph();
  }

  ngOnDestroy() {
    this.window.onresize = null;
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange && (changes.lossCoefficient || changes.staticHead)) {
      this.makeGraph();
    } else {
      this.isFirstChange = false;
    }
  }

  resizeGraph() {
    let curveGraph = this.doc.getElementById('systemCurveGraph');

    this.canvasWidth = curveGraph.clientWidth;
    this.canvasHeight = this.canvasWidth * (3 / 5);

    if (this.canvasWidth < 400) {
      this.fontSize = '8px';

      //debug
      this.margin = { top: 10, right: 35, bottom: 50, left: 50 };

      //real version
      // this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      this.fontSize = '12px';

      //debug
      this.margin = { top: 20, right: 45, bottom: 75, left: 95 };

      //real version
      // this.margin = { top: 20, right: 20, bottom: 75, left: 120 };
    }
    //real version
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;
    //debug
    // this.width = this.canvasWidth - this.margin.left - this.margin.right;
    // this.height = this.canvasHeight - this.margin.top - this.margin.bottom + (parseInt(this.fontSize.replace('px', '')) * 2 + 5);

    d3.select("app-system-curve").select("#gridToggle").style("top", (this.height + 100) + "px");

    this.makeGraph();
  }

  makeGraph() {

    //Remove  all previous graphs
    d3.select(this.ngChart.nativeElement).selectAll('svg').remove();

    this.svg = d3.select(this.ngChart.nativeElement).append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      //debug
      // .attr("width", this.width + this.margin.left + this.margin.right)
      // .attr("height", this.height + this.margin.top + this.margin.bottom + (parseInt(this.fontSize.replace('px', '')) * 2 + 5))
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

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (-60) + "," + (this.height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Head (" + this.settings.distanceMeasurement + ")");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("Flow Rate (" + this.settings.flowMeasurement + ")");



    //debug - trying something
    // console.log("fontSize number = " + (this.fontSize[0] + this.fontSize[1]));
    // this.svg.append("text")
    //   .attr("text-anchor", "left")
    //   .attr("transform", "translate(20, " + "-" + (parseInt(this.fontSize.replace('px', '')) * 2) + ")")
    //   .attr("font-size", this.fontSize)
    //   .attr("font-weight", "bold")
    //   .text("testing title");

    // this.svg.append("text")
    //   .attr("text-anchor", "left")
    //   .attr("transform", "translate(20, " + "-" + (this.fontSize.replace('px', '')) + ")")
    //   .attr("font-size", this.fontSize)
    //   .attr("font-weight", "bold")
    //   .text("test title 2");


    var x = d3.scaleLinear()
      .range([0, this.width]);

    var y = d3.scaleLinear()
      .range([this.height, 0]);

    if (this.pointOne.form.controls.flowRate.value > this.pointTwo.form.controls.flowRate.value) {
      if (this.pointOne.form.controls.flowRate.value > 50 && this.pointOne.form.controls.flowRate.value < 25000) {
        x.domain([0, this.pointOne.form.controls.flowRate.value]);
      } else if (this.pointOne.form.controls.flowRate.value > 50 && this.pointOne.form.controls.flowRate.value > 25000) {
        x.domain([0, 25000]);
      } else {
        x.domain([0, 50]);
      }
    }
    else {
      if (this.pointTwo.form.controls.flowRate.value > 50 && this.pointTwo.form.controls.flowRate.value < 25000) {
        x.domain([0, this.pointTwo.form.controls.flowRate.value]);
      } else if (this.pointTwo.form.controls.flowRate.value > 50 && this.pointTwo.form.controls.flowRate.value > 25000) {
        x.domain([0, 25000]);
      } else {
        x.domain([0, 50]);
      }
    }

    if (this.pointOne.form.controls.head.value > this.pointTwo.form.controls.head.value) {
      let domainVal = this.pointOne.form.controls.head.value + (this.pointOne.form.controls.head.value / 10)
      if (domainVal > 50 && domainVal < 25000) {
        y.domain([0, domainVal]);
      } else if (domainVal > 50 && domainVal > 25000) {
        y.domain([0, 25000]);
      } else {
        y.domain([0, 50]);
      }
    }
    else {
      let domainVal = this.pointTwo.form.controls.head.value + (this.pointTwo.form.controls.head.value / 10)
      if (domainVal > 50 && domainVal < 25000) {
        y.domain([0, domainVal]);
      } else if (domainVal > 50 && domainVal > 25000) {
        y.domain([0, 25000]);
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

    //debug
    this.tooltipPointer = d3.select(this.ngChart.nativeElement).append("div")
      .attr("id", "tooltipPointer")
      .attr("class", "tooltip-pointer")
      .style("opacity", 1)
      .style('pointer-events', 'none');

    const detailBoxWidth = 160;
    const detailBoxHeight = 80;

    // this.pointer = this.svg.append("polygon")
    //   .attr("id", "pointer")
    //   .attr("points", "0,0, 0," + (detailBoxHeight - 2) + "," + detailBoxWidth + "," + (detailBoxHeight - 2) + "," + detailBoxWidth + ", 0," + ((detailBoxWidth / 2) + 12) + ",0," + (detailBoxWidth / 2) + ", -12, " + ((detailBoxWidth / 2) - 12) + ",0")
    //   .style("opacity", 0)
    //   .style('pointer-events', 'none');

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
        // this.pointer
        //   .style("display", null)
        //   .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

        //debug
        this.tooltipPointer
          .style("display", null)
          .style('pointer-events', 'none');

      })
      .on("mousemove", () => {

        this.focus
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        // this.pointer
        //   .style("display", null)
        //   .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

        //debug
        this.tooltipPointer
          .style("display", null)
          .style('pointer-events', 'none');

        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        this.focus.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");

        // this.pointer.transition()
        //   .style("opacity", 1);

        this.detailBox.transition()
          .style("opacity", 1);

        //debug
        this.tooltipPointer.transition()
          .style("opacity", 1);

        var detailBoxWidth = 160;
        var detailBoxHeight = 80;
        var tooltipPointerWidth = detailBoxWidth * 0.05;
        var tooltipPointerHeight = detailBoxHeight * 0.05;

        // this.pointer
        //   .attr("transform", 'translate(' + (x(d.x) - (detailBoxWidth / 2)) + ',' + (y(d.y) + 27) + ')')
        //   .style("fill", "#ffffff")
        //   .style("filter", "url(#drop-shadow)");

        //debug
        this.detailBox
          .style("padding-top", "10px")
          .style("padding-right", "10px")
          .style("padding-bottom", "10px")
          .style("padding-left", "10px")
          .html(
          "<p><strong><div style='float:left; position: relative; top: -10px;'>Flow Rate: </div><div style='float:right; position: relative; top: -10px;'>" + format(d.x) + " " + this.settings.flowMeasurement + "</div><br>" +

          "<div style='float:left; position: relative; top: -10px;'>Head: </div><div style='float: right; position: relative; top: -10px;'>" + format(d.y) + " " + this.settings.distanceMeasurement + "</div><br>" +

          "<div style='float:left; position: relative; top: -10px;'>Fluid Power: </div><div style='float: right; position: relative; top: -10px;'>" + format(d.fluidPower) + " " + this.settings.powerMeasurement + "</div></strong></p>")

          .style("left", Math.min(((this.margin.left + x(d.x) - (detailBoxWidth / 2 - 17)) - 2), this.canvasWidth - detailBoxWidth) + "px")
          .style("top", (this.margin.top + y(d.y) + 26) + "px")
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
          .style("left", (this.margin.left + x(d.x)) + 5 + "px")
          .style("top", (this.margin.top + y(d.y) + 16) + "px")
          .style("position", "absolute")
          .style("width", "0px")
          .style("height", "0px")
          .style("border-left", "10px solid transparent")
          .style("border-right", "10px solid transparent")
          .style("border-bottom", "10px solid white")
          .style('pointer-events', 'none');

        //real version
        // this.detailBox
        //   .style("padding-top", "10px")
        //   .style("padding-right", "10px")
        //   .style("padding-bottom", "10px")
        //   .style("padding-left", "10px")
        //   .html(
        //   "<p><strong><div style='float:left; position: relative; top: -10px;'>Flow Rate: </div><div style='float:right; position: relative; top: -10px;'>" + format(d.x) + " " + this.settings.flowMeasurement + "</div><br>" +

        //   "<div style='float:left; position: relative; top: -10px;'>Head: </div><div style='float: right; position: relative; top: -10px;'>" + format(d.y) + " " + this.settings.distanceMeasurement + "</div><br>" +

        //   "<div style='float:left; position: relative; top: -10px;'>Fluid Power: </div><div style='float: right; position: relative; top: -10px;'>" + format(d.fluidPower) + " " + this.settings.powerMeasurement + "</div></strong></p>")

        //   .style("left", (this.margin.left + x(d.x) - (detailBoxWidth / 2 - 17)) - 2 + "px")
        //   .style("top", (this.margin.top + y(d.y) + 26) + "px")
        //   .style("position", "absolute")
        //   .style("width", detailBoxWidth + "px")
        //   .style("height", detailBoxHeight + "px")
        //   .style("padding", "10px")
        //   .style("font", "12px sans-serif")
        //   .style("background", "#ffffff")
        //   .style("border", "0px")
        //   .style("pointer-events", "none");
      })
      .on("mouseout", () => {
        // this.pointer
        //   .transition()
        //   .delay(100)
        //   .duration(600)
        //   .style("opacity", 0);

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

    this.svg.append("text")
      .attr("id", "staticHeadText")
      .attr("x", 20)
      .attr("y", "20")
      // debug
      // .attr("x", 20)
      // .attr("y", "20")
      .text("Calculated Static Head: " + this.staticHead + ' ' + this.settings.distanceMeasurement)
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

  findPointValues(x, y, increment) {

    //Load data here
    var data = [];

    var head = this.staticHead + this.lossCoefficient * Math.pow(x.domain()[1], this.curveConstants.form.controls.systemLossExponent.value);

    if (head >= 0) {
      let tmpFluidPower = (this.staticHead * 0 * this.curveConstants.form.controls.specificGravity.value) / 3960;
      if (this.settings.powerMeasurement != 'hp' && tmpFluidPower != 0) {
        tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(this.settings.powerMeasurement);
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
        let tmpFluidPower = (this.staticHead * i * this.curveConstants.form.controls.specificGravity.value) / 3960;
        if (this.settings.powerMeasurement != 'hp' && tmpFluidPower != 0) {
          tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(this.settings.powerMeasurement);
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
      let tmpFluidPower = (this.staticHead * x.domain()[1] * this.curveConstants.form.controls.specificGravity.value) / 3960
      if (this.settings.powerMeasurement != 'hp' && tmpFluidPower != 0) {
        tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(this.settings.powerMeasurement);
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
      .style("stroke", "#2ECC71")
      .style('pointer-events', 'none');

    d3.select("path.domain").attr("d", "");
  }

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "system-curve-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }

}
