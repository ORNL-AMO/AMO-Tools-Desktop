import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, ChangeDetectorRef, KeyValueDiffers, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { EnrichmentInput, EnrichmentInputData } from '../../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../../shared/models/settings';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { SimpleChart, TraceCoordinates } from '../../../../shared/models/plotting';
import * as Plotly from 'plotly.js';
import { O2EnrichmentService, DisplayPoint } from '../o2-enrichment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enrichment-graph',
  templateUrl: './enrichment-graph.component.html',
  styleUrls: ['./enrichment-graph.component.css']
})
export class EnrichmentGraphComponent implements OnInit {

  @Input()
  settings: Settings;

  // DOM
  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';

  // Graph Data
  selectedDataPoints: Array<DisplayPoint>;
  defaultSelectedPointsData: Array<DisplayPoint>;
  enrichmentChart: SimpleChart;
  enrichmentInputsSub: Subscription;
  enrichmentInputs: Array<EnrichmentInput>;

  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  constructor(private o2EnrichmentService: O2EnrichmentService,
    private cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.triggerInitialResize();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.enrichmentInputsSub.unsubscribe();
  }

  initSubscriptions() {
    this.enrichmentInputsSub = this.o2EnrichmentService.enrichmentInputs.subscribe(inputs => {
      if (inputs) {
        this.enrichmentInputs = this.o2EnrichmentService.enrichmentInputs.getValue();
        let resetData = this.o2EnrichmentService.resetData.getValue();
        if (this.enrichmentChart && !resetData) {
          this.updateChart();
        } else {
          this.initRenderChart();
        }
      }
    });
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      this.initRenderChart(true);
    }, 25)
  }

  resizeGraph() {
    let expandedChart = this.ngChartContainer.nativeElement;
    if (expandedChart) {
      if (this.expanded) {
        this.currentChartId = this.expandedChartId;
      }
      else {
        this.currentChartId = this.tabPanelChartId;
      }
      this.initRenderChart();
    }
  }

  save() {
    this.o2EnrichmentService.enrichmentChart.next(this.enrichmentChart);
    this.o2EnrichmentService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart(isInitResize = false) {
    Plotly.purge(this.currentChartId);
    this.initChartSetup();
    this.setTraces();

    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    Plotly.newPlot(this.currentChartId, this.enrichmentChart.data, chartLayout, this.enrichmentChart.config)
      .then(chart => {
        chart.on('plotly_hover', hoverData => {
          this.displayHoverGroupData(hoverData);
        });
        chart.on('plotly_unhover', unhoverData => {
          this.removeHoverGroupData();
        });
      });
    this.save();
  }

  initChartSetup() {
    this.o2EnrichmentService.initChartData();
    this.enrichmentInputs = this.o2EnrichmentService.enrichmentInputs.getValue();
    this.enrichmentChart = this.o2EnrichmentService.enrichmentChart.getValue();
    this.selectedDataPoints = this.o2EnrichmentService.selectedDataPoints.getValue();
  }

  updateChart() {
    this.updateTraces();
    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    Plotly.update(this.currentChartId, this.enrichmentChart.data, chartLayout);
    this.save();
  }

  setTraces() {
    this.enrichmentInputs.forEach((enrichmentInput: EnrichmentInput, index) => {
      let currentColor = this.getNextColor();
      // Line trace
      let graphData: TraceCoordinates = this.o2EnrichmentService.getGraphData(this.settings, enrichmentInput.inputData);
      let lineTrace = this.o2EnrichmentService.getLineTrace();
      lineTrace.x = graphData.x;
      lineTrace.y = graphData.y;
      lineTrace.line.color = currentColor;
      
      // Point trace
      let outputs = this.o2EnrichmentService.enrichmentOutputs.getValue();
      let fuelSavings = outputs[index].outputData.fuelSavings;
      let displayPoint: DisplayPoint = {
        name: enrichmentInput.inputData.name,
        pointColor: currentColor,
        pointX: enrichmentInput.inputData.o2CombAir,
        pointY: fuelSavings,
        combustionTemp: enrichmentInput.inputData.combAirTemp,
        flueOxygen: enrichmentInput.inputData.o2FlueGas,
        fuelTemp: enrichmentInput.inputData.flueGasTemp
      }
      let pointTrace = this.o2EnrichmentService.getPointTrace(displayPoint);
      pointTrace.marker.color = currentColor;
      pointTrace.marker.line.color = currentColor;

      if (index == 0) {
        lineTrace.line.color = "#000";
        pointTrace.marker.color = 'rgba(0, 0, 0, 0)';
        pointTrace.marker.line.color = 'rgba(0, 0, 0, .6)';
        displayPoint.pointColor = "#000";
      }
      
      this.enrichmentChart.data.push(lineTrace, pointTrace);
      this.selectedDataPoints.push(displayPoint);
    });
    this.enrichmentChart.inputCount = this.enrichmentInputs.length;
  }

  updateTraces() {
    let addingTraces: boolean = this.enrichmentInputs.length > this.enrichmentChart.inputCount;
    if (this.enrichmentChart.removeIndex != undefined) {
      // Each input is represented by a pair of traces(line and point). 
      // Ex. Add input index to itself to find the line in enrichmentChart.data (add 1 for point)
      let index = this.enrichmentChart.removeIndex;
      let lineIndexOffset: number = index + index;
      this.enrichmentChart.data.splice(lineIndexOffset, 2);
      this.selectedDataPoints.splice(index, 1);
      this.enrichmentChart.removeIndex = undefined;
    }
    this.enrichmentInputs.forEach((enrichmentInput: EnrichmentInput, index) => {
      let currentColor = this.getNextColor();
      let isNewTrace: boolean = false;
      if (addingTraces) {
        let offset = this.enrichmentInputs.length - this.enrichmentChart.inputCount;
        let newTraceCount = Array.from(Array(offset).keys())
        if (newTraceCount.includes(index - 1)) {
          isNewTrace = true;
        }
      }
      let lineIndex = index + index;
      let pointIndex = lineIndex + 1;
      let lineTraceColor;
      let pointOutlineColor;
      let pointColor;
      // Get existing colors
      if (this.enrichmentChart.data[lineIndex]) {
        lineTraceColor = this.enrichmentChart.data[lineIndex].line.color;
        pointOutlineColor = this.enrichmentChart.data[pointIndex].marker.line.color;
        pointColor = this.enrichmentChart.data[pointIndex].marker.color;
      }

      // Line trace
      let graphData: TraceCoordinates = this.o2EnrichmentService.getGraphData(this.settings, enrichmentInput.inputData);
      let lineTrace = this.o2EnrichmentService.getLineTrace();
      lineTrace.x = graphData.x;
      lineTrace.y = graphData.y;
      lineTrace.line.color = lineTraceColor || currentColor;
      
      // Point trace
      let outputs = this.o2EnrichmentService.enrichmentOutputs.getValue();
      let fuelSavings = outputs[index].outputData.fuelSavings;

      let displayPoint: DisplayPoint = {
        name: enrichmentInput.inputData.name,
        pointColor: pointColor || currentColor,
        pointX: enrichmentInput.inputData.o2CombAir,
        pointY: fuelSavings,
        combustionTemp: enrichmentInput.inputData.combAirTemp,
        flueOxygen: enrichmentInput.inputData.o2FlueGas,
        fuelTemp: enrichmentInput.inputData.flueGasTemp
      };
      let pointTrace = this.o2EnrichmentService.getPointTrace(displayPoint);
      pointTrace.marker.color = pointColor || currentColor;
      pointTrace.marker.line.color = pointOutlineColor || currentColor;
      
      this.enrichmentChart.data[lineIndex] = lineTrace;
      this.enrichmentChart.data[pointIndex] = pointTrace;

      if (isNewTrace) {
        this.selectedDataPoints.push(displayPoint);
        isNewTrace = false;
      } else {
        this.selectedDataPoints.map((point, i) => {
          if (i == index) {
            point.combustionTemp = displayPoint.combustionTemp;
            point.fuelTemp = displayPoint.fuelTemp;
            point.flueOxygen = displayPoint.flueOxygen;
          }
        })
      }
    });
    this.enrichmentChart.inputCount = this.enrichmentInputs.length;
  }

  getNextColor(): string {
    return graphColors[(this.enrichmentChart.data.length + 1) % graphColors.length];
  }

  displayHoverGroupData(hoverEventData) {
    let hoverIndex = hoverEventData.points[0].pointIndex;
    // Save initial point data - assign on removeHoverGroupData
    this.defaultSelectedPointsData = JSON.parse(JSON.stringify(this.selectedDataPoints));
    this.selectedDataPoints.forEach((line, index) => {
      let splineTraceIndex = index + index;

      if (hoverIndex != 0) {
        line.pointX = Number(this.enrichmentChart.data[splineTraceIndex].x[hoverIndex]);
        line.pointY = Number(this.enrichmentChart.data[splineTraceIndex].y[hoverIndex]);
      } else {
        // Hovering over trace marker - assign x,y directly
        line.pointX = Number(hoverEventData.points[0].x);
        line.pointY = Number(hoverEventData.points[0].y);
      }
    });
    this.cd.detectChanges();
  }

  removeHoverGroupData() {
    this.selectedDataPoints = this.defaultSelectedPointsData;
    this.cd.detectChanges();
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
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

  toggleGrid() {
    let showingGridX: boolean = this.enrichmentChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.enrichmentChart.layout.yaxis.showgrid;
    this.enrichmentChart.layout.xaxis.showgrid = !showingGridX;
    this.enrichmentChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }


}
