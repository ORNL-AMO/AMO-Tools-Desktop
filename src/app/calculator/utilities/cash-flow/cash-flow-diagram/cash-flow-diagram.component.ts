import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CashFlowResults } from '../cash-flow';
import { CashFlowForm } from '../cash-flow';
import { CashFlowService } from '../cash-flow.service';
import { TraceData, SimpleChart } from '../../../../shared/models/plotting';
import { PlotlyService } from 'angular-plotly.js';



@Component({
    selector: 'app-cash-flow-diagram',
    templateUrl: './cash-flow-diagram.component.html',
    styleUrls: ['./cash-flow-diagram.component.css'],
    standalone: false
})
export class CashFlowDiagramComponent implements OnInit {
  @Input()
  toggleCalculate: boolean;
  @Input()
  cashFlowResults: CashFlowResults;
  @Input()
  cashFlowForm: CashFlowForm;

  @ViewChild("expandedChartDiv", { static: false })  expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false })  panelChartDiv: ElementRef;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;


  
  expanded: boolean;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  hoverBtnGridLines: any;
  displayGridLinesTooltip: boolean;
  displayCollapseTooltip: boolean;
  hoverBtnExport: boolean;

  cashFlowChart: SimpleChart;
  cashFlowData: Array<any>;
  years: Array<any>;
  constructor(private cashFlowService: CashFlowService,
    private plotlyService: PlotlyService) {}

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.initRenderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
      if (changes.toggleCalculate && !changes.toggleCalculate.firstChange) {
        this.initRenderChart();
      }
  }

  initRenderChart() {
    this.cashFlowChart = this.cashFlowService.getEmptyChart();
    
    this.compileGraphData();
    let chartTraces = this.buildTraces();
    this.cashFlowChart.data = chartTraces;
    let chartLayout = JSON.parse(JSON.stringify(this.cashFlowChart.layout));
    if(this.expanded && this.expandedChartDiv){
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.cashFlowChart.data, chartLayout, this.cashFlowChart.config);
    }else if(!this.expanded && this.panelChartDiv){
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.cashFlowChart.data, chartLayout, this.cashFlowChart.config);
    }
  }

  buildTraces() {
    let traces = Array<TraceData>();
    this.cashFlowData.forEach((expense: Array<any> )=> {
      let expenseTrace: TraceData = this.cashFlowService.getTrace(expense.shift(), expense.slice(0), this.years);
      traces.push(expenseTrace);
    });
    return traces;
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

  compileGraphData() {
    this.cashFlowData = new Array<any>();
    let annualSavings = new Array<any>();
    let operationCost = new Array<any>();
    let junkCost = new Array<any>();
    let salvageSavings = new Array<any>();
    let otherCost = new Array<any>();
    let installationCost = new Array<any>();
    this.years = new Array<any>();

    annualSavings.push("Energy Savings");
    operationCost.push("Operation Cost");
    junkCost.push("Disposal Cost");
    otherCost.push("Fuel Cost");
    installationCost.push("Installation Cost");
    salvageSavings.push("Salvage");

    for (let i: number = 0; i <= this.cashFlowForm.lifeYears; i++) {
      annualSavings.push(this.cashFlowForm.energySavings);
      operationCost.push(0 - this.cashFlowForm.operationCost);
      otherCost.push(0 - this.cashFlowForm.otherCost);
      this.years.push(`${i}`);
      if (i === 0) {
        installationCost.push(0 - this.cashFlowForm.installationCost);
      }
      else {
        installationCost.push(0);
      }
      if (i === (this.cashFlowForm.lifeYears)) {
        salvageSavings.push(this.cashFlowForm.salvageInput);
        junkCost.push(0 - this.cashFlowForm.junkCost);
      }
      else {
        salvageSavings.push(0);
        junkCost.push(0);
      }
    }
    this.cashFlowData.push(salvageSavings, otherCost, annualSavings, operationCost, installationCost, junkCost);
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.initRenderChart();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.initRenderChart();
    }, 100);
  }

  hideTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
  }

  initTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 200);
  }

  checkHover(btnType: string) {
    if (btnType === 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
      }
    }
    else if (btnType === 'btnGridLines') {
      if (this.hoverBtnGridLines) {
        this.displayGridLinesTooltip = true;
      }
      else {
        this.displayGridLinesTooltip = false;
      }
    }
    else if (btnType === 'btnCollapseChart') {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      }
      else {
        this.displayCollapseTooltip = false;
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }
}
