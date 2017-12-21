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
  detailBox: any;
  axisTitle: any;

  firstChange: boolean = true;

  canvasWidth: number;
  canvasHeight: number;
  doc: any;
  window: any;

  graphData: Array<any>;


  // tmpData: Array<number> = [
  //   4,
  //   8,
  //   15,
  //   16,
  //   23,
  //   42
  // ];


  constructor(private cashFlowService: CashFlowService, private windowRefService: WindowRefService) {

  }

  ngOnInit() {
    // this.cashFlowService.calculate.subscribe(val => {
    //   // this.makeGraph();
    // });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleCalculate) {
        // if (this.checkForm()) {

        this.makeGraph();
        this.svg.style("display", null);
        // }
      }
    } else {
      this.firstChange = false;
    }
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.window.onresize = () => { this.resizeGraph() };
    this.resizeGraph();

    this.cashFlowService.calculate.subscribe(val => {
      this.makeGraph();
    });
  }


  resizeGraph() {
    console.log("resizing graph");
    let curveGraph = this.doc.getElementById('pumpCurveGraph');
    // let curveGraph = d3.select('app-cash-flow-diagram');

    if (curveGraph) {
      console.log("in curveGraph");
      // this.canvasWidth = curveGraph.clientWidth;
      this.canvasWidth = curveGraph.clientWidth;
      
      this.canvasHeight = this.canvasWidth * (7 / 10);
      // this.canvasWidth = 600;
      // this.canvasHeight = 450;

      if (this.canvasWidth < 400) {
        this.margin = { top: 10, right: 35, bottom: 50, left: 50 };
      } else {
        this.margin = { top: 20, right: 45, bottom: 75, left: 50 };
      }

      this.width = this.canvasWidth - this.margin.left - this.margin.right;
      this.height = this.canvasHeight - this.margin.top - this.margin.bottom;
      console.log("graph width = " + this.width);
      console.log("graph height = " + this.height);
      console.log("canvasWidth = " + this.canvasWidth);
      console.log("canvasHeight = " + this.canvasHeight);

      // if (this.checkForm()) {
      this.makeGraph();
      // }
    }
  }


  compileGraphData() {
    console.log("in compileGraphData()");
    this.graphData = new Array<any>();

    // for (var i: number = 0; i <= this.cashFlowForm.lifeYears; i++) {
    for (var i: number = 0; i <= this.cashFlowForm.lifeYears; i++) {

      if (i === 0) {
        // this.graphData.push(this.cashFlowForm.installationCost);
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
        // this.graphData.push(this.cashFlowForm.salvageInput - this.cashFlowForm.junkCost);
        this.graphData.push({
          year: i,
          annualSavings: this.cashFlowForm.energySavings,
          salvageSavings: this.cashFlowForm.salvageInput,
          operationCost: this.cashFlowForm.operationCost,
          fuelCost: this.cashFlowForm.fuelCost,
          junkCost: this.cashFlowForm.junkCost,
          installationCost: 0
        });
        continue;
      }

      // this.graphData.push(this.cashFlowForm.energySavings - (this.cashFlowForm.fuelCost + this.cashFlowForm.operationCost));
      this.graphData.push({
        year: i,
        annualSavings: this.cashFlowForm.energySavings,
        salvageSavings: 0,
        operationCost: this.cashFlowForm.operationCost,
        fuelCost: this.cashFlowForm.fuelCost,
        junkCost: 0,
        installationCost: 0
      });
    }
  }


  makeGraph() {
    d3.select('app-cash-flow-diagram').selectAll('svg').remove();

    // this.resizeGraph();
    this.compileGraphData();

    this.svg = d3.select('#cashFlowDiagram').append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      // .attr("width", this.width - this.margin.left - this.margin.right)      
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    this.svg.append('rect')
      .attr("id", "graph")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("fill", "#F8F9F9")
      .style("filter", "url(#drop-shadow)");

    this.x = d3.scaleLinear()
      .domain([0, this.cashFlowForm.lifeYears + 1])
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
      .scale(this.y);


    //create tooltip element
    this.detailBox = d3.select("#cashFlowDiagram").append("div")
      .attr("id", "detailBox")
      .attr("class", "d3-tip")
      .style("opacity", 0)
      .style('pointer-events', 'none');


    this.svg.select('#graph')
      .attr("width", this.width - (this.margin.left + this.margin.right))
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
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
      // .attr("transform", "translate(20," + (-(this.height / 2)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      // .attr("transform", "translate(1,0)")
      // .attr("width", this.x)
      .attr("y", (d, i) => {
        if (i === this.graphData.length - 1) {

        }
        return this.y(this.graphData[i].annualSavings);
        // return this.y(this.graphData[i].savings);
      })
      .attr("height", (d, i) => {
        return (this.height / 2) - this.y(this.graphData[i].annualSavings);
        // return (this.height / 2) - this.y(this.graphData[i].savings);
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#248232");

        this.detailBox = d3.select("#cashFlowDiagram").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + i + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Savings: </strong></div>" +
          "<div class='col-md-4'>$" + (d.annualSavings + d.salvageSavings).toFixed(2) + " </div>" +
          // "<div class='col-md-4'>$" + d.savings.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Fuel Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.fuelCost.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Operation Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.operationCost.toFixed(2) + " </div>" +
          "</div>")
          .style("position", "absolute")
          .style("width", "240px")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");
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
      // .style("fill", "#5fa469")
      .attr("transform", "translate(0, " + ((this.height / 2) - this.y(0 - this.cashFlowForm.energySavings)) + ")")
      // .attr("transform", "translate(0, " + ((this.height / 2) - this.y(this.cashFlowForm.energySavings)) + ")")
      .attr("class", "cash-flow positive-bar")
      .attr("id", (d, i) => {
        return "savings-bar-" + i;
      })
      // .attr("transform", "translate(20," + (-(this.height / 2)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      // .attr("transform", "translate(1,0)")
      // .attr("width", this.x)
      .attr("y", (d, i) => {
        return this.y(this.graphData[i].salvageSavings);
        // if (i === this.graphData.length - 1) {

        // }
        // return this.y(this.graphData[i].annualSavings);
        // return this.y(this.graphData[i].savings);
      })
      .attr("height", (d, i) => {
        return (this.height / 2) - this.y(this.graphData[i].salvageSavings);
        // return (this.height / 2) - this.y(this.graphData[i].savings);
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#348aa7");
        // .style("fill", "#248232");

        this.detailBox = d3.select("#cashFlowDiagram").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + i + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Savings: </strong></div>" +
          "<div class='col-md-4'>$" + (d.annualSavings + d.salvageSavings).toFixed(2) + " </div>" +
          // "<div class='col-md-4'>$" + d.savings.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Fuel Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.fuelCost.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Operation Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.operationCost.toFixed(2) + " </div>" +
          "</div>")
          .style("position", "absolute")
          .style("width", "240px")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");
        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#90bfcf")
        // .style("fill", "#5fa469");
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
      // .attr("transform", "translate(" + (((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears) / 2) + ", " + ((this.height / 2) - this.y(this.cashFlowForm.fuelCost)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      // .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears) / 2)
      .attr("y", (d, i) => {
        // if (i !== 0 && i !== this.graphData.length - 1) {
        return this.y(this.graphData[i].fuelCost);
        // }
      })
      .attr("height", (d, i) => {
        // if (i !== 0 && i !== this.graphData.length - 1) {
        return (this.height / 2) - this.y(this.graphData[i].fuelCost);
        // }
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#ba4a31");

        this.detailBox = d3.select("#cashFlowDiagram").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + i + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Savings: </strong></div>" +
          "<div class='col-md-4'>$" + (d.annualSavings + d.salvageSavings).toFixed(2) + " </div>" +
          // "<div class='col-md-4'>$" + d.savings.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Fuel Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.fuelCost.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Operation Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.operationCost.toFixed(2) + " </div>" +
          "</div>")
          .style("position", "absolute")
          .style("width", "240px")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");
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
      // .attr("transform", "translate(0," + ((this.height / 2) - this.y(this.cashFlowForm.operationCost)) + ")")
      .attr("x", (d, i) => {
        return this.x(this.graphData[i].year);
      })
      .attr("width", ((this.width - (this.margin.left + this.margin.right)) / this.cashFlowForm.lifeYears))
      .attr("y", (d, i) => {
        // if (i !== 0 && i !== this.graphData.length - 1) {
        // console.log("this.y(this.graphData[i].operationCost = " + this.y(this.graphData[i].operationCost));
        return this.y(this.graphData[i].operationCost);
        // }
      })
      .attr("height", (d, i) => {
        // if (i !== 0 && i !== this.graphData.length - 1) {
        return (this.height / 2) - this.y(this.graphData[i].operationCost);
        // }
      })
      .on('mouseover', function (d, i) {
        d3.select(this)
          .style("fill", "#b99101");

        this.detailBox = d3.select("#cashFlowDiagram").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + i + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Savings: </strong></div>" +
          "<div class='col-md-4'>$" + (d.annualSavings + d.salvageSavings).toFixed(2) + " </div>" +
          // "<div class='col-md-4'>$" + d.savings.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Fuel Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.fuelCost.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Operation Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.operationCost.toFixed(2) + " </div>" +
          "</div>")
          .style("position", "absolute")
          .style("width", "240px")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");
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
      // .style("fill", "#FA3C1E")
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

        this.detailBox = d3.select("#cashFlowDiagram").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + i + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Savings: </strong></div>" +
          "<div class='col-md-4'>$" + (d.annualSavings + d.salvageSavings).toFixed(2) + " </div>" +
          // "<div class='col-md-4'>$" + d.savings.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Fuel Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.fuelCost.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Operation Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.operationCost.toFixed(2) + " </div>" +
          "</div>")
          .style("position", "absolute")
          .style("width", "240px")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");
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
      .style("fill", "#FF5D17")
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
          .style("fill", "#BA4411");

        this.detailBox = d3.select("#cashFlowDiagram").append("div")
          .attr("id", "detailBox")
          .attr("class", "d3-tip")
          .style('pointer-events', 'none')
          .style("opacity", 0)
          .html(
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Year: </strong></div>" +
          "<div class='col-md-4'>" + i + " " + "</div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Savings: </strong></div>" +
          "<div class='col-md-4'>$" + (d.annualSavings + d.salvageSavings).toFixed(2) + " </div>" +
          // "<div class='col-md-4'>$" + d.savings.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Fuel Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.fuelCost.toFixed(2) + " </div>" +
          "</div>" +
          "<div class='row'>" +
          "<div class='col-md-6'><strong>Operation Cost: </strong></div>" +
          "<div class='col-md-4'>$" + d.operationCost.toFixed(2) + " </div>" +
          "</div>")
          .style("position", "absolute")
          .style("width", "240px")
          .style("text-align", "left")
          .style("padding", "10px")
          .style("font", "12px sans-serif")
          .style("background", "#ffffff")
          .style("border", "0px")
          .style("box-shadow", "0px 0px 10px 2px grey")
          .style("pointer-events", "none");
        this.detailBox.transition().style('opacity', 1);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style("fill", "#FF5D17");

        d3.select('app-cash-flow-diagram').selectAll('.d3-tip')
          .transition()
          .style('opacity', 0)
          .remove();
      });


    this.xAxis = this.svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (this.height / 2) + ")")
      // .attr("transform", "translate(20," + (this.height / 2) + ")")
      .call(this.xAxis)
      // .style("stroke-width", ".5px")
      .selectAll('text')
      .style("text-anchor", "start")
      .style("font-size", "13px")
      .style("fill", "black")
      // .attr("transform", "translate(" + (this.width / this.cashFlowForm.lifeYears) +  ",0)")
      // .attr("transform", "translate(" + (((this.width / this.cashFlowForm.lifeYears) / 2)) + ", 0)")
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


    // this.svg.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0 - this.margin.left)
    //   .attr("x", 0 - (this.height / 2))
    //   .attr("dy", "1em")
    //   .style("text-anchor", "middle")
    //   .style("opacity", 1)
    //   .text("Dollars");

    var ticks = d3.selectAll(".x .tick text");
    // ticks.attr("top", "10px");

    if (this.cashFlowForm.lifeYears >= 30) {
      console.log("tick formatting 30");
      ticks.attr("class", function (d, i) {
        if (i % 3 != 0) {
          console.log("i % 3 != 0");
          d3.select(this).remove();
        }
      });
    }
    else if (this.cashFlowForm.lifeYears >= 20) {
      console.log("tick formatting 20");
      ticks.attr("class", function (d, i) {
        if (i % 2 != 0) {
          console.log("i % 2 != 0");
          d3.select(this).remove();
        }
      });
    }
  }

  // Benefit/cost Ratio =
  //      {(Annual Energy Savings * lifetime) + salvage} /
  //      { (Installation cost + disposal) + ((O&M cost + fuel cost) * lifetime)}

  // Simple Payback = (Install cost * 12) / (Annual energy Savings)




}

