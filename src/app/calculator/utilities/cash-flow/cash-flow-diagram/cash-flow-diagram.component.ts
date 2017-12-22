import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { CashFlowResults } from '../cash-flow';
import { CashFlowForm } from '../cash-flow';
import * as d3 from 'd3';
import { CashFlowService } from '../cash-flow.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
// import * as _ from 'lodash';


@Component({
  selector: 'app-cash-flow-diagram',
  templateUrl: './cash-flow-diagram.component.html',
  styleUrls: ['./cash-flow-diagram.component.css']
})
export class CashFlowDiagramComponent implements OnInit {
  @Input()
  cashFlowResults: CashFlowResults;

  @Input()
  cashFlowForm: CashFlowForm;

  svg: any;
  xAxis: any;
  yAxis: any;
  x: any;
  y: any;
  width: any;
  height: any;
  margin: any;

  //tooltip container
  legend: any;
  detailBox: any;
  axisTitle: any;

  energySavingsColor: string = "#5fa469";
  energySavingsHover: string = "#248232";
  salvageSavingsColor: string = "#90bfcf";
  salvageSavingsHover: string = "#348aa7";
  fuelCostColor: string = "#ff7353";
  fuelCostHover: string = "#ba4a31";
  operationCostColor: string = "#fed02f";
  operationCostHover: string = "#b99101";
  installationCostColor: string = "#FF3842";
  installationCostHover: string = "#A30810";
  junkCostColor: string = "#FF5D17";
  junkCostHover: string = "#BA4411";

  firstChange: boolean = true;

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;

  graphData: Array<any>;


