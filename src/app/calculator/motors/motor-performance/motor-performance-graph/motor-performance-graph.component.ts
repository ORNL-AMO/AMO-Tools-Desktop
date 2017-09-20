import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
//eclare const d3: any;
import * as d3 from 'd3';
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
  @Input()
  settings: Settings;

  svg: any;
  xAxis: any;
  yAxis: any;
  x: any;
  xShow: any;
  y: any;
  width: any;
  height: any;
  currentLine: any;
  powerLine: any;
  efficiencyLine: any;
  margin: any;
  line: any;
  filter: any;
  detailBox: any;
  pointer: any;
  focus: any;
  focusCurrent: any;
  focusPowerFactor: any;
  focusEfficiency: any;
  powerFactorData: any;
  efficiencyData: any;
  currentData: any;
  isGridToggled: boolean;

  motorPerformanceResults: any = {
    efficiency: 0,
    motor_current: 0,
    motor_power_factor: 0
  };
  firstChange: boolean = true;

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;

  constructor(private windowRefService: WindowRefService, private psatService: PsatService) { }

  ngOnInit() {

    this.isGridToggled = false;

    d3.select('app-motor-performance').selectAll('#gridToggleBtn')
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
    let motorGraph = this.doc.getElementById('motorPerformanceGraph');
    this.canvasWidth = motorGraph.clientWidth;
    this.canvasHeight = this.canvasWidth * (3 / 5);
    if (this.canvasWidth < 400) {
      this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      this.margin = { top: 20, right: 20, bottom: 75, left: 120 };
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;

    d3.select("app-motor-performance").select("#gridToggle").style("top", (this.height + 100) + "px");

    this.makeGraph();
  }

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
        loadFactor,

        this.settings
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
        loadFactor,
        this.settings
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
        loadFactor,
        this.settings
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
      if (this.performanceForm.value.efficiencyClass != '' || this.performanceForm.value.efficiencyClass != undefined) {
        if (
          this.performanceForm.controls.efficiency.status == 'VALID'
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

  makeGraph() {

    //Remove  all previous graphs
    d3.select('app-motor-performance-graph').selectAll('svg').remove();

    this.svg = d3.select('app-motor-performance-graph').append('svg')
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
      .domain([0, 1.21]);

    this.xShow = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 120]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 120]);

    if(this.isGridToggled) {
      this.xAxis = d3.axisBottom()
        .scale(this.xShow)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(0)
        .tickSize(-this.height)
        .ticks(13);

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .tickSize(-this.width)
        .ticks(13);
    }
    else{
      this.xAxis = d3.axisBottom()
        .scale(this.xShow)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(0)
        .tickSize(0)
        .ticks(13);

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .tickSize(0)
        .ticks(13);
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

    this.svg.append("path")
      .attr("id", "areaUnderCurve");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("Motor Shaft Load (%)");

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
      .attr("points", "0,0, 0," + (detailBoxHeight - 2) + "," + detailBoxWidth + "," + (detailBoxHeight - 2) + "," + detailBoxWidth + ", 0," + ((detailBoxWidth / 2) + 12) + ",0," + (detailBoxWidth / 2) + ", -12, " + ((detailBoxWidth / 2) - 12) + ",0")
      .style("opacity", 0);

    ///////////////////////////////////////////////
    this.currentLine = this.svg.append("path")
      .attr("class", "line")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#2ECC71")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.powerLine = this.svg.append("path")
      .attr("class", "line")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#3498DB")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.efficiencyLine = this.svg.append("path")
      .attr("class", "line")
      .style("stroke-width", 10)
      .style("stroke-width", "2px")
      .style("fill", "none")
      .style("stroke", "#A569BD")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focusCurrent = this.svg.append("g")
      .attr('id', 'focusCurrent')
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focusCurrent.append("circle")
      .attr("r", 6)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.focusCurrent.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    this.focusPowerFactor = this.svg.append("g")
      .attr('id', 'focusPowerFactor')
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focusPowerFactor.append("circle")
      .attr("r", 6)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.focusPowerFactor.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    this.focusEfficiency = this.svg.append("g")
      .attr('id', 'focusEfficiency')
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');

    this.focusEfficiency.append("circle")
      .attr("r", 6)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.focusEfficiency.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");


    this.currentData = this.getCurrentData();
    this.powerFactorData = this.getPowerFactorData();
    this.efficiencyData = this.getEfficiencyData();
    this.drawCurrentLine(this.x, this.y, this.currentData);
    this.drawPowerFactorLine(this.x, this.y, this.powerFactorData);
    this.drawEfficiencyLine(this.x, this.y, this.efficiencyData);
    this.initFocusCircles(this.powerFactorData, this.efficiencyData, this.currentData, this.x, this.y);

    d3.selectAll("line").style("pointer-events", "none");

  }


  getCurrentData() {
    var data = [];
    let i = .001;
    for (i; i <= 1.2; i = i + 0.01) {
      let current = this.calculateCurrent(i);
      if (current >= 0 && current <= this.height) {
        data.push({
          x: i,
          y: this.psatService.roundVal(current, 3)
        })
      }
    }
    return data;
  }

  getEfficiencyData() {
    var data = [];
    for (var i = .001; i <= 1.2; i = i + .01) {
      let efficiency = this.calculateEfficiency(i)
      if (efficiency >= 0 && efficiency <= 120) {
        data.push({
          x: i,
          y: this.psatService.roundVal(efficiency, 3)
        })
      }
    }
    return data;
  }

  getPowerFactorData() {
    var data = [];
    for (var i = .001; i <= 1.2; i = i + .01) {
      let powerFactor = this.calculatePowerFactor(i);
      if (powerFactor >= 0 && powerFactor <= 120) {
        data.push({
          x: i,
          y: this.psatService.roundVal(powerFactor, 3)
        })
      }
    }
    return data;
  }

  drawCurrentLine(x, y, data) {
    var currentLi = d3.line()
      .x(function (d) { return x(d.x); })
      .y(function (d) { return y(d.y); })
      .curve(d3.curveNatural);

    this.currentLine
      .data([data])
      .attr("d", currentLi)
      .style("display", null);
  }

  drawPowerFactorLine(x, y, data) {
    var powerFactorLine = d3.line()
      .x(function (d) { return x(d.x); })
      .y(function (d) { return y(d.y); })
      .curve(d3.curveNatural);

    this.powerLine
      .data([data])
      .attr("d", powerFactorLine)
      .style("display", null);
  }

  drawEfficiencyLine(x, y, data) {
    var efficiencyLi = d3.line()
      .x(function (d) { return x(d.x); })
      .y(function (d) { return y(d.y); })
      .curve(d3.curveNatural);

    this.efficiencyLine
      .data([data])
      .attr("d", efficiencyLi)
      .style("display", null);
  }

  initFocusCircles(powerFactorData, efficiencyData, currentData, x, y) {
    var format = d3.format(",.2f");
    var bisectDate = d3.bisector(function (d) { return d.x; }).left;
    this.svg.select('#graph')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", () => {

        this.focusCurrent
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');

        this.focusEfficiency
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');

        this.focusPowerFactor
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');

      })
      .on("mousemove", () => {

        this.focusCurrent
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');

        this.focusEfficiency
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');

        this.focusPowerFactor
          .style("display", null)
          .style("opacity", 1)
          .style('pointer-events', 'none');

        //current
        let currentX0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
        let currentI = bisectDate(currentData, currentX0, 1);
        if (currentI >= currentData.length) {
          currentI = currentData.length - 1
        }
        let currentD0 = currentData[currentI - 1];
        let currentD1 = currentData[currentI];
        let currentD = currentX0 - currentD0.x > currentD1.x - currentX0 ? currentD1 : currentD0;
        this.focusCurrent.attr("transform", "translate(" + x(currentD.x) + "," + y(currentD.y) + ")");

        this.svg.select("#currentText").remove();
        this.svg.append("text")
          .attr("id", "currentText")
          .attr("x", 20)
          .attr("y", "20")
          .text("Current: " + currentD.y + " % FLC")
          .style("font-size", "13px")
          .style("font-weight", "bold")
          .style("fill", "#2ECC71");

        //power factor
        if (powerFactorData.length != 0) {
          let powerX0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
          let powerI = bisectDate(powerFactorData, powerX0, 1);
          if (powerI >= powerFactorData.length) {
            powerI = powerFactorData.length - 1
          }
          let powerD0 = powerFactorData[powerI - 1];
          let powerD1 = powerFactorData[powerI];
          let powerD = powerX0 - powerD0.x > powerD1.x - powerX0 ? powerD1 : powerD0;
          this.focusPowerFactor.attr("transform", "translate(" + x(powerD.x) + "," + y(powerD.y) + ")");

          this.svg.select("#powerFactorText").remove();
          this.svg.append("text")
            .attr("id", "powerFactorText")
            .attr("x", 180)
            .attr("y", "20")
            .text("Power Factor: " + powerD.y + " %")
            .style("font-size", "13px")
            .style("font-weight", "bold")
            .style("fill", "#3498DB");
        } else {
          this.svg.select("#powerFactorText").remove();
          this.svg.select("#focusPowerFactor").remove();
        }

        //efficiency
        let efficiencyX0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
        let efficiencyI = bisectDate(efficiencyData, efficiencyX0, 1);
        if (efficiencyI >= efficiencyData.length) {
          efficiencyI = efficiencyData.length - 1
        }
        let efficiencyD0 = efficiencyData[efficiencyI - 1];
        let efficiencyD1 = efficiencyData[efficiencyI];
        let efficiencyD = efficiencyX0 - efficiencyD0.x > efficiencyD1.x - efficiencyX0 ? efficiencyD1 : efficiencyD0;
        this.focusEfficiency.attr("transform", "translate(" + x(efficiencyD.x) + "," + y(efficiencyD.y) + ")");

        this.svg.select("#efficiencyText").remove();
        this.svg.select("#i").remove();
        this.svg.append("text")
          .attr("id", "efficiencyText")
          .attr("x", 350)
          .attr("y", "20")
          .text("Efficiency: " + efficiencyD.y + " %")
          .style("font-size", "13px")
          .style("font-weight", "bold")
          .style("fill", "#A569BD");

        var percentFormat = d3.format(",.0%");

        this.svg.append("text")
          .attr("id", "i")
          .attr("x", 20)
          .attr("y", "50")
          .text("Motor Shaft Load: " + percentFormat(efficiencyD.x))
          .style("font-size", "13px")
          .style("font-weight", "bold")
          .style("fill", "#000000");
      })
      .on("mouseout", () => {

        this.focusCurrent
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

        this.focusEfficiency
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

        this.focusPowerFactor
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity", 0);

      });
  }

  toggleGrid(){
    if(this.isGridToggled){
      this.isGridToggled = false;
      this.makeGraph();
    }
    else{
      this.isGridToggled = true;
      this.makeGraph();
    }
  }

}