//   function stackData(seriesData) {
//     let l = seriesData[0].length
//     while (l--) {
//       let posBase = 0; // positive base
//       let negBase = 0; // negative base
//
//       seriesData.forEach(function(d) {
//         d = d[l]
//         d.size = Math.abs(d.y)
//         if (d.y < 0) {
//           d.y0 = negBase
//           negBase -= d.size;
//         } else {
//           d.y0 = posBase = posBase + d.size;
//         }
//       });
//     }
//     seriesData.extent = d3.extent(
//       d3.merge(
//         d3.merge(
//           seriesData.map(function(e) {
//             return e.map(function(f) { return [f.y0, f.y0 - f.size];
//             });
//           })
//         )
//       )
//     );
//   }
//
//
// let data = [
//   [ {y: 4},  {y: 8},  {y: -5} ],
//   [ {y: 6},  {y: -3}, {y: -10} ],
//   [ {y: 10}, {y: -5}, {y: 5}  ]
// ]
//
// let h = 500;
// let w = 500;
// let margin = 20;
// let color = d3.scale.ordinal(d3.schemeCategory10);
//
// let x = d3.scale.ordinal()
//   .domain(['1', '2', '3'])
//   .rangeRoundBands([ margin, w - margin ], .1)
//
// let y = d3.scale.linear()
//   .range([h - margin, 0 + margin]);
//
// let xAxis = d3.svg.axis()
//   .scale(x)
//   .orient('bottom')
//   .tickSize(6, 0);
//
// let yAxis = d3.svg.axis()
//   .scale(y)
//   .orient('left');
//
// stackData(data);
// y.domain(data);
//
// this.svg = d3.select('body')
//   .append('svg')
//   .attr('height', h)
//   .attr('width', w)
//
// this.svg.selectAll('.series')
//   .data(data)
//   .enter()
//   .append('g')
//   .classed('series', true)
//   .style('fill', function(d, i) { return color(i);
//   })
//   .style('opacity', 0.8)
//   .selectAll('rect')
//   .data(Object)
//   .enter()
//   .append('rect')
//   .attr('x', function(d, i) { return x(x.domain()[i]) })
//   .attr('y', function(d) { return y(d.y0);
//   })
//   .attr('height', function(d) { return y(0) - y(d.size) })
//   .attr('width', x.rangeBand())
//   .on('mouseover', function() { tooltip.style('display', null); })
//   .on('mouseout', function() { tooltip.style('display', 'none'); })
//   .on('mousemove', function(d) {
//     let xPosition = d3.mouse(this)[0] - 35;
//     let yPosition = d3.mouse(this)[1] - 5;
//     tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
//     tooltip.select('text').text(d.y);
//   });
//
// console.log('y(0)', y(0));
// console.log('margin', margin);
//
// this.svg.append('g')
//   .attr('class', 'axis x')
//   .attr('transform', 'translate(0 ' + y(0) + ')')
//   .call(xAxis);
//
// this.svg.append('g')
//   .attr('class', 'axis y')
//   .attr('transform', 'translate(' + margin + ' 0)')
//   .call(yAxis);
//
//
// let tooltip = this.svg.append('g')
//   .attr('class', 'tooltip')
//   .style('display', 'none');
//
// tooltip.append('rect')
//   .attr('width', 30)
//   .attr('height', 20)
//   .style('fill', 'white')
//   .style('opacity', 0.5);
//
// tooltip.append('text')
//   .attr('x', 15)
//   .attr('dy', '1.2em')
//   .style('text-anchor', 'middle')
//   .attr('font-size', '12px')
//   .attr('font-weight', 'bold');