  constructor(private cashFlowService: CashFlowService, private windowRefService: WindowRefService) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleCalculate) {
        this.makeGraph();
        this.svg.style("display", null);
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

    this.cashFlowService.calculate.subscribe(val => {
      this.makeGraph();
    });
  }


  resizeGraph() {
    let curveGraph = this.doc.getElementById('pumpCurveGraph');

    if (curveGraph) {
      this.canvasWidth = curveGraph.clientWidth;
      this.canvasHeight = this.canvasWidth * (7 / 10);


      if (this.canvasWidth < 400) {
        this.margin = { top: 10, right: 35, bottom: 50, left: 50 };
      } else {
        this.margin = { top: 20, right: 45, bottom: 75, left: 60 };
      }
      this.width = this.canvasWidth - this.margin.left - this.margin.right;
      this.height = this.canvasHeight - this.margin.top - this.margin.bottom;
      this.makeGraph();
    }
  }


  compileGraphData() {
    this.graphData = new Array<any>();

    for (var i: number = 1; i <= this.cashFlowForm.lifeYears; i++) {

      if (i === 0) {
        this.graphData.push({
          year: i,
          annualSavings: this.cashFlowForm.energySavings,
          salvageSavings: 0,
          operationCost: this.cashFlowForm.operationCost,
          fuelCost: this.cashFlowForm.fuelCost,
          junkCost: 0,
          installationCost: this.cashFlowForm.installationCost
        });
        continue;
      }
      if (i === (this.cashFlowForm.lifeYears)) {
        this.graphData.push({
          year: i,
          annualSavings: this.cashFlowForm.energySavings,
          salvageSavings: this.cashFlowForm.salvageInput,
          operationCost: this.cashFlowForm.operationCost,
          fuelCost: this.cashFlowForm.fuelCost,
          junkCost: this.cashFlowForm.junkCost,
          installationCost: this.cashFlowForm.installationCost
        });
        continue;
      }

      this.graphData.push({
        year: i,
        annualSavings: this.cashFlowForm.energySavings,
        salvageSavings: 0,
        operationCost: this.cashFlowForm.operationCost,
        fuelCost: this.cashFlowForm.fuelCost,
        junkCost: 0,
        installationCost: this.cashFlowForm.installationCost
      });
    }
  }


  makeGraph() {
    d3.select('app-cash-flow-diagram').selectAll('svg').remove();
    d3.select("#legend").remove();
    d3.select("#detailBox").remove();

    this.compileGraphData();

    this.svg = d3.select('#cashFlowDiagram').append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append('rect')
      .attr("id", "graph")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height)
      .style("fill", "#F8F9F9")
      .style("filter", "url(#drop-shadow)");

    this.x = d3.scaleLinear()
      .domain([1, this.cashFlowForm.lifeYears + 1])
      .range([0, this.width]);

    if (this.cashFlowForm.installationCost > this.cashFlowForm.salvageInput) {
      this.y = d3.scaleLinear()
        .domain([-this.cashFlowForm.installationCost, this.cashFlowForm.installationCost])
        .range([this.height, 0]);
    }
    var graphBounds: number = Math.max(
      this.cashFlowForm.installationCost + this.cashFlowForm.fuelCost + this.cashFlowForm.operationCost,
      this.cashFlowForm.junkCost + this.cashFlowForm.fuelCost + this.cashFlowForm.operationCost,
      this.cashFlowForm.salvageInput + this.cashFlowForm.energySavings
    );

    this.y = d3.scaleLinear()
      .domain([-graphBounds, graphBounds])
      .range([this.height, 0]);


    this.xAxis = d3.axisBottom()
      .scale(this.x)
      .ticks(this.cashFlowForm.lifeYears)
      .tickSize(0);

    this.yAxis = d3.axisLeft()
      .scale(this.y)
      .tickFormat(d3.format("$,"));


    //create legend element
    this.legend = d3.select("#graphInfo").append("div")
      .attr("id", "legend")
      .attr("class", "col-md-6")
      .style("font-size", "16px")
      .style("text-align", "left")
      .html(
      "<div class='row'>" +
      "<div class='col-md-1' id='legend-energy-savings'>" +

      "</div>" +
      "<div class='col-md-10'>" +
      "Energy Savings" +
      "</div>" +
      "</div>" +
      "<div class='row'>" +
      "<div class='col-md-1' id='legend-salvage-savings'>" +

      "</div>" +
      "<div class='col-md-10'>" +
      "Salvage Savings" +
      "</div>" +
      "</div>" +
      "<div class='row'>" +
      "<div class='col-md-1' id='legend-operation-cost'>" +

      "</div>" +
      "<div class='col-md-10'>" +
      "Operation Cost" +
      "</div>" +
      "</div>" +
      "<div class='row'>" +
      "<div class='col-md-1' id='legend-fuel-cost'>" +

      "</div>" +
      "<div class='col-md-10'>" +
      "Fuel Cost" +
      "</div>" +
      "</div>" +
      "<div class='row'>" +
      "<div class='col-md-1' id='legend-installation-cost'>" +

      "</div>" +
      "<div class='col-md-10'>" +
      "Installation Cost" +
      "</div>" +
      "</div>" +
      "<div class='row'>" +
      "<div class='col-md-1' id='legend-junk-cost'>" +

      "</div>" +
      "<div class='col-md-10'>" +
      "Disposal Cost" +
      "</div>" +
      "</div>"
      );

    var legendSquare: number = 16;
    var legendSquareMargin: number = 5;

    d3.select("#legend-energy-savings").append("div")
      .style("width", legendSquare + "px")
      .style("height", legendSquare + "px")
      .style("margin-left", legendSquareMargin + "px")
      .style("display", "inline-block")
      .style("vertical-align", "middle")
      .style("background", "#5fa469");
    d3.select("#legend-salvage-savings").append("div")
      .style("width", legendSquare + "px")
      .style("height", legendSquare + "px")
      .style("margin-left", legendSquareMargin + "px")
      .style("display", "inline-block")
      .style("vertical-align", "middle")
      .style("background", "#90bfcf");
    d3.select("#legend-operation-cost").append("div")
      .style("width", legendSquare + "px")
      .style("height", legendSquare + "px")
      .style("margin-left", legendSquareMargin + "px")
      .style("display", "inline-block")
      .style("vertical-align", "middle")
      .style("background", "#fed02f");
    d3.select("#legend-fuel-cost").append("div")
      .style("width", legendSquare + "px")
      .style("height", legendSquare + "px")
      .style("margin-left", legendSquareMargin + "px")
      .style("display", "inline-block")
      .style("vertical-align", "middle")
      .style("background", "#ff7353");
    d3.select("#legend-installation-cost").append("div")
      .style("width", legendSquare + "px")
      .style("height", legendSquare + "px")
      .style("margin-left", legendSquareMargin + "px")
      .style("display", "inline-block")
      .style("vertical-align", "middle")
      .style("background", "#FF3842");
    d3.select("#legend-junk-cost").append("div")
      .style("width", legendSquare + "px")
      .style("height", legendSquare + "px")
      .style("margin-left", legendSquareMargin + "px")
      .style("display", "inline-block")
      .style("vertical-align", "middle")
      .style("background", "#C6A2D6");


    this.svg.select('#graph')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
      .style("left", this.margin.left)
      .style("margin-left", this.margin.left)
      .style("filter", "url(#drop-shadow)");


    //annual energy savings bars
    this.svg.selectAll("bar")
      .data(this.graphData)
      .enter().append("rect")
      .style("fill", "#5fa469")
      .attr("transform", "translate(0,0)")
      .attr("class", "cash-flow positive-bar")
      .attr("id", (d, i) => {
        return "savings-bar-" + i;
      })
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      .attr("y", (d, i) => {
        if (i === this.graphData.length - 1) {
        }
        return this.y(this.graphData[i].annualSavings);
      })
      .attr("height", (d, i) => {
        return (this.height / 2) - this.y(this.graphData[i].annualSavings);
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#248232");

        var yearlySavings: number = parseInt(d.annualSavings) - (parseInt(d.fuelCost) + parseInt(d.operationCost));
        var currentNetSavings: number = ((parseInt(d.annualSavings) * parseInt(d.year)) + parseInt(d.salvageSavings)) - (((parseInt(d.fuelCost) + parseInt(d.operationCost)) * parseInt(d.year)) + parseInt(d.installationCost) + parseInt(d.junkCost));

        this.detailBox = d3.select("#graphInfo").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip col-6")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + d.year + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Net Yearly Savings: </strong></div>" +
          "<div class='col-md-4 yearlySavings'>$" + yearlySavings.toFixed(2) + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Cumulative Savings: </strong></div>" +
          "<div class='col-md-4 currentNetSavings'>$" + currentNetSavings.toFixed(2) + " " + "</div>" +
          "</div>"
          )
          .style("position", "absolute")
          .style("left", "50%")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "16px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        if (yearlySavings == 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (yearlySavings < 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (yearlySavings > 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        if (currentNetSavings == 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings < 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings > 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#5fa469");
        d3.select('app-cash-flow-diagram').selectAll('.d3-tip')
          .transition()
          .style('opacity', 0)
          .remove();
      });

    //salvage savings bar
    this.svg.selectAll("bar")
      .data(this.graphData)
      .enter().append("rect")
      .style("fill", "#90bfcf")
      .attr("transform", "translate(0, " + ((this.height / 2) - this.y(0 - this.cashFlowForm.energySavings)) + ")")
      .attr("class", "cash-flow positive-bar")
      .attr("id", (d, i) => {
        return "savings-bar-" + i;
      })
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      .attr("y", (d, i) => {
        return this.y(this.graphData[i].salvageSavings);
      })
      .attr("height", (d, i) => {
        return (this.height / 2) - this.y(this.graphData[i].salvageSavings);
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#348aa7");

        var yearlySavings: number = parseInt(d.annualSavings) - (parseInt(d.fuelCost) + parseInt(d.operationCost));
        var currentNetSavings: number = ((parseInt(d.annualSavings) * parseInt(d.year)) + parseInt(d.salvageSavings)) - (((parseInt(d.fuelCost) + parseInt(d.operationCost)) * parseInt(d.year)) + parseInt(d.installationCost) + parseInt(d.junkCost));

        this.detailBox = d3.select("#graphInfo").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip col-6")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + d.year + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Net Yearly Savings: </strong></div>" +
          "<div class='col-md-4 yearlySavings'>$" + yearlySavings.toFixed(2) + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Cumulative Savings: </strong></div>" +
          "<div class='col-md-4 currentNetSavings'>$" + currentNetSavings.toFixed(2) + " " + "</div>" +
          "</div>"
          )
          .style("position", "absolute")
          .style("left", "50%")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "16px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        if (yearlySavings == 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (yearlySavings < 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (yearlySavings > 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        if (currentNetSavings == 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings < 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings > 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#90bfcf")
        d3.select('app-cash-flow-diagram').selectAll('.d3-tip')
          .transition()
          .style('opacity', 0)
          .remove();
      });


    //fuel cost bars
    this.svg.selectAll("bar")
      .data(this.graphData)
      .enter().append("rect")
      .style("fill", "#ff7353")
      .attr("transform", "translate(0, " + ((this.height / 2) - this.y(this.cashFlowForm.fuelCost)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      .attr("y", (d, i) => {
        return this.y(this.graphData[i].fuelCost);
      })
      .attr("height", (d, i) => {
        return (this.height / 2) - this.y(this.graphData[i].fuelCost);
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#ba4a31");

        var yearlySavings: number = parseInt(d.annualSavings) - (parseInt(d.fuelCost) + parseInt(d.operationCost));
        var currentNetSavings: number = ((parseInt(d.annualSavings) * parseInt(d.year)) + parseInt(d.salvageSavings)) - (((parseInt(d.fuelCost) + parseInt(d.operationCost)) * parseInt(d.year)) + parseInt(d.installationCost) + parseInt(d.junkCost));

        this.detailBox = d3.select("#graphInfo").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip col-6")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + d.year + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Net Yearly Savings: </strong></div>" +
          "<div class='col-md-4 yearlySavings'>$" + yearlySavings.toFixed(2) + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Cumulative Savings: </strong></div>" +
          "<div class='col-md-4 currentNetSavings'>$" + currentNetSavings.toFixed(2) + " " + "</div>" +
          "</div>"
          )
          .style("position", "absolute")
          .style("left", "50%")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "16px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        if (yearlySavings == 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (yearlySavings < 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (yearlySavings > 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        if (currentNetSavings == 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings < 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings > 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }
        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#ff7353");

        d3.select('app-cash-flow-diagram').selectAll('.d3-tip')
          .transition()
          .style('opacity', 0)
          .remove();
      });


    //operation cost bars
    this.svg.selectAll("bar")
      .data(this.graphData)
      .enter().append("rect")
      .style("fill", "#fed02f")
      .attr("transform", "translate(0," + ((this.height / 2) - this.y(this.cashFlowForm.operationCost + this.cashFlowForm.fuelCost)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      .attr("y", (d, i) => {
        return this.y(this.graphData[i].operationCost);
      })
      .attr("height", (d, i) => {
        return (this.height / 2) - this.y(this.graphData[i].operationCost);
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#b99101");

        var yearlySavings: number = parseInt(d.annualSavings) - (parseInt(d.fuelCost) + parseInt(d.operationCost));
        var currentNetSavings: number = ((parseInt(d.annualSavings) * parseInt(d.year)) + parseInt(d.salvageSavings)) - (((parseInt(d.fuelCost) + parseInt(d.operationCost)) * parseInt(d.year)) + parseInt(d.installationCost) + parseInt(d.junkCost));

        this.detailBox = d3.select("#graphInfo").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip col-6")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + d.year + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Net Yearly Savings: </strong></div>" +
          "<div class='col-md-4 yearlySavings'>$" + yearlySavings.toFixed(2) + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Cumulative Savings: </strong></div>" +
          "<div class='col-md-4 currentNetSavings'>$" + currentNetSavings.toFixed(2) + " " + "</div>" +
          "</div>"
          )
          .style("position", "absolute")
          .style("left", "50%")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "16px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        if (yearlySavings == 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (yearlySavings < 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (yearlySavings > 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        if (currentNetSavings == 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings < 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings > 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }
        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#fed02f");

        d3.select('app-cash-flow-diagram').selectAll('.d3-tip')
          .transition()
          .style('opacity', 0)
          .remove();
      })


    //installation cost bar
    this.svg.selectAll("bar")
      .data(this.graphData)
      .enter().append("rect")
      .style("fill", "#FF3842")
      .attr("transform", "translate(0 ," + ((this.height / 2) - this.y(this.cashFlowForm.operationCost + this.cashFlowForm.fuelCost + this.cashFlowForm.installationCost)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      .attr("y", (d, i) => {
        if (i === 0) {
          return this.y(this.cashFlowForm.installationCost);
        }
      })
      .attr("height", (d, i) => {
        if (i === 0) {
          return (this.height / 2) - this.y(this.cashFlowForm.installationCost);
        }
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#A30810");

        var yearlySavings: number = parseInt(d.annualSavings) - (parseInt(d.fuelCost) + parseInt(d.operationCost));
        var currentNetSavings: number = ((parseInt(d.annualSavings) * parseInt(d.year)) + parseInt(d.salvageSavings)) - (((parseInt(d.fuelCost) + parseInt(d.operationCost)) * parseInt(d.year)) + parseInt(d.installationCost) + parseInt(d.junkCost));

        this.detailBox = d3.select("#graphInfo").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip col-6")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + d.year + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Net Yearly Savings: </strong></div>" +
          "<div class='col-md-4 yearlySavings'>$" + yearlySavings.toFixed(2) + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Cumulative Savings: </strong></div>" +
          "<div class='col-md-4 currentNetSavings'>$" + currentNetSavings.toFixed(2) + " " + "</div>" +
          "</div>"
          )
          .style("position", "absolute")
          .style("left", "50%")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "16px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        if (yearlySavings == 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (yearlySavings < 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (yearlySavings > 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        if (currentNetSavings == 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings < 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings > 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }
        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#FF3842");

        d3.select('app-cash-flow-diagram').selectAll('.d3-tip')
          .transition()
          .style('opacity', 0)
          .remove();
      });


    //disposal bar
    this.svg.selectAll("bar")
      .data(this.graphData)
      .enter().append("rect")
      .style("fill", "#C6A2D6")
      .attr("transform", "translate(0 ," + ((this.height / 2) - this.y(this.cashFlowForm.operationCost + this.cashFlowForm.fuelCost + this.cashFlowForm.junkCost)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      .attr("y", (d, i) => {
        if (i === this.graphData.length - 1) {
          return this.y(this.cashFlowForm.junkCost);
        }
      })
      .attr("height", (d, i) => {
        if (i === this.graphData.length - 1) {
          return (this.height / 2) - this.y(this.cashFlowForm.junkCost);
        }
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#9975A9");

        var yearlySavings: number = parseInt(d.annualSavings) - (parseInt(d.fuelCost) + parseInt(d.operationCost));
        var currentNetSavings: number = ((parseInt(d.annualSavings) * parseInt(d.year)) + parseInt(d.salvageSavings)) - (((parseInt(d.fuelCost) + parseInt(d.operationCost)) * parseInt(d.year)) + parseInt(d.installationCost) + parseInt(d.junkCost));

        this.detailBox = d3.select("#graphInfo").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip col-6")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + d.year + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Net Yearly Savings: </strong></div>" +
          "<div class='col-md-4 yearlySavings'>$" + yearlySavings.toFixed(2) + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-8'><strong>Cumulative Savings: </strong></div>" +
          "<div class='col-md-4 currentNetSavings'>$" + currentNetSavings.toFixed(2) + " " + "</div>" +
          "</div>"
          )
          .style("position", "absolute")
          .style("left", "50%")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "16px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");

        if (yearlySavings == 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (yearlySavings < 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (yearlySavings > 0) {
          d3.selectAll(".yearlySavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }

        if (currentNetSavings == 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "orange")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings < 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "red")
            .style("font-weight", "bold");
        }
        else if (currentNetSavings > 0) {
          d3.selectAll(".currentNetSavings")
            .style("color", "green")
            .style("font-weight", "bold");
        }
        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#C6A2D6");
        d3.select('app-cash-flow-diagram').selectAll('.d3-tip')
          .transition()
          .style('opacity', 0)
          .remove();
      });


    this.xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (this.height / 2) + ")")
      .call(this.xAxis)
      .style("stroke-width", "2px")
      .selectAll('text')
      .style("text-anchor", "start")
      .style("font-size", "13px")
      .style("fill", "black")
      .attr("dy", "12px");


    this.svg.append("text")
      .attr("transform", "translate(" + (this.width / 2) + ", " + (this.height + this.margin.top) + ")")
      .style("text-anchor", "middle")
      .style("opacity", 1)
      .text("Year");


    this.yAxis = this.svg.append('g')
      .attr("class", "y axis")
      .call(this.yAxis)
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("font-size", "13px");


    var ticks = d3.selectAll(".x .tick text");

    if (this.cashFlowForm.lifeYears >= 30) {
      ticks.attr("class", function (d, i) {
        if (i % 3 != 0) {
          d3.select(this).remove();
        }
      });
    }
    else if (this.cashFlowForm.lifeYears >= 20) {
      ticks.attr("class", function (d, i) {
        if (i % 2 != 0) {
          d3.select(this).remove();
        }
      });
    }
  }
}
