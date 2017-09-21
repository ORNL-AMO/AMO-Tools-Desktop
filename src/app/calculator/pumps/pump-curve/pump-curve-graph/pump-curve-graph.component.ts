import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { PumpCurveForm } from '../pump-curve';
//declare const d3: any;
import * as d3 from 'd3';
import * as regression from 'regression';
import * as _ from 'lodash';
import { PumpCurveService } from '../pump-curve.service';
@Component({
  selector: 'app-pump-curve-graph',
  templateUrl: './pump-curve-graph.component.html',
  styleUrls: ['./pump-curve-graph.component.css']
})
export class PumpCurveGraphComponent implements OnInit {
  //PumpCurveForm object holding data from form
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Input()
  selectedFormView: string;
  svg: any;
  xAxis: any;
  yAxis: any;
  x: any;
  y: any;
  width: any;
  height: any;
  margin: any;
  line: any;
  filter: any;
  detailBox: any;
  pointer: any;
  calcPoint: any;
  focus: any;
  focusMod: any;
  isGridToggled: boolean;

  firstChange: boolean = true;

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;

  @Input()
  toggleCalculate: boolean;
  // flow: number = 0;
  // efficiencyCorrection: number = 0;
  tmpHeadFlow: any;
  constructor(private psatService: PsatService, private windowRefService: WindowRefService, private pumpCurveService: PumpCurveService) { }

