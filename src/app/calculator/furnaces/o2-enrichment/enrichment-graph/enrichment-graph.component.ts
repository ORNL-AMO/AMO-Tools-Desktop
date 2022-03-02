import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { EnrichmentInput } from '../../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../../shared/models/settings';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { SimpleChart, TraceCoordinates } from '../../../../shared/models/plotting';
import { O2EnrichmentService, DisplayPoint, Axis } from '../o2-enrichment.service';
import { Subscription } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-enrichment-graph',
  templateUrl: './enrichment-graph.component.html',
  styleUrls: ['./enrichment-graph.component.css']
})
export class EnrichmentGraphComponent implements OnInit {

  @Input()
  settings: Settings;

  // DOM
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;

  dataSummaryTableString: any;

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

  initResizeCompleted: boolean = false;

  selectedAxisOptions = Array<{ display: string, value: number }>();
  selectedAxis: number = 0;
  xAxis: Axis;
  selectedAxisSub: Subscription;

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
    private plotlyService: PlotlyService
  ) {
  }

  ngOnInit() {
    this.initAxisOptions();
    this.initSubscriptions();
  }

  ngAfterViewInit(){
    this.renderChart();
    this.triggerInitialResize();
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
          this.renderChart();
        }
      }
    });
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      this.renderChart();
    }, 25)
  }


  initAxisOptions() {
    let temperatureUnit = '&#8457;';
    if (this.settings.unitsOfMeasure == 'Metric') {
      temperatureUnit = '&#8451;';
    }
    this.selectedAxisOptions = [
      { display: 'O2 in Combustion Air (%)', value: 0 },
      { display: 'Combustion Air Preheat Temperature ' + temperatureUnit, value: 1 },
      { display: 'Flue Gas Temperature ' + temperatureUnit, value: 2 },
      { display: 'O2 in Flue Gases (%)', value: 3 },
    ];
  }

  save() {
    this.o2EnrichmentService.enrichmentChart.next(this.enrichmentChart);
    this.o2EnrichmentService.selectedDataPoints.next(this.selectedDataPoints);
  }

  renderChart() {
    this.initChartSetup();
    this.setTraces();

    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.enrichmentChart.data, chartLayout, this.enrichmentChart.config)
        .then(chart => {
          chart.on('plotly_hover', hoverData => {
            this.displayHoverGroupData(hoverData);
          });
          chart.on('plotly_unhover', unhoverData => {
            this.removeHoverGroupData();
          });
        });
    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.enrichmentChart.data, chartLayout, this.enrichmentChart.config)
        .then(chart => {
          chart.on('plotly_hover', hoverData => {
            this.displayHoverGroupData(hoverData);
          });
          chart.on('plotly_unhover', unhoverData => {
            this.removeHoverGroupData();
          });
        });

    }
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
    if (this.expanded) {
      this.plotlyService.update(this.expandedChartDiv.nativeElement, this.enrichmentChart.data, chartLayout);
    } else {
      this.plotlyService.update(this.panelChartDiv.nativeElement, this.enrichmentChart.data, chartLayout);
    }
    this.save();
  }

  setAxisAndUpdate() {
    this.updateTraces();
    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    chartLayout.xaxis.range = [];
    chartLayout.xaxis.autorange = true;
    if (this.expanded) {
      this.plotlyService.update(this.expandedChartDiv.nativeElement, this.enrichmentChart.data, chartLayout);
    } else {
      this.plotlyService.update(this.panelChartDiv.nativeElement, this.enrichmentChart.data, chartLayout);
    }
    this.save();
  }

  setTraces() {
    this.enrichmentInputs.forEach((enrichmentInput: EnrichmentInput, index) => {
      let currentColor = this.getNextColor();
      // Line trace
      let graphData: { data: TraceCoordinates, xAxis: Axis } = this.o2EnrichmentService.getGraphData(this.settings, enrichmentInput.inputData, this.selectedAxis);
      this.xAxis = graphData.xAxis;
      let lineTrace = this.o2EnrichmentService.getLineTrace();
      lineTrace.x = graphData.data.x;
      lineTrace.y = graphData.data.y;
      lineTrace.name = enrichmentInput.inputData.name;
      lineTrace.hovertemplate = this.xAxis.hoverTemplate;
      lineTrace.line.color = currentColor;

      // Point trace
      let outputs = this.o2EnrichmentService.enrichmentOutputs.getValue();
      let fuelSavings = outputs[index].outputData.fuelSavings;
      let displayPoint: DisplayPoint = {
        name: enrichmentInput.inputData.name,
        pointColor: currentColor,
        pointX: enrichmentInput.inputData[this.xAxis.pointPropertyName],
        pointY: fuelSavings,
        combAirTemp: enrichmentInput.inputData.combAirTemp,
        o2FlueGas: enrichmentInput.inputData.o2FlueGas,
        flueGasTemp: enrichmentInput.inputData.flueGasTemp
      };
      let pointTrace = this.o2EnrichmentService.getPointTrace(displayPoint);
      pointTrace.marker.color = currentColor;
      pointTrace.marker.line.color = currentColor;
      pointTrace.hovertemplate = this.xAxis.hoverTemplate;


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
      let graphData: { data: TraceCoordinates, xAxis: Axis } = this.o2EnrichmentService.getGraphData(this.settings, enrichmentInput.inputData, this.selectedAxis);
      this.xAxis = graphData.xAxis;
      let lineTrace = this.o2EnrichmentService.getLineTrace();
      lineTrace.x = graphData.data.x;
      lineTrace.y = graphData.data.y;
      lineTrace.name = enrichmentInput.inputData.name;
      lineTrace.hovertemplate = this.xAxis.hoverTemplate;
      lineTrace.line.color = lineTraceColor || currentColor;

      // Point trace
      let outputs = this.o2EnrichmentService.enrichmentOutputs.getValue();
      let fuelSavings = outputs[index].outputData.fuelSavings;

      let displayPoint: DisplayPoint = {
        name: enrichmentInput.inputData.name,
        pointColor: pointColor || currentColor,
        pointX: enrichmentInput.inputData[this.xAxis.pointPropertyName],
        pointY: fuelSavings,
        combAirTemp: enrichmentInput.inputData.combAirTemp,
        o2FlueGas: enrichmentInput.inputData.o2FlueGas,
        flueGasTemp: enrichmentInput.inputData.flueGasTemp
      };
      let pointTrace = this.o2EnrichmentService.getPointTrace(displayPoint);
      pointTrace.marker.color = pointColor || currentColor;
      pointTrace.marker.line.color = pointOutlineColor || currentColor;
      pointTrace.hovertemplate = this.xAxis.hoverTemplate;

      this.enrichmentChart.data[lineIndex] = lineTrace;
      this.enrichmentChart.data[pointIndex] = pointTrace;

      if (isNewTrace) {
        this.selectedDataPoints.push(displayPoint);
        isNewTrace = false;
      } else {
        this.selectedDataPoints.map((point, i) => {
          if (i == index) {
            point.combAirTemp = displayPoint.combAirTemp;
            point.o2FlueGas = displayPoint.o2FlueGas;
            point.flueGasTemp = displayPoint.flueGasTemp;
            point.pointY = displayPoint.pointY;
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
        line[this.xAxis.pointPropertyName] = Number(this.enrichmentChart.data[splineTraceIndex].x[hoverIndex]);
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
      this.renderChart();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.renderChart();
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
