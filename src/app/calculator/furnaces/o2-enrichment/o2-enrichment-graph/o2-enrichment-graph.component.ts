import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PhastService } from '../../../../phast/phast.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { O2Enrichment, O2EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
import * as d3 from 'd3';
import { createElement } from "@angular/core/src/view/element";

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
  @Input()
  lines: any;

  o2EnrichmentPoint: O2Enrichment;

  svg: any;
  xAxis: any;
  yAxis: any;
  x: any;
  y: any;
  width: any;
  height: any;
  margin: any;
  filter: any;
  point: any;
  detailBox: any;
  isGridToggled: boolean;

  plotBtn: any;
  change: any;
  mainLine: any;
  selectedLine: number;
  guideLine: any;
  xPosition: any = null;

  maxFuelSavings: any;
  removeLines: any = true;
  isFirstChange: any = true;
  fontSize: string;

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;

  @Input()
  toggleCalculate: boolean;
  constructor(private phastService: PhastService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    // this.lines = [];
    this.isGridToggled = false;

    this.plotBtn = d3.select('app-o2-enrichment-form').selectAll(".btn-success")
      .on("click", () => {
        this.plotLine();
      });

    d3.select('app-o2-enrichment').selectAll('#gridToggleBtn')
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
    if (!this.isFirstChange && changes) {
      this.onChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  resizeGraph() {
    const curveGraph = this.doc.getElementById('o2EnrichmentGraph');

    this.canvasWidth = curveGraph.clientWidth;
    this.canvasHeight = this.canvasWidth * (3 / 5);

    if (this.canvasWidth < 400) {
      this.fontSize = '8px';
      this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      this.fontSize = '12px';
      this.margin = { top: 20, right: 20, bottom: 75, left: 120 };
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;

    d3.select("app-o2-enrichment").select("#gridToggle").style("top", (this.height + 100) + "px");

    this.makeGraph();
    this.onChanges();
  }

  drawMainLine(putOnGraph = true) {
    this.mainLine = {
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption,
      // color: '#2ECC71',
      color: '#000000',
      fuelSavings: 0,
      data: [],
      x: null,
      y: null
    };
    this.drawCurve(this.svg, this.x, this.y, this.mainLine, true, putOnGraph);
  }

  makeGraph() {
    // Remove  all previous graphs
    d3.select('app-o2-enrichment-graph').selectAll('svg').remove();

    this.svg = d3.select('app-o2-enrichment-graph').append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // filters go in defs element
    const defs = this.svg.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    this.filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%")
      .style("position", "relative")
      .style("z-index", "1");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    this.filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur")
      .style("position", "relative")
      .style("z-index", "1");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    this.filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("result", "offsetBlur")
      .style("position", "relative")
      .style("z-index", "1");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    const feMerge = this.filter.append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    this.svg.append('rect')
      .attr("id", "graph")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("fill", "#F8F9F9")
      .style("filter", "url(#drop-shadow)")
      .style("position", "relative")
      .style("z-index", "1");

    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, 100]);

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, Math.floor((this.maxFuelSavings + 10.0) / 10) * 10 ]);

    if (this.isGridToggled) {
      this.xAxis = d3.axisBottom()
        .scale(this.x)
        .ticks(4)
        .tickSize(-this.height)
        .tickFormat(d3.format("d"));

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .tickSize(-this.width)
        .ticks(4);
    }
    else {
      this.xAxis = d3.axisBottom()
        .scale(this.x)
        .ticks(4)
        .tickSize(0)
        .tickFormat(d3.format("d"));

      this.yAxis = d3.axisLeft()
        .scale(this.y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(15)
        .tickSize(0)
        .ticks(4);
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
      .attr("transform", "translate(" + (-60) + "," + (this.height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Fuel Savings (%)");

    this.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + (this.width / 2) + "," + (this.height - (-70)) + ")")  // centre below axis
      .text("O2 in Air (%)");

    this.svg.style("display", null);

    this.detailBox = d3.select('app-o2-enrichment-graph').append('div')
      .attr('id', 'detailBox')
      .attr('class', 'd3-tip')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    this.change = true;
  }

  drawCurve(svg, x, y, information, isFromForm, putOnGraph = true) {
    let onGraph = false;
    let data = [];

    this.o2EnrichmentPoint = {
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: 0,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: information.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: information.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: information.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption
    };

    for (let i = 0; i <= 100; i += .5) {
      this.o2EnrichmentPoint.o2CombAirEnriched = i;
      const fuelSavings = this.phastService.o2Enrichment(this.o2EnrichmentPoint).fuelSavingsEnriched;

      if (fuelSavings > 0 && fuelSavings < 100) {
        if (fuelSavings > information.fuelSavings) {
          information.fuelSavings = fuelSavings;
        }
        if (!data.length) {
          data.push({
            x: i - .001,
            y: 0
          });
        }

        onGraph = true;
        data.push({
          x: i,
          y: fuelSavings
        });
      }
    }

    if (!putOnGraph) {
      return;
    }

    // reload the graph and return if no points are on the graph
    // edit: ensure no recursive infinite loop occurs
    if (!onGraph) {
      this.removeLines = false;
      return;
    }

    const guideLine = d3.line()
      .x(function (d) {
        return x(d.x);
      })
      .y(function (d) {
        return y(d.y);
      })
      .curve(d3.curveNatural);

    if (isFromForm) {
      svg.append("path")
        .attr("id", "formLine")
        .data([data])
        .attr("class", "line")
        .attr("d", guideLine)
        .style("stroke-width", 10)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .style("stroke", information.color)
        .style('pointer-events', 'none');
    }
    else {
      svg.append("path")
        .data([data])
        .attr("class", "line plottedLine")
        .attr("d", guideLine)
        .style("stroke-width", 10)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .style("stroke", information.color)
        .style('pointer-events', 'none');
    }

    information.data = data;
    information.x = x;
    information.y = y;

    this.hoverCommands(x, y, data);

    if (this.guideLine != null) {
      this.guideLine.remove();
    }

    this.guideLine = this.svg.append("line")
      .attr("id", "guideLine")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.height)
      .style("stroke", "red")
      .style('pointer-events', 'none')
      .style("display", "none");

    this.drawPoint(x, y, information, isFromForm);

    this.svg.style("display", null);
  }

  hoverCommands(x, y, data) {

    const format = d3.format(",.2f");
    const bisectDate = d3.bisector(function (d) { return d.x; }).left;
    this.svg.select('#graph')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", () => {
        this.guideLine.style("display", null);
      })
      .on("mousemove", () => {
        this.xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);
        this.updateDetailBoxes();
        this.moveGuideLine();

      })
      .on("mouseout", () => {
        this.guideLine.style("display", "none");
        this.clearDetails();
      });
  }

  drawPoint(x, y, information, isFromForm) {

    if (isFromForm) {
      this.svg.selectAll("#formPoint").remove();
      this.point = this.svg.append("g")
        .attr("id", "formPoint")
        .attr("class", "focus")
        .style("display", "none")
        .style('pointer-events', 'none');
    }
    else {
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

    const fuelSavings = this.phastService.o2Enrichment(information).fuelSavingsEnriched;

    this.point
      .style("display", null)
      .style("opacity", 1)
      .style('pointer-events', 'none')
      .attr("transform", "translate(" + x(information.o2CombAirEnriched) + "," + y(fuelSavings) + ")");
  }

  onChanges() {
    this.change = true;
    this.maxFuelSavings = 0.0;
    this.drawMainLine(false);
    if (this.mainLine.fuelSavings > this.maxFuelSavings) {
      this.maxFuelSavings = this.mainLine.fuelSavings;
    }
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].fuelSavings > this.maxFuelSavings) {
        this.maxFuelSavings = this.lines[i].fuelSavings;
      }
    }
    this.makeGraph();
    this.redrawLines();
    this.updateDetailBoxes();
  }

  redrawLines() {
    this.svg.selectAll("#formLine").remove();
    this.drawMainLine();
    if (!this.removeLines) {
      this.removeLines = true;
      return;
    }

    this.plotBtn.classed("disabled", false);

    this.svg.selectAll(".plottedLine").remove();
    this.svg.selectAll(".plottedPoint").remove();

    // Update and draw lines
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].o2CombAir = this.o2Enrichment.o2CombAir;
      this.lines[i].flueGasTemp = this.o2Enrichment.flueGasTemp;
      this.lines[i].o2FlueGas = this.o2Enrichment.o2FlueGas;
      this.lines[i].combAirTemp = this.o2Enrichment.combAirTemp;
      this.lines[i].fuelConsumption = this.o2Enrichment.fuelConsumption;

      this.drawCurve(this.svg, this.x, this.y, this.lines[i], false);
    }

    // Set mainLine as default after every change
    this.hoverCommands(this.mainLine.x, this.mainLine.y, this.mainLine.data);
  }

  plotLine() {
    if (this.change) {
      let line = {
        o2CombAir: this.o2Enrichment.o2CombAir,
        o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
        flueGasTemp: this.o2Enrichment.flueGasTemp,
        flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
        o2FlueGas: this.o2Enrichment.o2FlueGas,
        o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
        combAirTemp: this.o2Enrichment.combAirTemp,
        combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
        fuelConsumption: this.o2Enrichment.fuelConsumption,
        fuelSavings: 0,
        color: this.getRandomColor(),
        data: [],
        x: null,
        y: null
      };

      this.drawCurve(this.svg, this.x, this.y, line, false);

      this.lines.push(line);

      this.plotBtn.classed("disabled", true);
      this.change = false;

      this.updateDetailBoxes();
    }
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  updateDetailBoxes() {
    d3.select('app-o2-enrichment').selectAll("#lineDetails").selectAll("tr").remove();

    const lineDetail = d3.select('app-o2-enrichment').selectAll("#lineDetails").append("tr");

    // Always display mainLine details to detail box
    lineDetail.append("td")
      .attr("class", "text-center")
      .style("background-color", this.mainLine.color);

    lineDetail.append("td")
      .attr("class", "text-center")
      .html(() => {
        if (this.xPosition != null) {
          const format = d3.format(",.2f");
          return "<p style='margin: 0px; font-size: 1vw'>" + format(this.xPosition) + "%</p>";
        }
        else {
          return "<i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
            " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
            " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>";
        }
      });

    lineDetail.append("td")
      .attr("class", "text-center fuelSavings")
      .html(() => {
        if (this.xPosition) {
          const format = d3.format(",.2f");
          const o2EnrichmentPoint = {
            o2CombAir: this.o2Enrichment.o2CombAir,
            o2CombAirEnriched: this.xPosition,
            flueGasTemp: this.o2Enrichment.flueGasTemp,
            flueGasTempEnriched: this.mainLine.flueGasTempEnriched,
            o2FlueGas: this.o2Enrichment.o2FlueGas,
            o2FlueGasEnriched: this.mainLine.o2FlueGasEnriched,
            combAirTemp: this.o2Enrichment.combAirTemp,
            combAirTempEnriched: this.mainLine.combAirTempEnriched,
            fuelConsumption: this.o2Enrichment.fuelConsumption
          };

          const fuelSavings = this.phastService.o2Enrichment(o2EnrichmentPoint).fuelSavingsEnriched;

          if (fuelSavings < 0 || fuelSavings > 100 || this.xPosition == null) {
            return "<i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
              " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
              " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>";
          }
          else {
            return "<p style='margin: 0px; font-size: 1vw'>" + format(fuelSavings) + "%</p>";
          }
        }
      });


    if (this.lines != null) {
      this.lines.forEach((d, i) => {

        const lineDetail2 = d3.select('app-o2-enrichment').selectAll('#lineDetails').append('tr')
          .on('mouseover', () => {
            this.detailBox
              .style('display', null)
              .style('pointer-events', 'none');

            this.detailBox.transition()
              .style('opacity', 1);

            const detailBoxWidth = 250;
            const detailBoxHeight = 100;
            const format = d3.format(',.2f');
            this.detailBox
              .style('padding-right', '5px')
              .style('padding-left', '5px')
              .html(
                '<p><strong><div>Combustion Air Preheat Temperature: </strong>' + format(d.combAirTempEnriched) + ' F</div>' +
                '<strong><div>O2 in Enriched Flue Gasses: </strong>' + format(d.o2FlueGasEnriched) + ' F</div>' +
                '<strong><div>Flue Gas Temperature: </strong>' + format(d.flueGasTempEnriched) + ' ' + ' F</div></p>'
              )

              // TODO actually position this correctly
              .style('left', (this.margin.left + this.x(-50)) + 'px')
              .style('top', (this.margin.top + this.y(-25)) + 'px')
              .style('position', 'absolute')
              .style('width', detailBoxWidth + 'px')
              .style('height', detailBoxHeight + 'px')
              .style('padding-left', '5px')
              .style('padding-right', '5px')
              .style('font', '10px sans-serif')
              // .style('background', '#ffffff')
              .style('border', '1px')
              .style('pointer-events', 'none');

            this.detailBox
              .style('display', null)
              .style('pointer-events', 'none');
          })
          .on('mouseout', () => {
            this.detailBox
              .transition()
              .delay(100)
              .duration(600)
              .style('opacity', 0);
          });

        lineDetail2.append('td')
          .attr('class', 'text-center')
          .style('background-color', d.color);

        lineDetail2.append('td')
          .attr('class', 'text-center')
          .html(() => {
            if (this.xPosition != null) {
              const format = d3.format(',.2f');
              return "<p style='margin: 0px; font-size: 1vw'>" + format(this.xPosition) + '%</p>';
            }
            else {
              return "<i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
                " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
                " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>";
            }
          });

        lineDetail2.append('td')
          .attr('class', 'text-center fuelSavings')
          .html(() => {
            const format = d3.format(',.2f');
            const o2EnrichmentPoint = {
              o2CombAir: this.o2Enrichment.o2CombAir,
              o2CombAirEnriched: this.xPosition,
              flueGasTemp: this.o2Enrichment.flueGasTemp,
              flueGasTempEnriched: d.flueGasTempEnriched,
              o2FlueGas: this.o2Enrichment.o2FlueGas,
              o2FlueGasEnriched: d.o2FlueGasEnriched,
              combAirTemp: this.o2Enrichment.combAirTemp,
              combAirTempEnriched: d.combAirTempEnriched,
              fuelConsumption: this.o2Enrichment.fuelConsumption
            };

            const fuelSavings = this.phastService.o2Enrichment(o2EnrichmentPoint).fuelSavingsEnriched;

            if (fuelSavings < 0 || fuelSavings > 100 || this.xPosition == null) {
              return "<i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
                " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
                " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>";
            }
            else {
              return "<p style='margin: 0px; font-size: 1vw'>" + format(fuelSavings) + "%</p>";
            }
          });

        const deleteBtn = lineDetail2.append("td")
          .style("padding", "0px")
          .style("vertical-align", "middle")
          .append("div")
          .style("padding", "0px")
          .attr("class", "text-center")
          .append("button")
          .attr("class", "btn deleteBtn")
          .attr("type", "button")
          .style("padding", "0px")
          .style("width", "40px")
          .style("height", "40px")
          .style("background-color", "#cc0200")
          .on("click", () => {
            this.detailBox
              .transition()
              .delay(100)
              .duration(600)
              .style('opacity', 0);
            this.selectedLine = i;
            this.deleteLine();
          })
          .append("span")
          .attr("class", "fa fa-minus deleteMinus");

        deleteBtn.select("before")
          .style("height", "40px")
          .style("font-size", "18")
          .style("vertical-align", "middle")
          .style("background-color", "#cc0200");

      });
    }
  }

  clearDetails() {
    d3.selectAll(".fuelSavings")
      .html("<i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
      " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>" +
      " <i class='fa fa-minus' style='margin: 0px; font-size: 1vw; vertical-align: middle: height: 100%;'></i>");
  }

  moveGuideLine() {
    this.guideLine
      .attr("transform", 'translate(' + this.x(this.xPosition) + ', 0)');

  }

  deleteLine() {
    if (this.lines != null) {
      if (this.selectedLine != -1) {
        this.lines.splice(this.selectedLine, 1);
        this.onChanges();
        this.change = true;
      }
    }
  }

  toggleGrid() {
    if (this.isGridToggled) {
      this.isGridToggled = false;
      this.makeGraph();
      this.redrawLines();
    }
    else {
      this.isGridToggled = true;
      this.makeGraph();
      this.redrawLines();
    }
  }

}
