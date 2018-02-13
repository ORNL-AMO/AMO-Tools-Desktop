import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CashFlowResults } from '../cash-flow';
import { CashFlowForm } from '../cash-flow';
import * as d3 from 'd3';
import * as c3 from 'c3';
import { CashFlowService } from '../cash-flow.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';


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

  @ViewChild("ngChart") ngChart: ElementRef;
  exportName: string;

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
  chartContainerWidth: number;
  chartContainerHeight: number;


  chart: any;
  annualSavings: Array<any>;
  salvageSavings: Array<any>;
  operationCost: Array<any>;
  fuelCost: Array<any>;
  junkCost: Array<any>;
  installationCost: Array<any>;
  years: Array<any>;


  constructor(private cashFlowService: CashFlowService, private windowRefService: WindowRefService, private svgToPngService: SvgToPngService) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("ngOnChanges()");
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
    console.log("this.window.innerWidth = " + this.window.innerWidth);
    // this.window.onresize = () => { this.resizeGraph() };
    // this.resizeGraph();

    this.chartContainerWidth = this.window.innerWidth * 0.38;
    this.chartContainerHeight = 500;

    this.graphData = new Array<any>();
    this.compileGraphData();
    this.makeGraph();

    this.cashFlowService.calculate.subscribe(val => {
      this.compileGraphData();
      this.updateGraph();
      // this.makeGraph();
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
    this.annualSavings = new Array<any>();
    this.operationCost = new Array<any>();
    this.junkCost = new Array<any>();
    this.salvageSavings = new Array<any>();
    this.fuelCost = new Array<any>();
    this.installationCost = new Array<any>();
    this.years = new Array<any>();

    this.annualSavings.push("Energy Savings");
    this.operationCost.push("Operation Cost");
    this.junkCost.push("Disposal Cost");
    this.fuelCost.push("Fuel Cost");
    this.installationCost.push("Installation Cost");
    this.salvageSavings.push("Salvage");

    for (let i: number = 0; i <= this.cashFlowForm.lifeYears; i++) {
      this.annualSavings.push(this.cashFlowForm.energySavings);
      this.operationCost.push(0 - this.cashFlowForm.operationCost);
      this.fuelCost.push(0 - this.cashFlowForm.fuelCost);
      this.years.push(i);
      if (i === 0) {
        this.installationCost.push(0 - this.cashFlowForm.installationCost);
      }
      else {
        this.installationCost.push(0);
      }
      if (i === (this.cashFlowForm.lifeYears)) {
        this.salvageSavings.push(this.cashFlowForm.salvageInput);
        this.junkCost.push(0 - this.cashFlowForm.junkCost);
      }
      else {
        this.salvageSavings.push(0);
        this.junkCost.push(0);
      }
    }

    this.graphData.push(this.salvageSavings);
    this.graphData.push(this.fuelCost);
    this.graphData.push(this.annualSavings);
    this.graphData.push(this.operationCost);
    this.graphData.push(this.installationCost);
    this.graphData.push(this.junkCost);

    console.log("this.graphData.length = " + this.graphData.length);
  }

  updateGraph() {

    if (this.chart) {
      this.chart.load({
        columns: this.graphData,
        type: 'bar'
      });
    }
  }


  makeGraph() {
    console.log("making graph, graphData.length = " + this.graphData.length);

    let years = this.years;
    let salvageSavings = this.cashFlowForm.salvageInput;
    let annualSavings = this.cashFlowForm.energySavings;
    let fuelCost = this.cashFlowForm.fuelCost;
    let operationCost = this.cashFlowForm.operationCost;
    let installationCost = this.cashFlowForm.installationCost;
    let junkCost = this.cashFlowForm.junkCost;


    d3.select(this.ngChart.nativeElement).selectAll('svg').remove();

    this.chart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: this.graphData,
        type: 'bar',
        groups: [
          ['Energy Savings', 'Operation Cost', 'Fuel Cost', 'Installation Cost', 'Salvage', 'Disposal Cost']
        ]
      },
      axis: {
        x: {
          label: {
            text: "Year"
          }
        },
        y: {
          label: {
            text: "Value ($)",
            position: 'outer-middle'
          }
        }
      },
      grid: {
        y: {
          show: true
        }
      },
      size: {
        width: this.chartContainerWidth,
        height: this.chartContainerHeight
      },
      legend: {
        show: true,
        position: 'bottom'
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px; display: inline-block; white-space: nowrap;";
          let html = "<div style='" + styling + "'>"
                + "<table>"
                  + "<tr>" 
                    + "<td>" 
                      + "Net Savings: "
                    + "</td>"
                    + "<td>$" 
                      + (d[0].value + d[1].value + d[2].value + d[3].value + d[4].value + d[5].value)
                    + "</td>"
                  + "</tr>" 
                + "</table>"
              + "</div>";
           return html;
        }
      }
    });

    d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
    d3.selectAll(".c3-axis").style("fill", "none").style("stroke", "#000");
    d3.selectAll(".c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
    d3.selectAll(".c3-axis-x-label").style("fill", "#000").style("stroke", "#000");

  }

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "cash-flow-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }
}