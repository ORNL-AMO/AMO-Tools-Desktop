import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CashFlowResults } from '../cash-flow';
import { CashFlowForm } from '../cash-flow';
import * as d3 from 'd3';
import * as c3 from 'c3';
import { CashFlowService } from '../cash-flow.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { Subscription } from '../../../../../../node_modules/rxjs';


@Component({
  selector: 'app-cash-flow-diagram',
  templateUrl: './cash-flow-diagram.component.html',
  styleUrls: ['./cash-flow-diagram.component.css']
})
export class CashFlowDiagramComponent implements OnInit {
  @Input()
  toggleCalculate: boolean;
  @Input()
  cashFlowResults: CashFlowResults;
  @Input()
  cashFlowForm: CashFlowForm;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  @ViewChild("ngChartContainer") ngChartContainer: ElementRef;
  @ViewChild("ngChart") ngChart: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
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

  //booleans for tooltip
  hoverBtnExport: boolean = false;
  displayExportTooltip: boolean = false;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;

  //add this boolean to keep track if graph has been expanded
  expanded: boolean = false;
  calcSub: Subscription;
  constructor(private cashFlowService: CashFlowService, private svgToPngService: SvgToPngService) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    setTimeout(() => {
    this.chartContainerWidth = this.ngChartContainer.nativeElement.clientWidth;
    this.chartContainerHeight = 500;
    this.graphData = new Array<any>();
    this.compileGraphData();
    this.resizeGraph();
    }, 50)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleCalculate) {
        this.compileGraphData();
        this.updateGraph();
      }
    } else {
      this.firstChange = false;
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

  // ========== export/gridline tooltip functions ==========
  // if you get a large angular error, make sure to add SimpleTooltipComponent to the imports of the calculator's module
  // for example, check motor-performance-graph.module.ts
  initTooltip(btnType: string) {

    if (btnType == 'btnExportChart') {
      this.hoverBtnExport = true;
    }
    else if (btnType == 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    else if (btnType == 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType == 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 700);
  }

  hideTooltip(btnType: string) {

    if (btnType == 'btnExportChart') {
      this.hoverBtnExport = false;
      this.displayExportTooltip = false;
    }
    else if (btnType == 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
    else if (btnType == 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType == 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
  }

  checkHover(btnType: string) {
    if (btnType == 'btnExportChart') {
      if (this.hoverBtnExport) {
        this.displayExportTooltip = true;
      }
      else {
        this.displayExportTooltip = false;
      }
    }
    else if (btnType == 'btnGridLines') {
      if (this.hoverBtnGridLines) {
        this.displayGridLinesTooltip = true;
      }
      else {
        this.displayGridLinesTooltip = false;
      }
    }
    else if (btnType == 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
      }
    }
    else if (btnType == 'btnCollapseChart') {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      }
      else {
        this.displayCollapseTooltip = false;
      }
    }
  }
  // ========== end tooltip functions ==========



  resizeGraph() {
    //need to update curveGraph to grab a new containing element 'panelChartContainer'
    //make sure to update html container in the graph component as well
    let curveGraph = this.ngChartContainer.nativeElement;
    if (curveGraph) {
      if (!this.expanded) {
        this.canvasWidth = curveGraph.clientWidth;
        this.canvasHeight = this.canvasWidth * (9 / 10);
      }
      else {
        this.canvasWidth = curveGraph.clientWidth * 0.9;
        this.canvasHeight = curveGraph.clientHeight * 0.8;
      }
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
        width: this.canvasWidth,
        height: this.height
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

  //========= chart resize functions ==========
  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 200);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 200);
  }
  //========== end chart resize functions ==========
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code == 'Escape') {
        this.contractChart();
      }
    }
  }
}