  ngOnInit() {
    this.isGridToggled = false;
    d3.select('app-pump-curve-graph').selectAll('#gridToggleBtn')
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
    if (!this.firstChange) {
      //pump-curve.component toggles the toggleCalculate value when calculating
      //check for changes to toggleCalculate
      if (changes.toggleCalculate) {
        //if changes draw new graph
        if (this.checkForm()) {
          this.makeGraph();
          this.svg.style("display", null);
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  resizeGraph() {
    let curveGraph = this.doc.getElementById('pumpCurveGraph');
    this.canvasWidth = curveGraph.clientWidth;
    this.canvasHeight = this.canvasWidth * (3 / 5);
    if (this.canvasWidth < 400) {
      this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      this.margin = { top: 20, right: 20, bottom: 75, left: 120 };
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;

    d3.select("app-pump-curve").select("#gridToggle").style("top", (this.height + 100) + "px");
    if (this.checkForm()) {
      this.makeGraph();
    }
  }

  checkForm() {
    if (this.pumpCurveForm.maxFlow > 0) {
      return true;
    } else { return false }
  }


  calculateY(formData: PumpCurveForm, flow: number) {
    let result = 0;
    result = formData.headConstant + formData.headFlow * flow + formData.headFlow2 * Math.pow(flow, 2) + formData.headFlow3 * Math.pow(flow, 3) + formData.headFlow4 * Math.pow(flow, 4) + formData.headFlow5 * Math.pow(flow, 5) + formData.headFlow6 * Math.pow(flow, 6);
    return result;
  }

  getData(): Array<any> {
    let data = new Array<any>();
    if (this.selectedFormView == 'Data') {
      let maxDataFlow = _.maxBy(this.pumpCurveForm.dataRows, (val) => { return val.flow });
      let tmpArr = new Array<any>();
      this.pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.dataOrder, precision: 10 });
      this.pumpCurveService.regEquation.next(results.string);
      for (let i = 10; i <= maxDataFlow.flow; i = i + 10) {
        let yVal = results.predict(i);
        if (yVal[1] > 0) {
          data.push({
            x: i,
            y: yVal[1]
          })
        }
      }
    } else if (this.selectedFormView == 'Equation') {
      this.pumpCurveService.regEquation.next(null);
      for (let i = 10; i <= this.pumpCurveForm.maxFlow; i = i + 10) {
        let yVal = this.calculateY(this.pumpCurveForm, i);
        if (yVal > 0) {
          data.push({
            x: i,
            y: yVal
          })
        }
      }
    }
    return data;
  }

  getModifiedData(baseline: number, modified: number): Array<any> {
    let data = new Array<any>();
    let ratio = baseline / modified;
    if (this.selectedFormView == 'Data') {
      let maxDataFlow = _.maxBy(this.pumpCurveForm.dataRows, (val) => { return val.flow });
      let tmpArr = new Array<any>();
      this.pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.dataOrder, precision: 10 });
      for (let i = 10; i <= maxDataFlow.flow; i = i + 10) {
        let yVal = results.predict(i);
        if (yVal[1] > 0) {
          data.push({
            x: i * ratio,
            y: yVal[1] * Math.pow(ratio, 2)
          })
        }
      }
    } else if (this.selectedFormView == 'Equation') {
      for (let i = 10; i <= this.pumpCurveForm.maxFlow; i = i + 10) {
        let yVal = this.calculateY(this.pumpCurveForm, i);
        if (yVal > 0) {
          data.push({
            x: i * ratio,
            y: yVal * Math.pow(ratio, 2)
          })
        }
      }
    }
    return data;
  }


  makeGraph() {
    // Data for graph
    let data = new Array<any>();
    data = this.getData();

    let modifiedData = new Array<any>();
    let maxX = _.maxBy(data, (val) => { return val.x });
    let maxY = _.maxBy(data, (val) => { return val.y });
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      modifiedData = this.getModifiedData(this.pumpCurveForm.baselineMeasurement, this.pumpCurveForm.modifiedMeasurement);
      let modMaxX = _.maxBy(modifiedData, (val) => { return val.x });
      let modMaxY = _.maxBy(modifiedData, (val) => { return val.y });
      if (maxX.x < modMaxX.x) {
        maxX = modMaxX;
      }
      if (maxY.y < modMaxY.y) {
        maxY = modMaxY;
      }
    }

    //Remove  all previous graphs
    d3.select('app-pump-curve-graph').selectAll('svg').remove();

    this.svg = d3.select('app-pump-curve-graph').append('svg')
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

    this.svg.append('rect')
      .attr("id", "graph")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("fill", "#F8F9F9")
      .style("filter", "url(#drop-shadow)");

    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, maxX.x + 200]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, maxY.y + 100]);

    if (this.isGridToggled) {
      this.xAxis = d3.axisBottom()
        .scale(this.x)
        .ticks(3)
        .tickFormat(d3.format("d"))
        .tickSize(-this.height);

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .ticks(6)
        .tickSize(-this.width);
    }
    else {
      this.xAxis = d3.axisBottom()
        .scale(this.x)
        .ticks(3)
        .tickFormat(d3.format("d"))
        .tickSize(0);

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .ticks(6)
        .tickSize(0);
    }

    this.xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis)
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", "13px")
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", "12px");

    this.yAxis = this.svg.append('g')
      .attr("class", "y axis")
      .call(this.yAxis)
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("font-size", "13px");

    this.makeBaselineCurve(data);
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      this.makeModifiedCurve(modifiedData);
    }
    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (-60) + "," + (this.height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Head (ft)");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("Flow (gpm)");

    this.calcPoint = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.calcPoint.append("circle")
      .attr("r", 6)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    // Define the div for the tooltip
    this.detailBox = d3.select("app-pump-curve-graph").append("div")
      .attr("id", "detailBox")
      .attr("class", "d3-tip")
      .style("opacity", 0)
      .style('pointer-events', 'none');
    let detailBoxWidth = 160;
    let detailBoxHeight = 90;

    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      detailBoxWidth = 160;
      detailBoxHeight = 160;

    }
    this.pointer = this.svg.append("polygon")
      .attr("id", "pointer")
      //.attr("points", "0,13, 14,13, 7,-2");
      .attr("points", "0,0, 0," + (detailBoxHeight - 2) + "," + detailBoxWidth + "," + (detailBoxHeight - 2) + "," + detailBoxWidth + ", 0," + ((detailBoxWidth / 2) + 12) + ",0," + (detailBoxWidth / 2) + ", -12, " + ((detailBoxWidth / 2) - 12) + ",0")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focus = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focus.append("circle")
      .attr("r", 8)
      .style("fill", "none")
      .style("stroke", "#2ECC71")
      .style("stroke-width", "3px");

    this.focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");
    if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
      this.focusMod = this.svg.append("g")
        .attr("class", "focus")
        .style("display", "none")
        .style('pointer-events', 'none');

      this.focusMod.append("circle")
        .attr("r", 8)
        .style("fill", "none")
        .style("stroke", "#3498DB")
        .style("stroke-width", "3px");

      this.focusMod.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");
    }
    var format = d3.format(",.2f");
    var bisectDate = d3.bisector(function (d) { return d.x; }).left;

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
        if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
          this.focusMod
            .style("display", null)
            .style("opacity", 1)
            .style('pointer-events', 'none');
        }
        this.pointer
          .style("display", null)
          .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

      })
      .on("mousemove", () => {

        this.focus
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');
        if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
          this.focusMod
            .style("display", null)
            .style("opacity", 1)
            .style('pointer-events', 'none');
        }
        this.pointer
          .style("display", null)
          .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

        let x0 = this.x.invert(d3.mouse(d3.event.currentTarget)[0]);
        let i = bisectDate(data, x0, 1);
        if (i >= data.length) {
          i = data.length - 1
        }
        let d0 = data[i - 1];
        let d1 = data[i];
        let d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        let xVal = this.x(d.x);


        if (isNaN(xVal) == false) {
          if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
            i = bisectDate(modifiedData, x0, 1);
            let modD0 = modifiedData[i - 1];
            let modD1 = modifiedData[i];
            if (modD0 && modD1) {
              let modD = x0 - modD0.x > modD1.x - x0 ? modD1 : modD0;
              xVal = this.x(modD.x);
              if (isNaN(xVal) == false) {
                let minBaseline = _.minBy(data, (val) => { return val.y });
                let minMod = _.minBy(modifiedData, (val) => { return val.y });
                this.focus.attr("transform", "translate(" + this.x(d.x) + "," + this.y(d.y) + ")");
                this.focusMod.attr("transform", "translate(" + this.x(d.x) + "," + this.y(modD.y) + ")");

                if (minMod.y < minBaseline.y) {
                  this.pointer
                    .attr("transform", 'translate(' + (this.x(d.x) - (detailBoxWidth / 2)) + ',' + (this.y(modD.y) + 27) + ')')
                    .style("fill", "#ffffff")
                    .style("filter", "url(#drop-shadow)");

                  this.detailBox
                    .style("padding-right", "10px")
                    .style("padding-left", "10px")
                    .html(
                    "<p><strong><div>Baseline Flow: </div></strong><div>" + format(d.x) + " " + " gpm</div>" +

                    "<strong><div>Basleline Head: </div></strong><div>" + format(d.y) + " ft</div></p>" +
                    "<p><strong><div>Modified Flow: </div></strong><div>" + format(d.x) + " " + " gpm</div>" +

                    "<strong><div>Modified Head: </div></strong><div>" + format(modD.y) + " ft</div></p>")

                    // "<div style='float:left;'>Fluid Power: </div><div style='float: right;'>" + format(d.fluidPower) + " </div></strong></p>")

                    .style("left", (this.margin.left + this.x(d.x) - (detailBoxWidth / 2 - 17)) + "px")
                    .style("top", (this.margin.top + this.y(modD.y) + 83) + "px")
                    .style("position", "absolute")
                    .style("width", detailBoxWidth + "px")
                    .style("height", detailBoxHeight + "px")
                    .style("padding-left", "10px")
                    .style("padding-right", "10px")
                    .style("font", "12px sans-serif")
                    .style("background", "#ffffff")
                    .style("border", "0px")
                    .style("pointer-events", "none");
                }
              } else {
                this.pointer
                  .attr("transform", 'translate(' + (this.x(d.x) - (detailBoxWidth / 2)) + ',' + (this.y(d.y) + 27) + ')')
                  .style("fill", "#ffffff")
                  .style("filter", "url(#drop-shadow)");

                this.detailBox
                  .style("padding-right", "10px")
                  .style("padding-left", "10px")
                  .html(
                  "<p><strong><div>Baseline Flow: </div></strong><div>" + format(d.x) + " " + " gpm</div>" +

                  "<strong><div>Basleline Head: </div></strong><div>" + format(d.y) + " ft</div></p>" +
                  "<p><strong><div>Modified Flow: </div></strong><div>" + format(d.x) + " " + " gpm</div>" +

                  "<strong><div>Modified Head: </div></strong><div>" + format(modD.y) + " ft</div></p>")

                  // "<div style='float:left;'>Fluid Power: </div><div style='float: right;'>" + format(d.fluidPower) + " </div></strong></p>")

                  .style("left", (this.margin.left + this.x(d.x) - (detailBoxWidth / 2 - 17)) + "px")
                  .style("top", (this.margin.top + this.y(d.y) + 83) + "px")
                  .style("position", "absolute")
                  .style("width", detailBoxWidth + "px")
                  .style("height", detailBoxHeight + "px")
                  .style("padding-left", "10px")
                  .style("padding-right", "10px")
                  .style("font", "12px sans-serif")
                  .style("background", "#ffffff")
                  .style("border", "0px")
                  .style("pointer-events", "none");
              }

              this.pointer.transition()
                .style("opacity", 1);

              this.detailBox.transition()
                .style("opacity", 1);
            }
          }
          else {
            this.focus.attr("transform", "translate(" + this.x(d.x) + "," + this.y(d.y) + ")");

            this.pointer.transition()
              .style("opacity", 1);

            this.detailBox.transition()
              .style("opacity", 1);

            this.pointer
              .attr("transform", 'translate(' + (this.x(d.x) - (detailBoxWidth / 2)) + ',' + (this.y(d.y) + 27) + ')')
              .style("fill", "#ffffff")
              .style("filter", "url(#drop-shadow)");


            this.detailBox
              .style("padding-right", "10px")
              .style("padding-left", "10px")
              .html(
              "<p><strong><div>Flow: </div></strong><div>" + format(d.x) + " " + " gpm</div>" +

              "<strong><div>Head: </div></strong><div>" + format(d.y) + " ft</div></p>")

              // "<div style='float:left;'>Fluid Power: </div><div style='float: right;'>" + format(d.fluidPower) + " </div></strong></p>")

              .style("left", (this.margin.left + this.x(d.x) - (detailBoxWidth / 2 - 17)) + "px")
              .style("top", (this.margin.top + this.y(d.y) + 83) + "px")
              .style("position", "absolute")
              .style("width", detailBoxWidth + "px")
              .style("height", detailBoxHeight + "px")
              .style("padding-left", "10px")
              .style("padding-right", "10px")
              .style("font", "12px sans-serif")
              .style("background", "#ffffff")
              .style("border", "0px")
              .style("pointer-events", "none");
          }
        }
      })
      .on("mouseout", () => {
        this.pointer
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

        this.detailBox
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

        this.focus
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);
        if (this.pumpCurveForm.baselineMeasurement != this.pumpCurveForm.modifiedMeasurement) {
          this.focusMod
            .transition()
            .delay(100)
            .duration(600)
            .style("opacity", 0);
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

  makeBaselineCurve(data) {
    var guideLine = d3.line()
      .x((d) => { return this.x(d.x); })
      .y((d) => { return this.y(d.y); })
      .curve(d3.curveNatural);

    let line = this.svg.append("path")
      .attr("class", "line")
      .attr("id", "avgLine")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#2ECC71")
      .style('pointer-events', 'none');

    line.data([data]).attr("d", guideLine);
  }
  makeModifiedCurve(data) {
    var guideLine = d3.line()
      .x((d) => { return this.x(d.x); })
      .y((d) => { return this.y(d.y); })
      .curve(d3.curveNatural);

    let line = this.svg.append("path")
      .attr("class", "line")
      .attr("id", "avgLine")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#3498DB")
      .style('pointer-events', 'none');

    line.data([data]).attr("d", guideLine);
  }
}
