import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PhastService } from '../../../../phast/phast.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { O2Enrichment, O2EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
import * as d3 from 'd3';

@Component({
  selector: 'app-o2-enrichment-graph',
  templateUrl: './o2-enrichment-graph.component.html',
  styleUrls: ['./o2-enrichment-graph.component.css']
})
export class O2EnrichmentGraphComponent implements OnInit {
  //results
  @Input()
  o2EnrichmentOutput: O2EnrichmentOutput;
  //input data
  @Input()
  o2Enrichment: O2Enrichment;

  o2EnrichmentPoint: O2Enrichment;

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
  point: any;

  plotBtn: any;
  change: any;
  lines: any;

  isFirstChange: boolean = true;
  fontSize: string;

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;

  @Input()
  toggleCalculate: boolean;
  // specificSpeed: number = 0;
  // efficiencyCorrection: number = 0;
  constructor(private PhastService: PhastService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.setUp();
    // if (this.checkForm()) {
    //   this.setUp();
    //   this.drawPoint();
    //   this.svg.style("display", null);
    // }
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
  }


  ngOnDestroy() {
    this.window.onresize = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange && changes) {
      this.onChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  getEfficiencyCorrection() {
    if (this.checkForm()) {
      //return this.psatService.achievableEfficiency(this.speedForm.value.pumpType, this.getSpecificSpeed());
    } else {
      return 0;
    }
  }

  getSpecificSpeed(): number {
    if (this.checkForm()) {
      //return this.speedForm.value.pumpRPM * Math.pow(this.speedForm.value.flowRate, 0.5) / Math.pow(this.speedForm.value.head, .75);
    } else {
      return 0;
    }
  }

  checkForm() {
   /* if (
      //this.speedForm.controls.pumpType.status == 'VALID' &&
      //this.speedForm.controls.flowRate.status == 'VALID' &&
      //this.speedForm.controls.head.status == 'VALID' &&
      //this.speedForm.controls.pumpRPM.status == 'VALID' &&
      //this.speedForm.value.pumpType != 'Specified Optimal Efficiency'
    ) {
      return true;
    } else {
      return false;
    }
    */
   return true;
  }

  setUp() {
    this.initGraph();
    //We can draw the guideCurve now since pump type has no effect on what kind of shape it has.
    var lines = {
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption,
      color: "#2ECC71"};
    this.drawCurve(this.svg, this.x, this.y, lines, true);
  }

  initGraph(){
    //Remove  all previous graphs
    d3.select('app-o2-enrichment-graph').selectAll('svg').remove();

    //graph dimensions
    this.margin = { top: 20, right: 120, bottom: 110, left: 120 };
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 100]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 100]);

    this.xAxis = d3.axisBottom()
      .scale(this.x)
      .ticks(4)
      .tickFormat(d3.format("d"));

    this.yAxis = d3.axisLeft()
      .scale(this.y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(15)
      .ticks(4);

    this.svg = d3.select('app-o2-enrichment-graph').append('svg')
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
      .text("Fuel Savings (%)");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("O2 in Air (%)");

    //We can draw the guideCurve now since pump type has no effect on what kind of shape it has.
    //this.drawGuideCurve(this.svg, this.x, this.y, this.psatService, this.speedForm.value.pumpType);

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
    this.detailBox = d3.select("app-o2-enrichment-graph").append("div")
      .attr("id", "detailBox")
      .attr("class", "d3-tip")
      .style("opacity", 0)
      .style('pointer-events', 'none');

    const detailBoxWidth = 160;
    const detailBoxHeight = 90;

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
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    this.svg.style("display", null);

    this.plotBtn = d3.select('app-o2-enrichment-form').selectAll(".btn-success")
      .on("click", ()=>{
        this.plotLine();
      });

    this.change = true;
    this.lines = [];
  }

  drawCurve(svg, x, y, information, isFromForm) {

    var onGraph = false;

    var data = [];

    var first = false;

    for (var i = 0; i <= 100; i += .5) {

      this.o2EnrichmentPoint = {
        o2CombAir: this.o2Enrichment.o2CombAir,
        o2CombAirEnriched: i,
        flueGasTemp: this.o2Enrichment.flueGasTemp,
        flueGasTempEnriched: information.flueGasTempEnriched,
        o2FlueGas: this.o2Enrichment.o2FlueGas,
        o2FlueGasEnriched: information.o2FlueGasEnriched,
        combAirTemp: this.o2Enrichment.combAirTemp,
        combAirTempEnriched: information.combAirTempEnriched,
        fuelConsumption: this.o2Enrichment.fuelConsumption
      };
      var fuelSavings = this.PhastService.o2Enrichment(this.o2EnrichmentPoint).fuelSavingsEnriched;

      if (fuelSavings > 0 && fuelSavings < 100) {

        if(!first){
          data.push({
            x: i-.001,
            y: 0
          });
          first = true;
        }

        onGraph = true;
        data.push({
          x: i,
          y: fuelSavings
        });
      }
    }

    //reload the graph and return if no points are on the graph
    if(!onGraph){
      this.detailBox = null;
      this.pointer = null;
      this.focus = null;
      this.initGraph();
      return;
    }

    var guideLine = d3.line()
      .x(function (d) {
        return x(d.x);
      })
      .y(function (d) {
        return y(d.y);
      })
      .curve(d3.curveNatural);

    if(isFromForm) {
      svg.append("path")
        .attr("id", "formLine")
        .data([data])
        .attr("class", "line")
        .attr("d", guideLine)
        .style("stroke-width", 10)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .style("stroke", information.color)
        .style('pointer-events', 'none')
        .on("click", ()=>{
          console.log("here");
          this.hoverCommands(x, y, data);
        });
    }
    else{
      svg.append("path")
        .data([data])
        .attr("class", "line plottedLine")
        .attr("d", guideLine)
        .style("stroke-width", 10)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .style("stroke", information.color)
        .style('pointer-events', 'none')
        .on("click", ()=>{
          console.log("here");
          this.hoverCommands(x, y, data);
        });
    }

    this.hoverCommands(x, y, data);

    this.drawPoint(x, y, information, isFromForm);

    this.svg.style("display", null);
  }

  hoverCommands(x, y, data){

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
          .style("opacity",1)
          .style('pointer-events', 'none');
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
        this.pointer
          .style("display", null)
          .style('pointer-events', 'none');
        this.detailBox
          .style("display", null)
          .style('pointer-events', 'none');

        let x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
        let i = bisectDate(data, x0, 1);
        if (i >= data.length) {
          i = data.length - 1
        }
        let d0 = data[i - 1];
        let d1 = data[i];
        let d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        this.focus.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");

        this.pointer.transition()
          .style("opacity", 1);

        this.detailBox.transition()
          .style("opacity", 1);

        var detailBoxWidth = 160;
        var detailBoxHeight = 90;

        this.pointer
          .attr("transform", 'translate(' + (x(d.x) - (detailBoxWidth / 2)) + ',' + (y(d.y) + 27) + ')')
          .style("fill", "#ffffff")
          .style("filter", "url(#drop-shadow)");

        this.detailBox
          .style("padding-right", "10px")
          .style("padding-left", "10px")
          .html(
            "<p><strong><div>O<sub>2</sub> in Air: </div></strong><div>" + format(d.x) + " %</div>" +
            "<strong><div>Fuel Savings: </div></strong><div>" + format(d.y) + " %</div></p>")

          .style("left", (this.margin.left + x(d.x) - (detailBoxWidth / 2 - 15)) + "px")
          .style("top", (this.margin.top + y(d.y) + 25) + "px")
          .style("position", "absolute")
          .style("width", detailBoxWidth + "px")
          .style("height", detailBoxHeight + "px")
          .style("padding-left", "10px")
          .style("padding-right", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("pointer-events", "none");
      })
      .on("mouseout", () => {
        this.pointer
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity",0);

        this.detailBox
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity",0);

        this.focus
          .transition()
          .delay(100)
          .duration(600)
          .style("opacity",0);
      });
  }

  drawPoint(x, y, information, isFromForm) {

    if(isFromForm) {
      this.svg.selectAll("#formPoint").remove();
      this.point = this.svg.append("g")
        .attr("id", "formPoint")
        .attr("class", "focus")
        .style("display", "none")
        .style('pointer-events', 'none');
    }
    else{
      this.point = this.svg.append("g")
        .attr("class", "focus plottedPoint")
        .style("display", "none")
        .style('pointer-events', 'none');
    }

    this.point.append("circle")
      .attr("r", 7)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.point.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    var fuelSavings = this.PhastService.o2Enrichment(this.o2EnrichmentPoint).fuelSavingsEnriched;

    this.point
      .style("display", null)
      .style("opacity",1)
      .style('pointer-events', 'none')
      .attr("transform", "translate(" + x(information.o2CombAirEnriched) + "," + y(fuelSavings) + ")");
  }

  onChanges() {

    var line = {
        o2CombAir: this.o2Enrichment.o2CombAir,
        o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
        flueGasTemp: this.o2Enrichment.flueGasTemp,
        flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
        o2FlueGas: this.o2Enrichment.o2FlueGas,
        o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
        combAirTemp: this.o2Enrichment.combAirTemp,
        combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
        fuelConsumption: this.o2Enrichment.fuelConsumption,
        color: "#2ECC71"};

    this.svg.selectAll("#formLine").remove();
    this.drawCurve(this.svg, this.x, this.y, line, true);

    this.plotBtn.classed("disabled", false);
    this.change = true;

    this.svg.selectAll(".plottedLine").remove();
    this.svg.selectAll(".plottedPoint").remove();

    console.log(this.lines.length);
    for(var i = 0; i < this.lines.length; i++){
      this.drawCurve(this.svg, this.x, this.y, this.lines[i], false);
    }

  }


  plotLine(){
    if(this.change) {
      var color = this.getRandomColor();

      var line = {
        o2CombAir: this.o2Enrichment.o2CombAir,
        o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
        flueGasTemp: this.o2Enrichment.flueGasTemp,
        flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
        o2FlueGas: this.o2Enrichment.o2FlueGas,
        o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
        combAirTemp: this.o2Enrichment.combAirTemp,
        combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
        fuelConsumption: this.o2Enrichment.fuelConsumption,
        color: color};

      this.drawCurve(this.svg, this.x, this.y, line, false);

      this.lines.push(line);

      this.plotBtn.classed("disabled", true);
      this.change = false;
    }
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  }
